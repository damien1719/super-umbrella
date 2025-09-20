import { AnchorService, type AnchorSpecification } from './anchor.service';

export type PostProcessorInput = {
  text: string;
  anchors: AnchorSpecification[];
};

export type PostProcessorResult = {
  text: string;
  anchorsStatus: {
    ok: boolean;
    missing: string[];
  };
};

export const PostProcessor = {
  process({ text, anchors }: PostProcessorInput): PostProcessorResult {
    console.log('[ANCHOR] PostProcessor.process - start', {
      textLength: text.length,
      anchorsCount: anchors.length,
      anchors: anchors.map((a) => a.id),
    });
    const verification = AnchorService.verify(text, anchors);
    // À terme : ré-appeler le modèle pour combler les ancres manquantes.
    const fixedText = AnchorService.fixMissing(text, anchors, verification.missing);
    if (verification.missing.length > 0) {
      console.log('[ANCHOR] PostProcessor.process - anchors missing after verify', verification.missing);
    }
    return {
      text: fixedText,
      anchorsStatus: verification,
    };
  },
};
