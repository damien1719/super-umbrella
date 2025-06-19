import request from 'supertest';
import app from '../src/app';
import { DocumentService } from '../src/services/document.service';

interface DocumentStub {
  id: string;
  fileName: string;
}

jest.mock('../src/services/document.service');

const mockedService = DocumentService as jest.Mocked<typeof DocumentService>;

describe('GET /api/v1/documents', () => {
  it('returns documents from service', async () => {
    (mockedService.list as jest.Mock).mockResolvedValueOnce([
      { id: '1', fileName: 'file.pdf' } as DocumentStub,
    ]);

    const res = await request(app).get('/api/v1/documents');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(mockedService.list).toHaveBeenCalledWith(undefined);
  });
});

describe('POST /api/v1/documents', () => {
  it('creates a document via service', async () => {
    const payload = {
      type: 'PHOTO',
      fileName: 'photo.jpg',
      fileUrl: '/tmp/photo.jpg',
      bienId: '00000000-0000-0000-0000-000000000000',
    };
    (mockedService.create as jest.Mock).mockResolvedValueOnce({
      id: '1',
      ...payload,
    } as DocumentStub);

    const res = await request(app).post('/api/v1/documents').send(payload);

    expect(res.status).toBe(201);
    expect(mockedService.create).toHaveBeenCalledWith(payload);
  });
});
