import request from "supertest";
import app from "../src/app";
import { BilanService } from "../src/services/bilan.service";
import { generateText } from "../src/services/ai/generate.service";
import { promptConfigs } from "../src/services/ai/prompts/promptconfig";
import { sanitizeHtml } from "../src/utils/sanitize";
jest.mock("../src/services/bilan.service");
jest.mock("../src/services/ai/generate.service");
const mockedService = BilanService;
const mockedGenerate = generateText;
describe("GET /api/v1/bilans", () => {
    it("returns bilans from service", async () => {
        mockedService.list.mockResolvedValueOnce([
            { id: "1", patientId: "p1" },
        ]);
        const res = await request(app).get("/api/v1/bilans");
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(mockedService.list).toHaveBeenCalledWith("demo-user");
    });
});
describe("PUT /api/v1/bilans/:id", () => {
    it("sanitizes descriptionHtml before update", async () => {
        mockedService.update.mockResolvedValueOnce({
            id: "1",
            patientId: "p1",
            descriptionHtml: "<p>ok</p>",
        });
        const dirty = "<img src=x onerror=alert(1)>";
        const expected = sanitizeHtml(dirty);
        const id = "11111111-1111-1111-1111-111111111111";
        const res = await request(app)
            .put(`/api/v1/bilans/${id}`)
            .send({ descriptionHtml: dirty });
        expect(res.status).toBe(200);
        expect(mockedService.update).toHaveBeenCalledWith("demo-user", id, {
            descriptionHtml: expected,
        });
    });
});
describe("POST /api/v1/bilans/:id/generate", () => {
    it("calls ai service with prompt params", async () => {
        mockedGenerate.mockResolvedValueOnce("texte");
        const id = "11111111-1111-1111-1111-111111111111";
        const body = {
            section: "anamnese",
            answers: { foo: "bar" },
            examples: ["demo"],
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
        });
    });
});
