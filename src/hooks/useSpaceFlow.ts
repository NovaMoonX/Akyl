import { useEdgesState, useNodesState } from '@xyflow/react';
import { useEffect } from 'react';
import { NODE_CORE_ID, type Edge, type Node } from '../lib';
import useInitSpace from './useInitSpace';

const initNodes: Node[] = [
  {
    id: NODE_CORE_ID,
    type: 'core',
    position: { x: 0, y: 0 },
    data: {},
    draggable: false,
  },
];

export default function useSpaceFlow() {
  const { showLoadScreen } = useInitSpace();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    // TASK: fetch nodes from space (when loading from local storage as well)
    if (showLoadScreen) {
      setNodes(initNodes);
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
