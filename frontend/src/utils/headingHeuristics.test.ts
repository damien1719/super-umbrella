import { describe, it, expect } from 'vitest';
import { isHeadingCandidate } from './headingHeuristics';

describe('isHeadingCandidate', () => {
  it('returns true for heading nodes', () => {
    expect(
      isHeadingCandidate({
        text: 'anything',
        isHeadingNode: true,
        nextIsEmptyParagraph: false,
      }),
    ).toBe(true);
  });

  it('detects text ending with colon', () => {
    expect(
      isHeadingCandidate({
        text: 'Title:',
        isHeadingNode: false,
        nextIsEmptyParagraph: false,
      }),
    ).toBe(true);
  });

  it('detects mostly uppercase with empty next line', () => {
    expect(
      isHeadingCandidate({
        text: 'BIG TITLE',
        isHeadingNode: false,
        nextIsEmptyParagraph: true,
      }),
    ).toBe(true);
  });

  it('returns false otherwise', () => {
    expect(
      isHeadingCandidate({
        text: 'just a paragraph',
        isHeadingNode: false,
        nextIsEmptyParagraph: false,
      }),
    ).toBe(false);
  });
});
