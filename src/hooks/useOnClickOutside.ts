import * as React from 'react';

export function useOnClickOutside(
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ref: React.RefObject<any> | React.RefObject<any>[],
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  handler: (e: any) => void
) {
  React.useEffect(() => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const refs: React.RefObject<any>[] = Array.isArray(ref) ? ref : [ref];
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const listener = (event: any) => {
      const isOutside: boolean = refs.reduce<boolean>((acc, refValue) => {
        if (refValue.current && refValue.current.contains(event.target)) {
          return false;
        }

        return acc;
      }, true);

      if (isOutside) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}
