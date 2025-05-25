import { useEdgesState, useNodesState } from '@xyflow/react';
import { useEffect } from 'react';
import { NODE_IN_ID, NODE_OUT_ID, type Edge, type Node } from '../lib';
import useInitSpace from './useInitSpace';

const initNodes: Node[] = [
  {
    id: NODE_IN_ID,
    type: 'L1',
    position: { x: 0, y: 0 },
    data: {},
  },
  {
    id: NODE_OUT_ID,
    type: 'L1',
    position: { x: 0, y: 100 },
    data: {},
  },
];

const initEdge: Edge = {
  id: `${NODE_IN_ID}_${NODE_OUT_ID}`,
  source: NODE_IN_ID,
  target: NODE_OUT_ID,
};

export default function useSpaceFlow() {
  const { showLoadScreen } = useInitSpace();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    // TASK: fetch nodes from space (when loading from local storage as well)
    if (showLoadScreen) {
      setNodes(initNodes);
    }

    if (!showLoadScreen) {
      setEdges([initEdge]);
    }
  }, [showLoadScreen, setNodes, setEdges]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setEdges,
    setNodes,
  };
}
