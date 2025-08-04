import request from 'supertest'
import app from '../src/app'
import {
  transformText,
  transformImageToTable,
  transformTextToTable,
} from '../src/services/ai/generate.service'

jest.mock('../src/services/ai/generate.service')

const mockedTransformText = transformText as unknown as jest.Mock
const mockedTransformImage = transformImageToTable as unknown as jest.Mock
const mockedTransformTextToTable = transformTextToTable as unknown as jest.Mock

describe('POST /api/v1/import/transform', () => {
  it('calls ai service with content', async () => {
    mockedTransformText.mockResolvedValueOnce(['q1'] as unknown as string[])
    const res = await request(app)
      .post('/api/v1/import/transform')
      .send({ content: 'txt' })

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ result: ['q1'] })
    expect(mockedTransformText).toHaveBeenCalled()
  })
})

describe('POST /api/v1/import/transform-image', () => {
  it('calls ai service with image data', async () => {
    mockedTransformImage.mockResolvedValueOnce({
      colonnes: ['C1'],
      lignes: ['L1'],
    })

    const res = await request(app)
      .post('/api/v1/import/transform-image')
      .send({ image: 'abc' })

    expect(res.status).toBe(200)
    expect(res.body.result[0]).toMatchObject({
      type: 'tableau',
      titre: 'Question sans titre',
      tableau: {
        columns: [expect.objectContaining({ label: 'C1' })],
        sections: [
          expect.objectContaining({
            rows: [expect.objectContaining({ label: 'L1' })],
          }),
        ],
      },
    })
    expect(mockedTransformImage).toHaveBeenCalledWith({ imageBase64: 'abc' })
  })
})

describe('POST /api/v1/import/transform-text-table', () => {
  it('calls ai service with text data', async () => {
    mockedTransformTextToTable.mockResolvedValueOnce({
      colonnes: ['C1'],
      lignes: ['L1'],
    })

    const res = await request(app)
      .post('/api/v1/import/transform-text-table')
      .send({ content: 'txt' })

    expect(res.status).toBe(200)
    expect(res.body.result[0]).toMatchObject({
      type: 'tableau',
      titre: 'Question sans titre',
      tableau: {
        columns: [expect.objectContaining({ label: 'C1' })],
        sections: [
          expect.objectContaining({
            rows: [expect.objectContaining({ label: 'L1' })],
          }),
        ],
      },
    })
    expect(mockedTransformTextToTable).toHaveBeenCalledWith({ content: 'txt' })
  })
})
