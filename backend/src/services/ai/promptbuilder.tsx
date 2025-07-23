/** Typage ultra-simple pour la démo */
export interface DummyInput {
    patientName: string;
    request: string;
  }
  
  /** Fonction pure et testable */
  export function buildDummyPrompt(input: DummyInput) {
    return [
      { role: "system", content: "You are a psychomotor therapist assistant." },
      {
        role: "user",
        content: `Patient: ${input.patientName}\nRequest: ${input.request}`,
      },
    ] as const;
  }
  