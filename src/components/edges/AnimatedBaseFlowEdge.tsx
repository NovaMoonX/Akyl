import { BaseEdge, getSmoothStepPath, type EdgeProps } from '@xyflow/react';
import { useEdgeAnimation } from '../../hooks';
import type { BudgetType, EdgeData } from '../../lib';
import { join } from '../../utils';

interface AnimatedBaseFlowEdgeProps extends EdgeProps {
  type: BudgetType;
}

export function AnimatedBaseFlowEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  type,
}: AnimatedBaseFlowEdgeProps) {
  const animationTreeLevel = (data as EdgeData)?.animationTreeLevel;
  const edgeAnimation = useEdgeAnimation(animationTreeLevel ?? 0);
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  if (animationTreeLevel === undefined) {
    console.warn(
      `${type.toUpperCase()} Edge ${id} is missing animationTreeLevel in data.`,
    );
    return <BaseEdge id={id} path={edgePath} />;
  }

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <circle
        r='10'
        className={join(
          type === 'expense' && 'fill-outflow dark:fill-outflow-darker',
          type === 'income' && 'fill-inflow dark:fill-inflow-darker',
        )}
      >
        <animateMotion
          repeatCount='indefinite'
          path={edgePath}
          dur={edgeAnimation.duration}
          keyPoints={edgeAnimation.keyPoints}
          keyTimes={edgeAnimation.keyTimes}
          calcMode={edgeAnimation.calcMode}
        />
      </circle>
    </>
  );
}
