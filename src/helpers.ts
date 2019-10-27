type StartPosition = number;
type EndPosition = number;
export function getWordAtPosition(
  value: string,
  startPosition: number,
  endPosition?: number
): [string, StartPosition, EndPosition] {
  let letterIndex = 0;
  const words = value.replace(/\n/g, ' ').split(' ');

  if (typeof endPosition === 'number' && startPosition !== endPosition) {
    const word = value.substring(startPosition, endPosition);
    return [word, startPosition, endPosition];
  }

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const startIndex = letterIndex;
    letterIndex += word.length;
    if (letterIndex >= startPosition) {
      return [
        word.replace(/\r?\n|\r/g, '').trim(),
        startIndex,
        startIndex + word.length,
      ];
    }

    letterIndex += 1;
  }

  return ['', 0, 0];
}

export function getRowAtPosition(value: string, position: number): string {
  let letterIndex = 0;
  const rows = value.split(/\n/g);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    letterIndex += row.length;
    if (letterIndex >= position) {
      return row;
    }
    letterIndex += 1;
  }

  return '';
}

export function isCtrlCmd(event: KeyboardEvent): boolean {
  const isMacLike = /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform);

  return (isMacLike && event.metaKey) || (!isMacLike && event.ctrlKey);
}
