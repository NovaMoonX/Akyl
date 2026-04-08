import { ReactFlow } from '@xyflow/react';
import type { Edge, Node } from '../lib';
import type { Theme } from '../lib';
import { AnimatedInflowEdge, AnimatedOutflowEdge } from './edges';
import { HiddenNodeEdge } from './edges/HiddenNodeEdge';
import BudgetNode from './nodes/BudgetNode';
import CoreNode from './nodes/CoreNode';
import L1Node from './nodes/L1Node';

const THUMBNAIL_WIDTH = 480;
const THUMBNAIL_HEIGHT = 300;

const nodeTypes = { core: CoreNode, L1: L1Node, budget: BudgetNode };
const edgeTypes = {
  inflow: AnimatedInflowEdge,
  outflow: AnimatedOutflowEdge,
  hidden: HiddenNodeEdge,
};

interface Props {
  nodes: Node[];
  edges: Edge[];
}

/**
 * Renders a hidden, off-screen ReactFlow instance with the given theme.
 *
 * The wrapper applies either `.dark` (dark mode) or `.force-light` (light mode)
 * so CSS dark: utilities compute the correct colours without toggling the
 * document theme — eliminating any flash visible to the user.
 */
function HiddenFlow({ nodes, edges, theme }: Props & { theme: Theme }) {
  return (
    <div
      id={`hidden-flow-${theme}`}
      aria-hidden={true}
      className={theme === 'dark' ? 'dark' : 'force-light'}
      style={{
        position: 'fixed',
        left: `-${THUMBNAIL_WIDTH * 3}px`,
        top: 0,
        width: `${THUMBNAIL_WIDTH}px`,
        height: `${THUMBNAIL_HEIGHT}px`,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: -1,
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      />
    </div>
  );
}

/**
 * Renders two hidden ReactFlow instances (light + dark) off-screen so that
 * `useCaptureThumbnail` can capture themed thumbnails without toggling the
 * document class or causing any visible flash.
 */
export default function FlowHiddenCapture({ nodes, edges }: Props) {
  return (
    <>
      <HiddenFlow nodes={nodes} edges={edges} theme='light' />
      <HiddenFlow nodes={nodes} edges={edges} theme='dark' />
    </>
  );
}
