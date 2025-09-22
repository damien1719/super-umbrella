import type { Request, Response, NextFunction } from "express";
import { BilanService } from "../services/bilan.service";
import { ProfileService } from "../services/profile.service";
// No HTML sanitization needed for JSON editor state
import { generateText } from "../services/ai/generate.service";
import { promptConfigs } from "../services/ai/prompts/promptconfig";
import { refineSelection } from "../services/ai/refineSelection.service";
import { concludeBilan } from "../services/ai/conclude.service";
import { BilanTypeService } from "../services/bilanType.service";
import { BilanSectionInstanceService } from "../services/bilanSectionInstance.service";
import { prisma } from "../prisma";
import { hydrateLayout } from "../services/bilan/composeLayout";
import { answersToMarkdown } from "../utils/answersMarkdown";
import { generateFromTemplate as generateFromTemplateSvc } from "../services/ai/generateFromTemplate";
import { buildSectionPromptContext } from "../services/ai/promptContext";
import { AnchorService, type AnchorSpecification } from "../services/ai/anchor.service";
import { PostProcessor } from "../services/ai/postProcessor";
import {
  lexicalStateToJSON,
  markdownToLexicalState,
  normalizeLexicalEditorState,
} from "../utils/lexicalEditorState";
import type { Question as SectionQuestion } from "../utils/answersMarkdown";
import { LexicalAssembler } from "../services/bilan/lexicalAssembler";
import { buildInstanceNotesContext } from "../services/ai/preprocessSectionNotes.service";


export const BilanController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, ...data } = req.body
      const bilan = await BilanService.create(req.user.id, patientId, data)
      res.status(201).json(bilan)
    } catch (e) {
      next(e)
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await BilanService.list(req.user.id));
    } catch (e) {
      next(e);
    }
  },

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.get(req.user.id, req.params.bilanId);
      if (!bilan) {
        res.sendStatus(404);
        return;
      }
      res.json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.update(
        req.user.id,
        req.params.bilanId,
        req.body,
      );
      res.json(bilan);
    } catch (e) {
      next(e);
    }
  },

  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      // Inputs
      const sectionId = typeof req.body.sectionId === 'string' ? req.body.sectionId : undefined;
      const instanceId = typeof req.body.instanceId === 'string' ? req.body.instanceId : undefined;
      const sectionKeyBody = req.body.section as keyof typeof promptConfigs | undefined;
      const answersPayload = req.body.answers;
      const answersObject =
        answersPayload && typeof answersPayload === 'object' && !Array.isArray(answersPayload)
          ? (answersPayload as Record<string, unknown>)
          : {};
      const rawNotes = typeof req.body.rawNotes === 'string' ? req.body.rawNotes : undefined;
      const stylePrompt = typeof req.body.stylePrompt === 'string' ? req.body.stylePrompt : undefined;
      const examples = Array.isArray(req.body.examples) ? req.body.examples : [];
      const imageBase64 = typeof req.body.imageBase64 === 'string' ? req.body.imageBase64 : undefined;
      // Resolve Section details if sectionId is provided
      let sectionRecord:
        | { schema?: unknown; templateRefId?: string | null; kind?: string; title?: string | null }
        | null = null;
      if (sectionId) {
        try {
          sectionRecord = await (prisma as any).section.findUnique({
            where: { id: sectionId },
            select: { schema: true, templateRefId: true, kind: true, title: true },
          });
        } catch (err) {
          console.warn('[generate] unable to load section record', err);
        }
      }

      // If the Section references a template, route to the template generation service
      if (sectionRecord?.templateRefId) {
        if (!instanceId) {
          res.status(400).json({ error: 'instanceId is required for templated sections' });
          return;
        }

        try {
          // Guard: ensure the instance belongs to the same bilan and user
          const inst = await BilanSectionInstanceService.get(req.user.id, instanceId);
          if (!inst) {
            res.status(404).json({ error: 'bilan section instance not found' });
            return;
          }
          if ((inst as { bilanId?: string }).bilanId !== req.params.bilanId) {
            res.status(400).json({ error: 'instance does not belong to target bilan' });
            return;
          }

          const { contentNotes, contextMd } = await buildInstanceNotesContext(
            req.user.id,
            instanceId,
          );

          const userSlots =
            req.body.userSlots && typeof req.body.userSlots === 'object'
              ? (req.body.userSlots as Record<string, unknown>)
              : undefined;

          const result = await generateFromTemplateSvc(
            sectionRecord.templateRefId,
            contentNotes,
            {
              instanceId,
              userSlots,
              stylePrompt,
              imageBase64,
              contextMd,
              // Ensure placeholders use RAW notes only (no markdown fallback)
              placeholdersUseContextFallback: false,
            },
          );
          res.json(result);
          return;
        } catch (err) {
          next(err);
          return;
        }
      }

      // PROMPT-based generation (no template)
      let anchors: AnchorSpecification[] = [];
      let schemaQuestions: SectionQuestion[] = [];
      let answersMarkdown = '';
      let contentNotes: Record<string, unknown> = {};
      if (sectionRecord?.schema) {
        try {
          const rawSchema = sectionRecord.schema;
          schemaQuestions = Array.isArray(rawSchema)
            ? (rawSchema as SectionQuestion[])
            : [];
          anchors = AnchorService.collect(schemaQuestions);
          console.log('[ANCHOR] generate - anchors collected', {
            sectionId,
            anchors: anchors.map((a) => a.id),
          });
          if (schemaQuestions.length > 0 && Object.keys(answersObject).length > 0) {
            try {
              answersMarkdown = answersToMarkdown(schemaQuestions, answersObject);
            } catch (err) {
              console.warn('[generate] unable to markdownify answers from schema', err);
            }
          }
        } catch (err) {
          console.warn('[generate] unable to collect anchors', err);
        }

        try {
          const latestInstances = await BilanSectionInstanceService.list(
            req.user.id,
            req.params.bilanId,
            sectionId,
            true,
          );
          if (latestInstances.length > 0) {
            const latest = latestInstances[0];
            contentNotes = (latest?.contentNotes ?? {}) as Record<string, unknown>;
            console.log('[ANCHOR] generate - contentNotes loaded', {
              hasContentNotes: Object.keys(contentNotes || {}).length > 0,
            });
          }
        } catch (err) {
          console.warn('[generate] unable to load content notes', err);
        }
      }

      if (!answersMarkdown) {
        if (Array.isArray(answersPayload)) {
          answersMarkdown = answersPayload
            .filter((part): part is string => typeof part === 'string')
            .map((part) => part.trim())
            .filter((part) => part.length > 0)
            .join('\n\n');
        } else if (typeof answersPayload === 'string') {
          answersMarkdown = answersPayload;
        } else if (Object.keys(answersObject).length > 0) {
          answersMarkdown = JSON.stringify(answersObject);
        }
      }

      // Resolve prompt key (either provided in body or derived from section.kind)
      const promptKey = ((): keyof typeof promptConfigs | null => {
        if (sectionKeyBody && (promptConfigs as any)[sectionKeyBody]) return sectionKeyBody;
        const kind = sectionRecord?.kind as string | undefined;
        if (kind && (promptConfigs as any)[kind]) return kind as keyof typeof promptConfigs;
        return null;
      })();
      if (!promptKey) {
        res.status(400).json({ error: 'invalid section' });
        return;
      }
      const cfg = promptConfigs[promptKey];

      const instructions = AnchorService.injectPrompt(cfg.instructions, anchors);
      
      // Récupère le job du profil actif (si disponible)
      const profiles = (await ProfileService.list(req.user.id)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;

      // Anonymisation en entrée (remplace le nom du patient par un placeholder générique)
      // Récupère nom/prénom si disponibles
      const promptContext = await buildSectionPromptContext({
        userId: req.user.id,
        bilanId: req.params.bilanId,
        baseContent: answersMarkdown,
        sectionId,
        fallbackSectionTitle: cfg.title ?? (sectionRecord?.title ?? String(promptKey)),
      });
      const userContent = promptContext.content;
      const patientNames = promptContext.patientNames;

      const text = await generateText({
        instructions,
        userContent,
        examples,
        stylePrompt,
        rawNotes,
        imageBase64,
        job,
      });
      // Post-traitement: réinjecte le nom du patient si connu, sinon renvoie tel quel
      let postText = text as string;
      if (patientNames.firstName || patientNames.lastName) {
        //postText = Anonymization.deanonymizeText(postText, patientNames);
      }
      const { text: processedText, anchorsStatus } = PostProcessor.process({ text: postText, anchors });
      const assembly = LexicalAssembler.assemble({
        text: processedText,
        anchors,
        missingAnchorIds: anchorsStatus.missing,
        questions: schemaQuestions,
        answers: contentNotes,
      });
      console.log('[ANCHOR] generate - response summary', {
        anchors: anchors.map((a) => a.id),
        anchorsStatus,
        autoInserted: assembly.autoInserted,
      });
      res.json({
        assembledState: assembly.assembledState,
        anchorsStatus,
        autoInsertedAnchors: assembly.autoInserted,
      });
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await BilanService.remove(req.user.id, req.params.bilanId);
      res.sendStatus(204);
    } catch (e) {
      next(e);
    }
  },

  async refine(req: Request, res: Response, next: NextFunction) {
    try {
      // Récupère aussi le job pour le raffinage
      const profiles = (await ProfileService.list(req.user.id)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;
      const text = await refineSelection({
        refineInstruction: req.body.refineInstruction,
        selectedText: req.body.selectedText,
        job,
      });
      res.json({ text });
    } catch (e) {
      next(e);
    }
  },

  async conclude(req: Request, res: Response, next: NextFunction) {
    try {
      const bilan = await BilanService.get(req.user.id, req.params.bilanId);
      if (!bilan || !bilan.descriptionJson) {
        res.status(404).json({ error: 'bilan not found' });
        return;
      }

      // Convertir le JSON du bilan en markdown lisible pour le LLM
      const { bilanJsonToMarkdown } = await import('../utils/jsonToMarkdown');
      const markdownContent = bilanJsonToMarkdown(bilan.descriptionJson);

      // Récupère le job du profil actif (si disponible)
      const profiles = (await ProfileService.list(req.user.id)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;

      // Envoyer le markdown au service de conclusion
      const text = await concludeBilan(markdownContent, job);
      res.json({ text });
    } catch (e) {
      next(e);
    }
  },

  // Orchestrate generation for a full BilanType and return assembled Lexical state
  async generateBilanType(req: Request, res: Response, next: NextFunction) {
    try {
      const { bilanTypeId, excludeSectionIds } = req.body as { bilanTypeId: string; excludeSectionIds?: string[] };
      const userId = req.user.id;
      const bilanId = req.params.bilanId;

      const bilanType = await BilanTypeService.get(userId, bilanTypeId);
      if (!bilanType) {
        res.status(404).json({ error: 'BilanType not found' });
        return;
      }

      // Load target bilan for anonymization
      const bilan = await BilanService.get(userId, bilanId);
      const patientNames = (() => {
        if (!bilan || typeof bilan !== 'object') return {} as { firstName?: string; lastName?: string };
        const p = bilan as { firstName?: string; lastName?: string; patient?: { firstName?: string; lastName?: string } };
        return { firstName: p.firstName || p.patient?.firstName, lastName: p.lastName || p.patient?.lastName };
      })();

      // Resolve user job
      const profiles = (await ProfileService.list(userId)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;

      // Sort sections by sortOrder
      let items = (bilanType.sections || []).slice().sort((a: { sortOrder?: number }, b: { sortOrder?: number }) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      if (excludeSectionIds && excludeSectionIds.length > 0) {
        const set = new Set(excludeSectionIds);
        items = items.filter((s: { sectionId: string }) => !set.has(s.sectionId));
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const db = prisma as any;
      const children: unknown[] = [];
      const conclusionSections: Array<{ id: string; title: string }> = [];
      // Per-section editor state map for layout composition
      const sectionsMap: Record<string, { root: Record<string, unknown> }> = {};
      const anchorsStatusBySection: Record<string, { ok: boolean; missing: string[]; autoInserted: string[] }> = {};

      // helper: detect if notes contain any meaningful data
      const hasMeaningful = (val: unknown): boolean => {
        if (val == null) return false;
        if (typeof val === 'string') return val.trim().length > 0;
        if (typeof val === 'number') return true;
        if (typeof val === 'boolean') return val === true;
        if (Array.isArray(val)) return val.some((x) => hasMeaningful(x));
        if (typeof val === 'object') {
          for (const v of Object.values(val as Record<string, unknown>)) {
            if (hasMeaningful(v)) return true;
          }
          return false;
        }
        return false;
      };

      for (const btSec of items) {
        try {
          // Fetch section to get kind/title/template
          const section = await db.section.findUnique({ where: { id: btSec.sectionId } });
          if (!section) continue;
          const kind: string = section.kind;
          const title: string = section.title;
          const templateId: string | null = section.templateRefId ?? null;
          const rawSchema = section?.schema;
          const schemaQuestions: SectionQuestion[] = Array.isArray(rawSchema)
            ? (rawSchema as SectionQuestion[])
            : [];
          const anchors = AnchorService.collect(schemaQuestions);
          if (anchors.length > 0) {
            console.log('[ANCHOR] generateBilanType - anchors collected', {
              sectionId: btSec.sectionId,
              anchors: anchors.map((a) => a.id),
            });
          }

          // Defer conclusion sections to the end
          if (kind === 'conclusion') {
            conclusionSections.push({ id: btSec.sectionId, title: title || 'Conclusion' });
            continue;
          }

          // Latest notes (contentNotes)
          const latest = await BilanSectionInstanceService.list(userId, bilanId, btSec.sectionId, true);
          const contentNotes = latest.length ? (latest[0].contentNotes ?? {}) : {};

          // Skip generation if notes are empty
          if (!hasMeaningful(contentNotes)) {
            continue;
          }

          // If template is associated, use template generator and merge its Lexical state
          if (templateId) {
            // Ensure an instance exists to store generated content
            const { id: instanceId } = await BilanSectionInstanceService.upsert(userId, {
              bilanId,
              sectionId: btSec.sectionId,
              contentNotes,
            });

            // Build markdown context from notes using the shared helper
            let rawContextMd = '';
            try {
              rawContextMd = answersToMarkdown(schemaQuestions as any[], contentNotes as Record<string, unknown>);
              console.log("contextMd", rawContextMd);
            } catch {
              // Non-blocking: if markdownification fails, proceed without it
            }

            const templatePromptContext = await buildSectionPromptContext({
              userId,
              bilanId,
              baseContent: rawContextMd,
              sectionId: section.id,
              fallbackSectionTitle: title,
              patientNames,
            });

            const result = await generateFromTemplateSvc(templateId, contentNotes as Record<string, unknown>, { instanceId, contextMd: templatePromptContext.content });

            // Parse returned Lexical state and append its children (fallback aggregation)
            try {
              const state = JSON.parse(result.assembledState as string);
              // Store per-section state for layout composition
              sectionsMap[btSec.sectionId] = { root: state?.root || state } as { root: Record<string, unknown> };

              // Fallback: add a heading for the section and merge its children
              children.push({
                type: 'heading', tag: 'h2', direction: 'ltr', format: '', indent: 0, version: 1,
                children: [{ type: 'text', text: String(title), detail: 0, format: 0, style: '', version: 1 }],
              });
              const subChildren = (state?.root?.children ?? []) as unknown[];
              for (const node of subChildren) children.push(node);
              // Spacer paragraph
              children.push({ type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1, children: [] });
            } catch {
              // If parsing fails, skip merging this section's content
            }
            continue;
          }

          // No template: generate plain text using prompt configs
          const promptKey = ((): keyof typeof promptConfigs | null => {
            if ((promptConfigs as any)[kind]) return kind as keyof typeof promptConfigs;
            return null;
          })();
          if (!promptKey) continue;

          // Align prompt content with shared markdownification (_md only)
          const sectionPromptContext = await buildSectionPromptContext({
            userId,
            bilanId,
            baseContent: answersToMarkdown(schemaQuestions as any[], contentNotes as Record<string, unknown>),
            sectionId: section.id,
            fallbackSectionTitle: title,
            patientNames,
          });
          let userContent = sectionPromptContext.content;
          if (patientNames.firstName || patientNames.lastName) {
            //const anonymizedContent = Anonymization.anonymizeText(userContent, patientNames);
            //userContent = anonymizedContent;
          }

          const cfg = promptConfigs[promptKey];
          const instructions = AnchorService.injectPrompt(cfg.instructions, anchors);
          let text = await generateText({ instructions, userContent, job });
          if (patientNames.firstName || patientNames.lastName) {
            //text = Anonymization.deanonymizeText(text as string, patientNames);
          }

          const { text: processedText, anchorsStatus } = PostProcessor.process({ text: String(text || ''), anchors });
          const assembly = LexicalAssembler.assemble({
            text: processedText,
            anchors,
            missingAnchorIds: anchorsStatus.missing,
            questions: schemaQuestions,
            answers: contentNotes as Record<string, unknown>,
          });

          anchorsStatusBySection[btSec.sectionId] = {
            ok: anchorsStatus.ok,
            missing: anchorsStatus.missing,
            autoInserted: assembly.autoInserted,
          };
          if (anchors.length > 0) {
            console.log('[ANCHOR] generateBilanType - section summary', {
              sectionId: btSec.sectionId,
              anchors: anchors.map((a) => a.id),
              anchorsStatus: anchorsStatusBySection[btSec.sectionId],
            });
          }

          const sectionState = JSON.parse(assembly.assembledState);

          {
            sectionsMap[btSec.sectionId] = {
              root: (sectionState?.root || sectionState) as Record<string, unknown>,
            } as { root: Record<string, unknown> };
          }

          // Fallback aggregation: heading for the section title + rendered Lexical content
          {
            children.push({
              type: 'heading', tag: 'h2', direction: 'ltr', format: '', indent: 0, version: 1,
              children: [{ type: 'text', text: String(title), detail: 0, format: 0, style: '', version: 1 }],
            });
            const nodes = (((sectionState as Record<string, unknown>)?.root as Record<string, unknown>)?.children ?? []) as unknown[];
            for (const node of nodes) children.push(node);
            // Blank line between sections
            children.push({ type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1, children: [] });
          }
        } catch (err) {
          // Continue with next section on failure
          // eslint-disable-next-line no-console
          console.warn('[generateBilanType] section failed', btSec.sectionId, err);
        }
      }

      // After generating all sections, handle any deferred conclusion sections
      if (conclusionSections.length > 0) {
        try {
          // Build a temporary editor state from the generated children so far
          const preEditorState = {
            root: { type: 'root', direction: 'ltr', format: '', indent: 0, version: 1, children: [...children] },
            version: 1,
          };

          // Convert aggregated JSON to markdown for the LLM
          const { bilanJsonToMarkdown } = await import('../utils/jsonToMarkdown');
          let markdownContent = bilanJsonToMarkdown(preEditorState);
          if (patientNames.firstName || patientNames.lastName) {
            //markdownContent = Anonymization.anonymizeText(markdownContent, patientNames);
          }

          // Ask the model to conclude based on the aggregated content
          let conclusionText = await concludeBilan(markdownContent, job);
          if (patientNames.firstName || patientNames.lastName) {
            //conclusionText = Anonymization.deanonymizeText(conclusionText as string, patientNames);
          }

          // Build conclusion per-section states and also append to fallback aggregation
          for (const c of conclusionSections) {
            // Per-section state
            const conclusionState = markdownToLexicalState(String(conclusionText || ''));
            const cChildren = ((conclusionState.root as Record<string, unknown>)?.children ?? []) as unknown[];
            sectionsMap[c.id] = {
              root: conclusionState.root as Record<string, unknown>,
            } as { root: Record<string, unknown> };

            // Fallback aggregation: heading + paragraphs
            children.push({
              type: 'heading', tag: 'h2', direction: 'ltr', format: '', indent: 0, version: 1,
              children: [{ type: 'text', text: String(c.title || 'Conclusion'), detail: 0, format: 0, style: '', version: 1 }],
            });
            for (const node of cChildren) children.push(node);
            // Blank line after conclusion
            children.push({ type: 'paragraph', direction: 'ltr', format: '', indent: 0, version: 1, children: [] });
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[generateBilanType] conclusion generation failed', err);
        }
      }

      // Prefer layoutJson composition when available, otherwise fallback to aggregated children
      const layout = bilanType.layoutJson as { root?: unknown } | undefined;
      if (layout && typeof layout === 'object' && layout.root) {
        try {
          const composed = hydrateLayout(layout as { root: Record<string, unknown> }, sectionsMap);
          const assembledState = lexicalStateToJSON(
            normalizeLexicalEditorState({ root: composed.root }),
          );
          console.log('[ANCHOR] generateBilanType - final response (layout)', {
            sectionsWithAnchors: Object.keys(anchorsStatusBySection),
          });
          res.json({ assembledState, anchorsStatus: anchorsStatusBySection });
          return;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[generateBilanType] layout composition failed, falling back', err);
        }
      }

      const fallbackState = normalizeLexicalEditorState({
        root: { children },
      });
      console.log('[ANCHOR] generateBilanType - final response (fallback)', {
        sectionsWithAnchors: Object.keys(anchorsStatusBySection),
      });
      res.json({
        assembledState: lexicalStateToJSON(fallbackState),
        anchorsStatus: anchorsStatusBySection,
      });
    } catch (e) {
      next(e);
    }
  },


};
