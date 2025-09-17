import request from "supertest";
import app from "../src/app";
import { BilanService } from "../src/services/bilan.service";
import { generateText } from "../src/services/ai/generate.service";
import { promptConfigs } from "../src/services/ai/prompts/promptconfig";
import { refineSelection } from "../src/services/ai/refineSelection.service";
import { concludeBilan } from "../src/services/ai/conclude.service";

import { ProfileService } from "../src/services/profile.service";

jest.mock("../src/services/bilan.service");
jest.mock("../src/services/ai/generate.service");
jest.mock("../src/services/ai/refineSelection.service");
jest.mock("../src/services/ai/conclude.service");

jest.mock("../src/services/profile.service", () => ({
  ProfileService: { list: jest.fn() },
}));
jest.mock("../src/middlewares/requireAuth", () => ({
  requireAuth: (
    req: { user?: { id: string } },
    _res: unknown,
    next: () => void,
  ) => {
    req.user = { id: "demo-user" };
    next();
  },
}));

interface BilanStub {
  id: string;
  patientId: string;
}

const mockedService = BilanService as jest.Mocked<typeof BilanService>;
const mockedGenerate = generateText as jest.MockedFunction<typeof generateText>;
const mockedRefine = refineSelection as jest.MockedFunction<typeof refineSelection>;
const mockedConclude = concludeBilan as jest.MockedFunction<typeof concludeBilan>;

const mockedProfile = ProfileService as unknown as { list: jest.Mock };

describe("GET /api/v1/bilans", () => {
  it("returns bilans from service", async () => {
    mockedService.list.mockResolvedValueOnce([
      { id: "1", patientId: "p1" } as BilanStub,
    ]);

    const res = await request(app).get("/api/v1/bilans");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith("demo-user");
  });
});

describe("PUT /api/v1/bilans/:id", () => {
  it("accepts descriptionJson without sanitization", async () => {
    mockedService.update.mockResolvedValueOnce({
      id: "1",
      patientId: "p1",
      descriptionJson: { root: { type: 'root', version: 1, children: [] } },
    } as BilanStub);

    const state = { root: { type: 'root', version: 1, children: [] } };
    const id = "11111111-1111-1111-1111-111111111111";

    const res = await request(app)
      .put(`/api/v1/bilans/${id}`)
      .send({ descriptionJson: state });

    expect(res.status).toBe(200);
    expect(mockedService.update).toHaveBeenCalledWith("demo-user", id, {
      descriptionJson: state,
    });
  });
});

describe("POST /api/v1/bilans/:id/generate", () => {
  it("calls ai service with prompt params", async () => {
    mockedGenerate.mockResolvedValueOnce("texte");
    (mockedService.get as jest.Mock).mockResolvedValueOnce(null);
    (mockedProfile.list as jest.Mock).mockResolvedValueOnce([]);
    const id = "11111111-1111-1111-1111-111111111111";
    const body = {
      section: "anamnese",
      answers: { foo: "bar" },
      examples: ["demo"],
      rawNotes: "notes",
    };

    const res = await request(app)
      .post(`/api/v1/bilans/${id}/generate`)
      .send(body);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ text: "texte" });
    expect(mockedGenerate).toHaveBeenCalledWith({
      instructions: promptConfigs.anamnese.instructions,
      userContent: JSON.stringify(body.answers),
      examples: ["demo"],
      rawNotes: "notes",
    });
  });
});

describe("POST /api/v1/bilans/:id/refine", () => {
  it("calls refine service with selected text", async () => {
    mockedRefine.mockResolvedValueOnce("refined");
    (mockedProfile.list as jest.Mock).mockResolvedValueOnce([]);
    const id = "11111111-1111-1111-1111-111111111111";
    const body = { selectedText: "old", refineInstruction: "inst" };
    const res = await request(app)
      .post(`/api/v1/bilans/${id}/refine`)
      .send(body);
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ text: "refined" });
    expect(mockedRefine).toHaveBeenCalledWith({
      selectedText: "old",
      refineInstruction: "inst",
    });
  });
});

describe("POST /api/v1/bilans/:id/conclude", () => {
  it("calls conclude service with markdown content", async () => {
    mockedConclude.mockResolvedValueOnce("conclusion générée");
    (mockedProfile.list as jest.Mock).mockResolvedValueOnce([]);
    
    const id = "11111111-1111-1111-1111-111111111111";
    
    // Mock du bilan avec descriptionJson
    (mockedService.get as jest.Mock).mockResolvedValueOnce({
      id: "1",
      descriptionJson: {
        root: {
          children: [
            {
              type: 'paragraph',
              children: [
                {
                  type: 'text',
                  text: 'Observation du patient',
                  format: 0,
                  version: 1,
                },
              ],
              version: 1,
            },
          ],
          version: 1,
        },
      },
    });

    const res = await request(app)
      .post(`/api/v1/bilans/${id}/conclude`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ text: "conclusion générée" });
    
    // Vérifier que concludeBilan a été appelé avec du markdown et job (indéfini ici)
    expect(mockedConclude).toHaveBeenCalledWith("Observation du patient\n", undefined);
  });
});

