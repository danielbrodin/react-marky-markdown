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
});

describe('getRowAtPosition', () => {
  it('Returns the correct row at said position', () => {
    const rows = ['lorem ipsum dolor', 'sit amet'];
    expect(getRowAtPosition(rows.join('\n'), rows[0].length + 5)).toBe(rows[1]);
  });
});
