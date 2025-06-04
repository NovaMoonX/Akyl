import { useEdgesState, useNodesState } from '@xyflow/react';
import { useMemo } from 'react';
import { useShallow } from 'zustand/shallow';
import {
  generateExpenseNodesAndEdges,
  generateIncomeNodesAndEdges,
  NODE_CORE_ID,
  type Edge,
  type Node,
} from '../lib';
import { useSpace } from '../store';
import useBudget from './useBudget';
import useInitSpace from './useInitSpace';

const coreNode: Node = {
  id: NODE_CORE_ID,
  type: 'core',
  position: { x: 0, y: 0 },
  data: {},
  draggable: false,
};

export default function useSpaceFlow() {
  const { showLoadScreen } = useInitSpace();
  const [, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const {
    incomeBySource,
    expenseByCategory,
    incomesSourceHiddenMap,
    expensesCategoryHiddenMap,
  } = useBudget();
  const [hideSources, hideCategories] = useSpace(
    useShallow((state) => [
      state?.space?.config?.hideSources,
      state?.space?.config?.hideCategories,
    ]),
  );

  const coreNodes = useMemo(() => {
    if (showLoadScreen) {
      return [];
    }
    return [coreNode];
  }, [showLoadScreen]);

  const { incomeNodes, incomeEdges } = useMemo(() => {
    if (showLoadScreen) {
      return {
        incomeNodes: [],
        incomeEdges: [],
      };
    }
    return generateIncomeNodesAndEdges(
      incomeBySource,
      incomesSourceHiddenMap,
      hideSources,
    );
  }, [incomeBySource, incomesSourceHiddenMap, showLoadScreen, hideSources]);

  const { expenseNodes, expenseEdges } = useMemo(() => {
    if (showLoadScreen) {
      return {
        expenseNodes: [],
        expenseEdges: [],
      };
    }
    return generateExpenseNodesAndEdges(
      expenseByCategory,
      expensesCategoryHiddenMap,
      hideCategories,
    );
  }, [
    expenseByCategory,
    expensesCategoryHiddenMap,
    showLoadScreen,
    hideCategories,
  ]);

  return {
    nodes: [...coreNodes, ...incomeNodes, ...expenseNodes],
    edges: [...incomeEdges, ...expenseEdges],
    onNodesChange,
    onEdgesChange,
    setEdges,
    setNodes,
  };
}
