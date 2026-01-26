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

  // Create sheets first
  const sheets: Sheet[] = [
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

  // Create incomes with 2 sources (4+ total incomes)
  // Includes examples of different end conditions
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
      sheets: [sheets[0].id], // Monthly Essentials
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
      sheets: [sheets[1].id], // Annual Planning
    },
    {
      id: generateId('budget'),
      label: '6-Month Contract Work',
      description: 'Fixed-term consulting project',
      amount: 3000,
      source: 'Freelance',
      type: 'Freelance',
      cadence: { type: 'month', interval: 1 },
      end: {
        type: 'period',
        period: { value: 6, cadence: 'month' },
      },
      notes: 'Contract ends after 6 months',
      sheets: [sheets[0].id],
    },
    {
      id: generateId('budget'),
      label: 'Tax Refund',
      description: 'Annual tax return',
      amount: 2500,
      source: 'Government',
      type: 'Other',
      // No cadence - this is a "once" item
      notes: 'One-time payment received this year',
      sheets: [sheets[1].id],
    },
  ];

  // Calculate total monthly income (in monthly view, with end conditions applied)
  // This demo showcases various end conditions and cadence types
  // Exact totals depend on time window and end condition enforcement

  // Create expenses with 3+ categories (10+ total expenses)
  // Includes examples of different end conditions
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
      sheets: [sheets[0].id],
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
      sheets: [sheets[0].id],
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
      sheets: [sheets[1].id],
    },

    {
      id: generateId('budget'),
      label: 'Car Loan Payment',
      description: '2022 sedan - 24 payments remaining',
      amount: 450,
      category: 'Transportation',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      end: {
        type: 'occurrences',
        occurrences: 24,
      },
      notes: 'Loan ends after 24 more monthly payments',
      sheets: [sheets[0].id],
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
      sheets: [sheets[0].id],
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
      sheets: [sheets[1].id],
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
      sheets: [sheets[0].id],
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
      sheets: [sheets[0].id],
    },
    {
      id: generateId('budget'),
      label: 'Dining Out & Activities',
      description: 'Restaurants, movies, events',
      amount: 400,
      category: 'Entertainment',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Budget for social activities',
      sheets: [sheets[0].id],
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
      sheets: [sheets[0].id],
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
      sheets: [sheets[0].id],
    },

    {
      id: generateId('budget'),
      label: 'Gym Membership (12-month commitment)',
      description: 'Local fitness center - prepaid annual plan',
      amount: 50,
      category: 'Personal Spending',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      end: {
        type: 'period',
        period: { value: 12, cadence: 'month' },
      },
      notes: 'Annual membership ends in 12 months',
      sheets: [sheets[0].id],
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
      sheets: [sheets[0].id],
    },
    {
      id: generateId('budget'),
      label: 'New Laptop Purchase',
      description: 'MacBook Pro for development',
      amount: 2500,
      category: 'Personal Spending',
      subCategory: '',
      // No cadence - this is a "once" expense
      notes: 'One-time purchase this quarter',
      sheets: [sheets[0].id],
    },

    {
      id: generateId('budget'),
      label: 'Student Loan Payment',
      description: 'Remaining balance being paid off',
      amount: 300,
      category: 'Debt',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      end: {
        type: 'amount',
        amount: 5000,
      },
      notes: 'Paying down $5,000 remaining balance',
      sheets: [sheets[0].id],
    },

    {
      id: generateId('budget'),
      label: 'Emergency Fund',
      description: 'Building 6-month cushion',
      amount: 1500,
      category: 'Savings',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Goal: $30,000',
      sheets: [sheets[0].id],
    },
    {
      id: generateId('budget'),
      label: 'Retirement (401k)',
      description: 'Employer match up to 6%',
      amount: 1500,
      category: 'Savings',
      subCategory: '',
      cadence: { type: 'month', interval: 1 },
      notes: 'Contributing 10% of salary',
      sheets: [sheets[0].id],
    },
  ];

  // Budget breakdown - Demo showcases various end conditions:
  // 
  // INCOME examples:
  // - Regular salary: Monthly recurring (no end)
  // - Year-end bonus: Annual recurring (no end)
  // - Contract work: Monthly with period end (6 months)
  // - Tax refund: One-time "once" item (no cadence)
  // 
  // EXPENSE examples:
  // - Car loan: Monthly with occurrence end (24 payments)
  // - Gym membership: Monthly with period end (12 months)
  // - Student loan: Monthly with amount end ($5,000 total)
  // - New laptop: One-time "once" item (no cadence)
  // - Regular expenses: Monthly/weekly/annual recurring (no end)
  //
  // This demo showcases all budget item types:
  // 1. Recurring with no end (traditional)
  // 2. Recurring with occurrence cap
  // 3. Recurring with period cap
  // 4. Recurring with amount cap
  // 5. One-time "once" items

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
