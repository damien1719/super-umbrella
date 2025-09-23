import { LexicalAssembler } from '../src/services/bilan/lexicalAssembler';
import { TableRenderer } from '../src/services/bilan/tableRenderer';

jest.mock('../src/services/bilan/tableRenderer', () => ({
  TableRenderer: {
    renderLexical: jest.fn(),
  },
}));

const renderLexicalMock = TableRenderer.renderLexical as jest.MockedFunction<typeof TableRenderer.renderLexical>;

describe('LexicalAssembler', () => {
  beforeEach(() => {
    renderLexicalMock.mockReset();
  });

  it('insère un tableau pour une ancre inline dans un paragraphe', () => {
    renderLexicalMock.mockReturnValue([{ type: 'table', children: [] } as any]);

    const { assembledState } = LexicalAssembler.assemble({
      text: 'Avant `[[CR:TBL|id=T1]]` après',
      anchors: [{ id: 'T1', questionId: 'Q1', type: 'CR:TBL' }],
      questions: [] as any,
      answers: {},
    });

    const state = JSON.parse(assembledState);
    const nodes = state.root.children;

    expect(renderLexicalMock).toHaveBeenCalledTimes(1);
    expect(nodes).toHaveLength(3);
    expect(nodes[0].type).toBe('paragraph');
    expect(nodes[0].children[0].text).toBe('Avant');
    expect(nodes[1].type).toBe('table');
    expect(nodes[2].type).toBe('paragraph');
    expect(nodes[2].children[0].text).toBe('après');
  });

  it('insère le tableau après un heading contenant une ancre inline', () => {
    renderLexicalMock.mockReturnValue([{ type: 'table', children: [] } as any]);

    const { assembledState } = LexicalAssembler.assemble({
      text: '# Titre `[[CR:TBL|id=T1]]` Après',
      anchors: [{ id: 'T1', questionId: 'Q1', type: 'CR:TBL' }],
      questions: [] as any,
      answers: {},
    });

    const state = JSON.parse(assembledState);
    const nodes = state.root.children;

    expect(renderLexicalMock).toHaveBeenCalledTimes(1);
    expect(nodes).toHaveLength(2);
    expect(nodes[0].type).toBe('heading');
    expect(nodes[0].children[0].text).toBe('Titre Après');
    expect(nodes[1].type).toBe('table');
  });

  it("préserve l'ancre inline si aucune ancre connue n'est fournie", () => {
    renderLexicalMock.mockReturnValue([]);

    const { assembledState } = LexicalAssembler.assemble({
      text: 'Avant `[[CR:TBL|id=UNKNOWN]]` après',
      anchors: [],
      questions: [] as any,
      answers: {},
    });

    expect(renderLexicalMock).not.toHaveBeenCalled();

    const state = JSON.parse(assembledState);
    const nodes = state.root.children;

    expect(nodes).toHaveLength(1);
    expect(nodes[0].type).toBe('paragraph');
    const texts = nodes[0].children.map((child: any) => child.text);
    expect(texts).toEqual(['Avant ', '`[[CR:TBL|id=UNKNOWN]]`', ' après']);
  });

  it("remplace une ancre de titre par un paragraphe formaté", () => {
    const { assembledState } = LexicalAssembler.assemble({
      text: '`[[CR:TITLE_PRESET|id=Q1]]`',
      anchors: [
        {
          id: 'Q1',
          questionId: 'Q1',
          type: 'CR:TITLE_PRESET',
          presetId: 't12-bold-underline',
        },
      ],
      questions: [
        {
          id: 'Q1',
          type: 'titre',
          titre: 'Diagnostic',
          titrePresetId: 't12-bold-underline',
        } as any,
      ],
      answers: {},
    });

    expect(renderLexicalMock).not.toHaveBeenCalled();

    const state = JSON.parse(assembledState);
    const nodes = state.root.children;

    expect(nodes).toHaveLength(1);
    const paragraph = nodes[0];
    expect(paragraph.type).toBe('paragraph');
    expect(paragraph.children[0].text).toBe('Diagnostic');
    expect(paragraph.children[0].format).toBe(5);
    expect(paragraph.children[0].style).toBe('font-size: 12pt');
  });

  it('génère une liste à puces formatée pour le preset bullet', () => {
    const { assembledState } = LexicalAssembler.assemble({
      text: '`[[CR:TITLE_PRESET|id=Q2]]`',
      anchors: [
        {
          id: 'Q2',
          questionId: 'Q2',
          type: 'CR:TITLE_PRESET',
          presetId: 't12-bullet-bold',
        },
      ],
      questions: [
        {
          id: 'Q2',
          type: 'titre',
          titre: 'Compte rendu',
          titrePresetId: 't12-bullet-bold',
        } as any,
      ],
      answers: {},
    });

    expect(renderLexicalMock).not.toHaveBeenCalled();

    const state = JSON.parse(assembledState);
    const nodes = state.root.children;

    expect(nodes).toHaveLength(1);
    const list = nodes[0];
    expect(list.type).toBe('list');
    expect(list.children).toHaveLength(1);
    const listItem = list.children[0];
    expect(listItem.type).toBe('listitem');
    expect(listItem.children[0].text).toBe('Compte rendu');
    expect(listItem.children[0].style).toBe('font-size: 12pt');
  });
});
