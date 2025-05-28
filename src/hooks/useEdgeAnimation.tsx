import { useEffect, useState } from 'react';
import { EDGE_ANIMATION_TIME } from '../lib';

export default function useEdgeAnimation(depth: number = 0) {
  const base = depth + 1;
  const [isDelayed, setIsDelayed] = useState(depth > 0);
  const [duration, setDuration] = useState(EDGE_ANIMATION_TIME * base);
  const [secondSegment, setSecondSegment] = useState(
    depth === 0 ? 0 : depth / base,
  );
  const [thirdSegment, setThirdSegment] = useState(1);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (depth === 0) {
      setIsDelayed(false);
      setDuration(EDGE_ANIMATION_TIME * 2);
      setSecondSegment(0);
      setThirdSegment(0.5);
      return;
    }

    // For depths greater than 0, we only delay the animation
    // on the first run to create a staggered effect.
    if (isDelayed) {
      setDuration(EDGE_ANIMATION_TIME * base);
      setSecondSegment(depth / base);
      // setThirdSegment(base / (base + 1));
      timeout = setTimeout(
        () => {
          setIsDelayed(false);
          setDuration(EDGE_ANIMATION_TIME * 2);

          if (depth % 2 === 0) {
            setSecondSegment(0);
            setThirdSegment(0.5);
          } else {
            setSecondSegment(0.5);
            setThirdSegment(1);
          }
        },
        EDGE_ANIMATION_TIME * base * 1000,
      );
    } else {
      setDuration(EDGE_ANIMATION_TIME * 2);
      if (depth % 2 === 0) {
        setSecondSegment(0);
        setThirdSegment(0.5);
      } else {
        setSecondSegment(0.5);
        setThirdSegment(1);
      }
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [depth, isDelayed, base]);

  return {
    duration: `${duration}s`,
    keyPoints: '0;0;1;1',
    keyTimes: `0;${secondSegment};${thirdSegment};1`,
    calcMode: 'linear',
  };
}
