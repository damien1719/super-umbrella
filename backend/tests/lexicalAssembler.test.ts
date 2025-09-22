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
});
