import * as React from 'react';
import ResizeObserver from 'resize-observer-polyfill';

interface Bounds {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
}
const defaultState: Bounds = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
};

export function useMeasure(
  ref: React.RefObject<any>,
  disabled: boolean = false
): Bounds {
  const [bounds, set] = React.useState<Bounds>(defaultState);
  const [ro] = React.useState(
    () => new ResizeObserver(([entry]) => set(entry.contentRect))
  );

  // @ts-ignore: no-implicit-returns
  React.useEffect(() => {
    if (ref.current && !disabled) {
      ro.observe(ref.current);

      return () => ro.disconnect();
    }
  }, [ref, ro, disabled]);

  return bounds;
}
