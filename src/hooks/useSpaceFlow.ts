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

const demoNodes: Node[] = [
  {
    id: 'income-1',
    type: 'L1',
    position: { x: -100, y: -200 },
    data: { label: 'HubSpot', amount: 200, type: 'income' },
    draggable: false,
  },
  {
    id: 'income-2',
    type: 'L1',
    position: { x: 100, y: -200 },
    data: { label: 'Side Gig (Photography)', amount: 450.50, type: 'income' },
    draggable: false,
  },
  {
    id: 'expense-1',
    type: 'L1',
    position: { x: -100, y: 200 },
    data: { label: 'Rent', amount: 50.75, type: 'expense' },
    draggable: false,
  },
  {
    id: 'expense-2',
    type: 'L1',
    position: { x: 100, y: 200 },
    data: { label: 'Other Bills (Utilities)', amount: 100, type: 'expense' },
    draggable: false,
  }
]

const demoEdges: Edge[] = [
  {
    id: 'income-1-to-core',
    source: 'income-1',
    target: NODE_CORE_ID,
  },
  {
    id: 'income-2-to-core',
    source: 'income-2',
    target: NODE_CORE_ID,
  },
  {
    id: 'core-to-expense-1',
    source: NODE_CORE_ID,
    target: 'expense-1',
  },
  {
    id: 'core-to-expense-2',
    source: NODE_CORE_ID,
    target: 'expense-2',
  },
];

export default function useSpaceFlow() {
  const { showLoadScreen } = useInitSpace();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  useEffect(() => {
    // TASK: fetch nodes from space (when loading from local storage as well)
    if (showLoadScreen) {
      setNodes([...initNodes, ...demoNodes]);
      setEdges(demoEdges);
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
