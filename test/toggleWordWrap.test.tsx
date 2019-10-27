import * as React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Editor } from '../src';
import { toggleWordWrap } from '../src';

describe('toggleWordWrap', () => {
  it('Wraps the word with no selection', async () => {
    const value = 'lorem ipsum dolor';
    const { findByTestId } = render(<Editor defaultValue={value} />);
    const textarea: HTMLTextAreaElement = (await findByTestId(
      'textarea'
    )) as HTMLTextAreaElement;
    const position = 'lorem ip'.length;

    textarea.setSelectionRange(position, position);
    toggleWordWrap(textarea, '**');

    expect(textarea.value).toBe('lorem **ipsum** dolor');
    expect(textarea.selectionStart).toBe(position + 2);
  });

  it('Unwraps the word with no selection', async () => {
    const value = 'lorem **ipsum** dolor';
    const { findByTestId } = render(<Editor defaultValue={value} />);
    const textarea: HTMLTextAreaElement = (await findByTestId(
      'textarea'
    )) as HTMLTextAreaElement;
    const position = 'lorem **ip'.length;

    textarea.setSelectionRange(position, position);
    toggleWordWrap(textarea, '**');

    expect(textarea.value).toBe('lorem ipsum dolor');
    expect(textarea.selectionStart).toBe(position - 2);
  });

  it('Wraps the selection', async () => {
    const value = 'lorem ipsum dolor';
    const { findByTestId } = render(<Editor defaultValue={value} />);
    const textarea: HTMLTextAreaElement = (await findByTestId(
      'textarea'
    )) as HTMLTextAreaElement;
    const selectionStart = 'lorem '.length;
    const selectionEnd = value.length;

    textarea.setSelectionRange(selectionStart, selectionEnd);
    toggleWordWrap(textarea, '**');

    expect(textarea.value).toBe('lorem **ipsum dolor**');
    expect(textarea.selectionStart).toBe(selectionStart);
    expect(textarea.selectionEnd).toBe(selectionEnd + 4);
  });

  it('Unwraps the selection', async () => {
    const value = 'lorem **ipsum dolor**';
    const { findByTestId } = render(<Editor defaultValue={value} />);
    const textarea: HTMLTextAreaElement = (await findByTestId(
      'textarea'
    )) as HTMLTextAreaElement;
    const selectionStart = 'lorem '.length;
    const selectionEnd = value.length;

    textarea.setSelectionRange(selectionStart, selectionEnd);
    toggleWordWrap(textarea, '**');

    expect(textarea.value).toBe('lorem ipsum dolor');
    expect(textarea.selectionStart).toBe(selectionStart);
    expect(textarea.selectionEnd).toBe(selectionEnd - 4);
  });
});
