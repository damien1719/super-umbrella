import type { Request, Response, NextFunction } from "express";
import { BilanService } from "../services/bilan.service";
import { ProfileService } from "../services/profile.service";
// No HTML sanitization needed for JSON editor state
import { generateText } from "../services/ai/generate.service";
import { Anonymization } from "../services/ai/anonymize.service";
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
import {
  lexicalStateToJSON,
  markdownToLexicalState,
  normalizeLexicalEditorState,
} from "../utils/lexicalEditorState";


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
      const section = req.body.section as keyof typeof promptConfigs;
      const sectionId = typeof req.body.sectionId === 'string' ? req.body.sectionId : undefined;
      const answers = req.body.answers ?? {};
      const rawNotes = typeof req.body.rawNotes === 'string' ? req.body.rawNotes : undefined;
      const stylePrompt = typeof req.body.stylePrompt === 'string' ? req.body.stylePrompt : undefined;
      const examples = Array.isArray(req.body.examples) ? req.body.examples : [];
      const imageBase64 = typeof req.body.imageBase64 === 'string' ? req.body.imageBase64 : undefined;
      const cfg = promptConfigs[section];
      if (!cfg) {
        res.status(400).json({ error: 'invalid section' });
        return;
      }
      
      // Récupère le job du profil actif (si disponible)
      const profiles = (await ProfileService.list(req.user.id)) as unknown as Array<{ job?: 'PSYCHOMOTRICIEN' | 'ERGOTHERAPEUTE' | 'NEUROPSYCHOLOGUE' | null }>;
      const job = profiles && profiles.length > 0 ? (profiles[0].job ?? undefined) : undefined;

      // Anonymisation en entrée (remplace le nom du patient par un placeholder générique)
      // Récupère nom/prénom si disponibles
      const promptContext = await buildSectionPromptContext({
        userId: req.user.id,
        bilanId: req.params.bilanId,
        baseContent: JSON.stringify(answers ?? {}),
        sectionId,
        fallbackSectionTitle: cfg.title ?? String(section),
      });
      const userContent = promptContext.content;
      const patientNames = promptContext.patientNames;

      const text = await generateText({
        instructions: cfg.instructions,
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
      const editorState = markdownToLexicalState(postText);
      const assembledState = lexicalStateToJSON(editorState);
      res.json({ assembledState });
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
              const schemaQuestions = ((section?.schema || []) as unknown[]) as any[];
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
          const schemaQuestions = ((section?.schema || []) as unknown[]) as any[];
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
          let text = await generateText({ instructions: cfg.instructions, userContent, job });
          if (patientNames.firstName || patientNames.lastName) {
            //text = Anonymization.deanonymizeText(text as string, patientNames);
          }

          // Build per-section state from Markdown (headings + paragraphs)
          const sectionState = markdownToLexicalState(String(text || ''));

          {
            sectionsMap[btSec.sectionId] = {
              root: sectionState.root as Record<string, unknown>,
            } as { root: Record<string, unknown> };
          }

          // Fallback aggregation: heading for the section title + rendered Markdown content
          {
            children.push({
              type: 'heading', tag: 'h2', direction: 'ltr', format: '', indent: 0, version: 1,
              children: [{ type: 'text', text: String(title), detail: 0, format: 0, style: '', version: 1 }],
            });
            const mdNodes = ((sectionState.root as Record<string, unknown>)?.children ?? []) as unknown[];
            for (const node of mdNodes) children.push(node);
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
          res.json({ assembledState });
          return;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn('[generateBilanType] layout composition failed, falling back', err);
        }
      }

      const fallbackState = normalizeLexicalEditorState({
        root: { children },
      });
      res.json({ assembledState: lexicalStateToJSON(fallbackState) });
    } catch (e) {
      next(e);
    }
  },


};
