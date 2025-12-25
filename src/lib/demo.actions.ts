import { BackgroundVariant } from '@xyflow/react';
import { generateId, getTheme, getUserLocale } from '../utils';
import type { Expense, Income } from './budget.types';
import {
  CURRENT_APP_VERSION,
  CURRENT_FILE_VERSION,
  DEFAULT_TIME_WINDOW,
  SpaceAccentColors,
} from './space.constants';
import type { Sheet, Space } from './space.types';

/**
 * Creates a comprehensive demo space with realistic budget data
 * Includes 4+ incomes, 2+ sources, 10+ expenses, 3+ categories, 2+ sheets
 * Most items have descriptions and/or notes
 * Budget is balanced to net-zero
 */
export function createDemoSpace(userId?: string): Space {
  const id = generateId('space');
  const timestamp = Date.now();
  const theme = getTheme();

  // Create sheets first - start with default sheet
  const sheets: Sheet[] = [
    {
      id: generateId('sheet'),
      name: 'Sheet 1',
    },
    {
      id: generateId('sheet'),
      name: 'Monthly Essentials',
      color: '#3b82f6',
    },
    {
      id: generateId('sheet'),
      name: 'Annual Planning',
      color: '#8b5cf6',
    },
  ];

  // Create incomes with 2 sources (4 total incomes)
  const incomes: Income[] = [
    {
      id: generateId('budget'),
      label: 'Software Engineering Salary',
      description: 'Full-time position',
      amount: 7500,
      source: 'Tech Corp',
      type: 'Salary',
      cadence: { type: 'month', interval: 1 },
      notes: 'Direct deposit on the 1st of each month',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Year-End Bonus',
      description: 'Performance bonus',
      amount: 15000,
      source: 'Tech Corp',
      type: 'Bonus',
      cadence: { type: 'year', interval: 1 },
      notes: 'Typically paid in December',
      sheets: [sheets[0].id, sheets[2].id], // Sheet 1 and Annual Planning
    },
    {
      id: generateId('budget'),
      label: 'Web Development Projects',
      description: 'Client work',
      amount: 2000,
      source: 'Freelance',
      type: 'Freelance',
      cadence: { type: 'month', interval: 1 },
      notes: 'Average monthly income from side projects',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Dividend Income',
      description: 'Stock portfolio dividends',
      amount: 500,
      source: 'Freelance',
      type: 'Investment',
      cadence: { type: 'month', interval: 1 },
      notes: 'Reinvest half, use half for expenses',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
  ];

  // Calculate total monthly income
  // Monthly: 7500 + 2000 + 500 = 10,000
  // Annual bonus amortized: 15000 / 12 = 1,250
  // Total monthly: 11,250

  // Create expenses with 3+ categories (10+ total expenses)
  const expenses: Expense[] = [
    {
      id: generateId('budget'),
      label: 'Rent',
      description: '2BR apartment downtown',
      amount: 2500,
      category: 'Housing',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Includes parking spot',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Utilities',
      description: 'Electric, water, gas, internet',
      amount: 350,
      category: 'Housing',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Internet is $80/month',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Renters Insurance',
      description: 'Annual policy',
      amount: 350,
      category: 'Housing',
      subCategory: '',
      cadence: { type: 'year', interval: 1 },
      notes: 'Covers $50k personal property',
      sheets: [sheets[0].id, sheets[2].id], // Sheet 1 and Annual Planning
    },

    {
      id: generateId('budget'),
      label: 'Car Payment',
      description: '2022 sedan',
      amount: 450,
      category: 'Transportation',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: '24 months remaining',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Gas & Maintenance',
      description: 'Fuel and regular maintenance',
      amount: 300,
      category: 'Transportation',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: '',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Auto Insurance',
      description: 'Full coverage',
      amount: 1800,
      category: 'Transportation',
      subCategory: '',
      cadence: { type: 'year', interval: 1 },
      notes: 'Paid semi-annually',
      sheets: [sheets[0].id, sheets[2].id], // Sheet 1 and Annual Planning
    },

    {
      id: generateId('budget'),
      label: 'Weekly Groceries',
      description: 'Food shopping',
      amount: 200,
      category: 'Groceries',
      subCategory: '',
      cadence: { type: 'week', interval: 1 },
      notes: 'Trader Joes and farmers market',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },

    {
      id: generateId('budget'),
      label: 'Streaming Services',
      description: 'Netflix, Spotify, etc',
      amount: 45,
      category: 'Entertainment',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Family plan shared with roommate',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Dining Out & Activities',
      description: 'Restaurants, movies, events',
      amount: 455,
      category: 'Entertainment',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Budget for social activities',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },

    {
      id: generateId('budget'),
      label: 'Health Insurance Premium',
      description: 'Employer-sponsored plan',
      amount: 200,
      category: 'Healthcare',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Deducted from paycheck',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Medical Expenses',
      description: 'Co-pays, prescriptions, etc',
      amount: 150,
      category: 'Healthcare',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Average monthly healthcare costs',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },

    {
      id: generateId('budget'),
      label: 'Clothing & Personal Care',
      description: 'Clothes, haircuts, toiletries',
      amount: 250,
      category: 'Personal Spending',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: '',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Gym Membership',
      description: 'Local fitness center',
      amount: 150,
      category: 'Personal Spending',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: '24/7 access',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },

    {
      id: generateId('budget'),
      label: 'Emergency Fund',
      description: 'Building 6-month cushion',
      amount: 2000,
      category: 'Savings',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Goal: $30,000',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Retirement (401k)',
      description: 'Employer match up to 6%',
      amount: 2000,
      category: 'Savings',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Contributing 10% of salary',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
    {
      id: generateId('budget'),
      label: 'Investment Account',
      description: 'Index funds and ETFs',
      amount: 1349.02,
      category: 'Savings',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Long-term growth strategy',
      sheets: [sheets[0].id, sheets[1].id], // Sheet 1 and Monthly Essentials
    },
  ];
      sheets: [sheets[0].id],
    },
  ];

  // Budget breakdown using app's calculation method (monthly view):
  // The app converts all amounts to daily first, then to monthly for display
  // Daily = amount / cadence_days, Monthly = daily * 30
  // 
  // INCOME (monthly view):
  // - Salary: $7,500 (month) = 7500
  // - Bonus: $15,000 (year) = 15000 / 365 * 30 = 1232.88
  // - Freelance: $2,000 (month) = 2000
  // - Dividends: $500 (month) = 500
  // Total Income: $11,232.88
  // 
  // EXPENSES (monthly view):
  // - Rent: $2,500 (month) = 2500
  // - Utilities: $350 (month) = 350
  // - Renters Insurance: $350 (year) = 350 / 365 * 30 = 28.77
  // - Car Payment: $450 (month) = 450
  // - Gas & Maintenance: $300 (month) = 300
  // - Auto Insurance: $1,800 (year) = 1800 / 365 * 30 = 147.95
  // - Weekly Groceries: $200 (week) = 200 / 7 * 30 = 857.14
  // - Streaming: $45 (month) = 45
  // - Dining Out: $455 (month) = 455
  // - Health Insurance: $200 (month) = 200
  // - Medical Expenses: $150 (month) = 150
  // - Clothing: $250 (month) = 250
  // - Gym: $150 (month) = 150
  // - Emergency Fund: $2,000 (month) = 2000
  // - Retirement: $2,000 (month) = 2000
  // - Investment: $1,349.02 (month) = 1349.02 (calculated to balance budget)
  // Total Expenses: $11,232.88
  //
  // Net: $11,232.88 - $11,232.88 = $0.00 (balanced budget)

  const space: Space = {
    id,
    title: 'Demo Budget - Tech Professional',
    description: 'Sample budget showcasing income sources, expense categories, and savings goals',
    metadata: {
      createdBy: userId ?? '',
      createdAt: timestamp,
      updatedAt: timestamp,
      fileName: '',
      fileVersion: CURRENT_FILE_VERSION,
      appVersion: CURRENT_APP_VERSION,
      language: getUserLocale(),
    },
    incomes,
    expenses,
    sheets,
    config: {
      theme,
      backgroundPattern: BackgroundVariant.Cross,
      accentColor: SpaceAccentColors.default,
      currency: 'USD',
      cashFlowVerbiage: 'default',
      timeWindow: DEFAULT_TIME_WINDOW,
      activeSheet: 'all',
    },
  };

  return space;
}
