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

export function createNewSpace(userId?: string) {
  const id = generateId('space');
  const timestamp = Date.now();
  const theme = getTheme();

  const space: Space = {
    id,
    title: '',
    description: '',
    metadata: {
      createdBy: userId ?? '',
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

export function deleteSpace(spaceId: string, redirect = true) {
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
  incomesSourceHiddenMap: Record<string, boolean>,
  hideSources: boolean = false,
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

  // Build a map of source to its income items' indices (for X positioning)
  const sourceIncomeIndices: Record<string, number[]> = {};
  let incomeItemIndex = 0;
  sources.forEach((source, bucketIndex) => {
    sourceIncomeIndices[source] = [];
    incomeBySource[source].items.forEach((income) => {
      allIncomeItems.push({ income, source, bucketIndex });
      sourceIncomeIndices[source].push(incomeItemIndex);
      incomeItemIndex++;
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
        y: hideSources ? INCOME_BUCKET_Y : INCOME_ITEM_Y,
      },
      data: { budgetItemId: income.id, hidden: income.hidden },
      draggable: false,
    });

    if (hideSources) {
      edges.push({
        id: `${income.id}_to_${NODE_CORE_ID}`,
        source: income.id,
        target: NODE_CORE_ID,
        type: income.hidden ? 'hidden' : 'inflow',
        ...(income.hidden ? {} : { data: { animationTreeLevel: 0 } }),
      });
    }
  });

  // If sources are hidden, we don't create bucket nodes
  if (hideSources) {
    return { incomeNodes: nodes, incomeEdges: edges };
  }

  sources.forEach((source) => {
    const bucketId = generateId('budget');
    const { total, items } = incomeBySource[source];
    const indices = sourceIncomeIndices[source];
    if (indices.length === 0) return;
    // Find the center X of this source's income items
    const firstX = budgetStartX + indices[0] * BUCKET_SPACING_X;
    const lastX = budgetStartX + indices[indices.length - 1] * BUCKET_SPACING_X;
    const bucketNodeX = (firstX + lastX) / 2;
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
    const isSourceHidden = incomesSourceHiddenMap[source];
    edges.push({
      id: `${bucketId}_to_${NODE_CORE_ID}`,
      source: bucketId,
      target: NODE_CORE_ID,
      type: isSourceHidden ? 'hidden' : 'inflow',
      ...(isSourceHidden ? {} : { data: { animationTreeLevel: 1 } }),
    });

    // For each income item under this source, find its index in allIncomeItems
    items.forEach((income) => {
      const isHidden = income.hidden;
      edges.push({
        id: `${income.id}_to_${bucketId}`,
        source: income.id,
        target: bucketId,
        type: isHidden ? 'hidden' : 'inflow',
        ...(isHidden ? {} : { data: { animationTreeLevel: 0 } }),
      });
    });
  });

  return { incomeNodes: nodes, incomeEdges: edges };
}

// Refactored to create all level 0 (budget) nodes first, then all level 1 (bucket) nodes, both equally spaced
export function generateExpenseNodesAndEdges(
  expenseByCategory: Record<string, { total: number; items: Expense[] }>,
  expensesCategoryHiddenMap: Record<string, boolean>,
  hideCategories: boolean = false,
  hideSources: boolean = false,
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

  // Build a map of category to its expense items' indices (for X positioning)
  const categoryExpenseIndices: Record<string, number[]> = {};
  let expenseItemIndex = 0;
  categories.forEach((category, bucketIndex) => {
    categoryExpenseIndices[category] = [];
    expenseByCategory[category].items.forEach((expense) => {
      allExpenseItems.push({ expense, category, bucketIndex });
      categoryExpenseIndices[category].push(expenseItemIndex);
      expenseItemIndex++;
    });
  });

  // Calculate spacing for budget nodes (level 0)
  const totalBudgetNodes = allExpenseItems.length;
  const budgetStartX = -((totalBudgetNodes - 1) * BUCKET_SPACING_X) / 2;

  // Add all budget nodes (level 0)
  allExpenseItems.forEach(({ expense }, i) => {
    nodes.push({
      id: expense.id,
      type: 'budget',
      position: {
        x: budgetStartX + i * BUCKET_SPACING_X,
        y: hideCategories ? EXPENSE_BUCKET_Y : EXPENSE_ITEM_Y,
      },
      data: { budgetItemId: expense.id, hidden: expense.hidden },
      draggable: false,
    });

    if (hideCategories) {
      edges.push({
        id: `${expense.id}_to_${NODE_CORE_ID}`,
        source: NODE_CORE_ID,
        target: expense.id,
        type: expense.hidden ? 'hidden' : 'outflow',
        ...(expense.hidden
          ? {}
          : { data: { animationTreeLevel: hideSources ? 1 : 2 } }),
      });
    }
  });

  // If categories are hidden, we don't create bucket nodes
  if (hideCategories) {
    return { expenseNodes: nodes, expenseEdges: edges };
  }

  // Add all bucket nodes (level 1), centered above their expense items
  categories.forEach((category) => {
    const bucketId = generateId('budget');
    const { total, items } = expenseByCategory[category];
    const indices = categoryExpenseIndices[category];
    if (indices.length === 0) return;
    // Find the center X of this category's expense items
    const firstX = budgetStartX + indices[0] * BUCKET_SPACING_X;
    const lastX = budgetStartX + indices[indices.length - 1] * BUCKET_SPACING_X;
    const bucketNodeX = (firstX + lastX) / 2;
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
    const isCategoryHidden = expensesCategoryHiddenMap[category];
    edges.push({
      id: `core_to_${bucketId}`,
      source: NODE_CORE_ID,
      target: bucketId,
      type: isCategoryHidden ? 'hidden' : 'outflow',
      ...(isCategoryHidden ? {} : { data: { animationTreeLevel: 2 } }),
    });

    // For each expense item under this category, find its index in allExpenseItems
    items.forEach((expense) => {
      const isHidden = expense.hidden;
      edges.push({
        id: `${bucketId}_to_${expense.id}`,
        source: bucketId,
        target: expense.id,
        type: isHidden ? 'hidden' : 'outflow',
        ...(isHidden ? {} : { data: { animationTreeLevel: 3 } }),
      });
    });
  });

  return { expenseNodes: nodes, expenseEdges: edges };
}
