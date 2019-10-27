import { getWordAtPosition, getRowAtPosition } from '../src/helpers';

describe('getWordAtPosition', () => {
  it('Returns the correct word att said position', () => {
    const words = ['lorem', 'ipsum', 'dolor'];
    const position = Math.round(words[0].length + words[1].length / 2);
    const [word, start, end] = getWordAtPosition(words.join(' '), position);
    expect(word).toBe('ipsum');
    expect(start).toBe(words[0].length + 1);
    expect(end).toBe(words[0].length + 1 + words[1].length);
  });

  it('Returns the correct word from selection', () => {
    const words = ['lorem', 'ipsum', 'dolor'];
    const startPosition = words[0].length + 1;
    const endPosition = words[0].length + 1 + words[1].length;
    const [word, start, end] = getWordAtPosition(
      words.join(' '),
      startPosition,
      endPosition
    );
    expect(word).toBe('ipsum');
    expect(start).toBe(startPosition);
    expect(end).toBe(endPosition);
  });
});

describe('getRowAtPosition', () => {
  it('Returns the correct row at said position', () => {
    const rows = ['lorem ipsum dolor', 'sit amet'];
    expect(getRowAtPosition(rows.join('\n'), rows[0].length + 5)).toBe(rows[1]);
  });
});
