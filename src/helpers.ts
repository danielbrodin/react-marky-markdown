export function getWordAtPosition(value: string, position: number): string {
  let letterIndex = 0;
  const words = value.replace(/\n/g, ' ').split(' ');

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    letterIndex += word.length;
    if (letterIndex >= position) {
      return word.replace(/\r?\n|\r/g, '').trim();
    }

    letterIndex += 1;
  }

  return '';
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
