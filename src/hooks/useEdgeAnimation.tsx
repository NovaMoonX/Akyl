import { useEffect, useState } from 'react';
import { EDGE_ANIMATION_TIME } from '../lib';

export default function useEdgeAnimation(depth: number = 0) {
  const base = depth + 1;
  const [isDelayed, setIsDelayed] = useState(depth > 0);
  const [duration, setDuration] = useState(
    depth === 0 ? EDGE_ANIMATION_TIME * base : EDGE_ANIMATION_TIME * base,
  );
  const [secondSegment, setSecondSegment] = useState(
    depth === 0 ? 0 : depth / base,
  );

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (depth === 0) {
      setIsDelayed(false);
      setDuration(EDGE_ANIMATION_TIME);
      setSecondSegment(0);
      return;
    }

    // For depths greater than 0, we only delay the animation
    // on the first run to create a staggered effect.
    if (isDelayed) {
      setDuration(EDGE_ANIMATION_TIME * base);
      setSecondSegment(depth / base);
      timeout = setTimeout(
        () => {
          setIsDelayed(false);
          setDuration(EDGE_ANIMATION_TIME);
          setSecondSegment(0);
        },
        EDGE_ANIMATION_TIME * base * 1000,
      );
    } else {
      setDuration(EDGE_ANIMATION_TIME);
      setSecondSegment(0);
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
    keyTimes: `0;${secondSegment};0.9;1`,
    calcMode: 'linear',
  };
}
