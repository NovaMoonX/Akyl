import { BackgroundVariant } from '@xyflow/react';
import { generateId, getTheme, getUserLocale } from '../utils';
import type { Expense, Income } from './budget.types';
import { NODE_CORE_ID } from './node.constants';
import type { Edge, Node } from './node.types';
import {
  BUCKET_SPACING_X,
  CURRENT_APP_VERSION,
  CURRENT_FILE_VERSION,
  SpaceAccentColors,
} from './space.constants';
import type { Space } from './space.types';

export function createNewSpace() {
  const id = generateId('space');
  const timestamp = Date.now();
  const theme = getTheme();

  const space: Space = {
    id,
    title: '',
    description: '',
    metadata: {
      createdBy: '',
      createdAt: timestamp,
      updatedAt: timestamp,
      fileName: '',
      fileVersion: CURRENT_FILE_VERSION,
      appVersion: CURRENT_APP_VERSION,
      language: getUserLocale(),
    },
    incomes: [],
    expenses: [],
    config: {
      theme,
      backgroundPattern: BackgroundVariant.Cross,
      accentColor: SpaceAccentColors.default,
      currency: 'USD',
      cashFlowVerbiage: 'default',
    },
  };
  localStorage.setItem(id, JSON.stringify(space));
  window.location.href = `/${space.id}`;
}

export function duplicateSpace(spaceId: string) {
  const space = localStorage.getItem(spaceId);
  if (!space) return;

  const parsedSpace = JSON.parse(space) as Space;
  const newSpaceId = generateId('space');
  const timestamp = Date.now();

  const newSpace: Space = {
    ...parsedSpace,
    id: newSpaceId,
    title: `${parsedSpace.title} (Copy)`,
    metadata: {
      ...parsedSpace.metadata,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  localStorage.setItem(newSpaceId, JSON.stringify(newSpace));
  window.location.href = `/${newSpaceId}`;
}

export function generateIncomeNodesAndEdges(
  incomeBySource: Record<string, { total: number; items: Income[] }>,
) {
  const bucketY = -200;
  const itemY = -400;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  Object.entries(incomeBySource).forEach(
    ([source, { total, items }], bucketIndex) => {
      const bucketId = generateId('budget');

      // L1 bucket node for the source
      nodes.push({
        id: bucketId,
        type: 'L1',
        position: {
          x:
            bucketIndex * BUCKET_SPACING_X -
            (BUCKET_SPACING_X * (Object.keys(incomeBySource).length - 1)) / 2,
          y: bucketY,
        },
        data: { label: source, amount: total, type: 'income' },
        draggable: false,
      });

      // Edge from bucket to core
      edges.push({
        id: `${bucketId}_to_${NODE_CORE_ID}`,
        source: bucketId,
        target: NODE_CORE_ID,
        type: 'inflow',
        data: { animationTreeLevel: 1 },
      });

      // For each income item under this source
      items.forEach((income, incomeIndex) => {
        const itemId = income.id;
        // Budget node for the income item
        nodes.push({
          id: itemId,
          type: 'budget',
          position: {
            x:
              bucketIndex * BUCKET_SPACING_X -
              (BUCKET_SPACING_X * (Object.keys(incomeBySource).length - 1)) /
                2 +
              incomeIndex * 50,
            y: itemY,
          },
          data: { budgetItemId: itemId },
          draggable: false,
        });

        // Edge from item to bucket
        edges.push({
          id: `${itemId}_to_${bucketId}`,
          source: itemId,
          target: bucketId,
          type: 'inflow',
          data: { animationTreeLevel: 0 },
        });
      });
    },
  );
  return { incomeNodes: nodes, incomeEdges: edges };
}

export function generateExpenseNodesAndEdges(
  expenseByCategory: Record<string, { total: number; items: Expense[] }>,
) {
  const bucketY = 300;
  const itemY = 500;
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  Object.entries(expenseByCategory).forEach(
    ([category, { total, items }], bucketIndex) => {
      const bucketId = generateId('budget');

      // L1 bucket node for the category
      nodes.push({
        id: bucketId,
        type: 'L1',
        position: {
          x:
            bucketIndex * BUCKET_SPACING_X -
            (BUCKET_SPACING_X * (Object.keys(expenseByCategory).length - 1)) /
              2,
          y: bucketY,
        },
        data: { label: category, amount: total, type: 'expense' },
        draggable: false,
      });

      // Edge from core to bucket
      edges.push({
        id: `core_to_${bucketId}`,
        source: NODE_CORE_ID,
        target: bucketId,
        type: 'outflow',
        data: { animationTreeLevel: 2 },
      });

      // For each expense item under this category
      items.forEach((expense, expenseIndex) => {
        const itemId = expense.id;
        // Budget node for the expense item
        nodes.push({
          id: itemId,
          type: 'budget',
          position: {
            x:
              bucketIndex * BUCKET_SPACING_X -
              (BUCKET_SPACING_X * (Object.keys(expenseByCategory).length - 1)) /
                2 +
              expenseIndex * 50,
            y: itemY,
          },
          data: { budgetItemId: itemId },
          draggable: false,
        });

        // Edge from bucket to item
        edges.push({
          id: `${bucketId}_to_${itemId}`,
          source: bucketId,
          target: itemId,
          type: 'outflow',
          data: { animationTreeLevel: 3 },
        });
      });
    },
  );
  return { expenseNodes: nodes, expenseEdges: edges };
}
