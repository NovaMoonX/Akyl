import { type EdgeProps } from '@xyflow/react';
import { AnimatedBaseFlowEdge } from './AnimatedBaseFlowEdge';

export function AnimatedOutflowEdge({ ...edgeProps }: EdgeProps) {
  return <AnimatedBaseFlowEdge {...edgeProps} type='expense' />;
}
