import { type EdgeProps } from '@xyflow/react';
import { AnimatedBaseFlowEdge } from './AnimatedBaseFlowEdge';

export function AnimatedInflowEdge({ ...edgeProps }: EdgeProps) {
  return <AnimatedBaseFlowEdge {...edgeProps} type='income' />;
}
