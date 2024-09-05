import { useEffect, useRef } from "react";

// From Dan Abramov's blog: https://overreacted.io/making-setinterval-declarative-with-react-hooks/

export default function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>(callback);
  //ensures that the callback function always references the latest state of the application (including cursorState and cursor positions).

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };

    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
