import { BackgroundVariant } from '@xyflow/react';
import { generateId, getTheme, getUserLocale } from '../utils';
import type { Expense, Income } from './budget.types';
import { NODE_CORE_ID } from './node.constants';
import type { Edge, Node } from './node.types';
import {
  BUCKET_SPACING_X,
  CURRENT_APP_VERSION,
  CURRENT_FILE_VERSION,
  DEFAULT_TIME_WINDOW,
  EXPENSE_BUCKET_Y,
  EXPENSE_ITEM_Y,
  INCOME_BUCKET_Y,
  INCOME_ITEM_Y,
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
      timeWindow: DEFAULT_TIME_WINDOW,
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

export function removeLocalSpace(spaceId: string, redirect = true) {
  if (!spaceId) return;

  if (localStorage.getItem(spaceId)) {
    localStorage.removeItem(spaceId);

    const isHome = window.location.pathname === '/';
    if (!isHome && redirect) {
      window.location.href = '/';
    }
  }
}

// Refactored to create all level 0 (budget) nodes first, then all level 1 (bucket) nodes, both equally spaced
export function generateIncomeNodesAndEdges(
  incomeBySource: Record<string, { total: number; items: Income[] }>,
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Gather all income items and sources
  const allIncomeItems: {
    income: Income;
    source: string;
    bucketIndex: number;
  }[] = [];
  const sources = Object.keys(incomeBySource);

  sources.forEach((source, bucketIndex) => {
    incomeBySource[source].items.forEach((income) => {
      allIncomeItems.push({ income, source, bucketIndex });
    });
  });

  // Calculate spacing for budget nodes (level 0)
  const totalBudgetNodes = allIncomeItems.length;
  const budgetStartX = -((totalBudgetNodes - 1) * BUCKET_SPACING_X) / 2;

  // Add all budget nodes (level 0)
  allIncomeItems.forEach(({ income }, i) => {
    nodes.push({
      id: income.id,
      type: 'budget',
      position: {
        x: budgetStartX + i * BUCKET_SPACING_X,
        y: INCOME_ITEM_Y,
      },
      data: { budgetItemId: income.id },
      draggable: false,
    });
  });

  // Calculate spacing for bucket nodes (level 1)
  const totalBuckets = sources.length;
  const bucketStartX = -((totalBuckets - 1) * BUCKET_SPACING_X) / 2;

  // Add all bucket nodes (level 1)
  sources.forEach((source, bucketIndex) => {
    const bucketId = generateId('budget');
    const { total, items } = incomeBySource[source];
    const bucketNodeX = bucketStartX + bucketIndex * BUCKET_SPACING_X;
    nodes.push({
      id: bucketId,
      type: 'L1',
      position: {
        x: bucketNodeX,
        y: INCOME_BUCKET_Y,
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

    // For each income item under this source, find its index in allIncomeItems
    items.forEach((income) => {
      const budgetNodeIndex = allIncomeItems.findIndex(
        (item) => item.income.id === income.id,
      );
      if (budgetNodeIndex !== -1) {
        // Edge from budget node to bucket
        edges.push({
          id: `${income.id}_to_${bucketId}`,
          source: income.id,
          target: bucketId,
          type: 'inflow',
          data: { animationTreeLevel: 0 },
        });
      }
    });
  });

  return { incomeNodes: nodes, incomeEdges: edges };
}

// Refactored to create all level 0 (budget) nodes first, then all level 1 (bucket) nodes, both equally spaced
export function generateExpenseNodesAndEdges(
  expenseByCategory: Record<string, { total: number; items: Expense[] }>,
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Gather all expense items and categories
  const allExpenseItems: {
    expense: Expense;
    category: string;
    bucketIndex: number;
  }[] = [];
  const categories = Object.keys(expenseByCategory);

  categories.forEach((category, bucketIndex) => {
    expenseByCategory[category].items.forEach((expense) => {
      allExpenseItems.push({ expense, category, bucketIndex });
    });
  });

  // Calculate spacing for budget nodes (level 0)
  const totalBudgetNodes = allExpenseItems.length;
  const budgetSpacing = BUCKET_SPACING_X;
  const budgetStartX = -((totalBudgetNodes - 1) * budgetSpacing) / 2;

  // Add all budget nodes (level 0)
  allExpenseItems.forEach(({ expense }, i) => {
    nodes.push({
      id: expense.id,
      type: 'budget',
      position: {
        x: budgetStartX + i * budgetSpacing,
        y: EXPENSE_ITEM_Y,
      },
      data: { budgetItemId: expense.id },
      draggable: false,
    });
  });

  // Calculate spacing for bucket nodes (level 1)
  const totalBuckets = categories.length;
  const bucketSpacing = BUCKET_SPACING_X;
  const bucketStartX = -((totalBuckets - 1) * bucketSpacing) / 2;

  // Add all bucket nodes (level 1)
  categories.forEach((category, bucketIndex) => {
    const bucketId = generateId('budget');
    const { total, items } = expenseByCategory[category];
    const bucketNodeX = bucketStartX + bucketIndex * bucketSpacing;
    nodes.push({
      id: bucketId,
      type: 'L1',
      position: {
        x: bucketNodeX,
        y: EXPENSE_BUCKET_Y,
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

    // For each expense item under this category, find its index in allExpenseItems
    items.forEach((expense) => {
      const budgetNodeIndex = allExpenseItems.findIndex(
        (item) => item.expense.id === expense.id,
      );
      if (budgetNodeIndex !== -1) {
        // Edge from bucket to budget node
        edges.push({
          id: `${bucketId}_to_${expense.id}`,
          source: bucketId,
          target: expense.id,
          type: 'outflow',
          data: { animationTreeLevel: 3 },
        });
      }
    });
  });

  return { expenseNodes: nodes, expenseEdges: edges };
}
