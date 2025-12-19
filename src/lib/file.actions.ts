import {
  FILE_EXTENSION,
  FILE_HEADER_FIRST_LINE,
  FILE_HEADER_SECOND_LINE,
  FILE_HEADER_THIRD_LINE,
  FILE_TYPE,
} from './file.constants';
import type { Expense, Income } from './budget.types';
import type { Space } from './space.types';
import { generateId } from '../utils';

export function exportFile(fileName: string, space: Space) {
  const jsonData = JSON.stringify(space, null, 2);
  const fileContent = [
    FILE_HEADER_FIRST_LINE,
    FILE_HEADER_SECOND_LINE,
    FILE_HEADER_THIRD_LINE,
    jsonData,
  ].join('\n');

  const file = new Blob([fileContent], { type: FILE_TYPE });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.trim()}${FILE_EXTENSION}`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importFile(): Promise<Space> {
  const handleImport: (file: File) => Promise<Space | null> = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const lines = content.split('\n');
        if (
          lines[0] !== FILE_HEADER_FIRST_LINE ||
          lines[1] !== FILE_HEADER_SECOND_LINE ||
          lines[2] !== FILE_HEADER_THIRD_LINE
        ) {
          reject(new Error('Invalid file format'));
          return;
        }
        const jsonData = lines.slice(3)?.join('\n') || '';
        try {
          const space = JSON.parse(jsonData);
          resolve(space);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => {
        reject(error);
      };
      reader.readAsText(file);
    });
  };

  const file = await pickFile();
  if (!file) {
    throw new Error('No file selected');
  }
  const fileContent = await handleImport(file);
  if (typeof fileContent === 'object' && fileContent !== null) {
    const fileSpace = fileContent as Space;
    if (fileSpace?.id) {
      localStorage.setItem(fileSpace.id, JSON.stringify(fileSpace));
      setTimeout(() => {
        window.location.href = `/${fileSpace.id}`;
      }, 100);
    }
    throw new Error('Invalid file content - no ID');
  }
  throw new Error('Invalid file content - no object');
}

export function pickFile(acceptedFileTypes?: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.accept = acceptedFileTypes || FILE_EXTENSION;

    input.onchange = () => {
      if (input.files && input.files[0]) {
        resolve(input.files[0]);
      } else {
        reject(new Error('No file selected'));
      }
      document.body.removeChild(input);
    };

    input.onerror = (e) => {
      reject(e);
      document.body.removeChild(input);
    };

    document.body.appendChild(input);
    input.click();
  });
}

export function exportCSV(fileName: string, space: Space, sheetId?: string) {
  // Filter items by sheet if specified
  let incomes = space.incomes;
  let expenses = space.expenses;

  if (sheetId && sheetId !== 'all') {
    incomes = space.incomes.filter(
      (income: Income) =>
        // Only include items that are explicitly assigned to this sheet
        income.sheets && income.sheets.includes(sheetId)
    );
    expenses = space.expenses.filter(
      (expense: Expense) =>
        // Only include items that are explicitly assigned to this sheet
        expense.sheets && expense.sheets.includes(sheetId)
    );
  }

  // Create CSV content for incomes
  const incomesCSV = [
    'Type,Label,Description,Amount,Source,Frequency Interval,Frequency Type,Notes',
    ...incomes.map((income: Income) =>
      [
        'Income',
        escapeCSV(income.label),
        escapeCSV(income.description),
        income.amount,
        escapeCSV(income.source),
        income.cadence?.interval || 1,
        income.cadence?.type || 'month',
        escapeCSV(income.notes),
      ].join(',')
    ),
  ];

  // Create CSV content for expenses
  const expensesCSV = [
    'Type,Label,Description,Amount,Category,Frequency Interval,Frequency Type,Notes',
    ...expenses.map((expense: Expense) =>
      [
        'Expense',
        escapeCSV(expense.label),
        escapeCSV(expense.description),
        expense.amount,
        escapeCSV(expense.category),
        expense.cadence?.interval || 1,
        expense.cadence?.type || 'month',
        escapeCSV(expense.notes),
      ].join(',')
    ),
  ];

  // Combine incomes and expenses
  const csvContent = [...incomesCSV, '', ...expensesCSV].join('\n');

  const file = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${fileName.trim()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSVTemplate() {
  const incomesCSV = [
    'Type,Label,Description,Amount,Source,Frequency Interval,Frequency Type,Notes',
    'Income,Salary,Monthly salary,5000,Tech Company,1,month,Regular income',
    'Income,Freelance,Side projects,1000,Freelance Work,2,week,Variable income',
  ];

  const expensesCSV = [
    'Type,Label,Description,Amount,Category,Frequency Interval,Frequency Type,Notes',
    'Expense,Rent,Monthly rent payment,1500,Housing,1,month,Fixed cost',
    'Expense,Groceries,Food and supplies,500,Food,1,week,Weekly shopping',
  ];

  const csvContent = [...incomesCSV, '', ...expensesCSV].join('\n');

  const file = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'budget-template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCSV(value: string): string {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function importCSV(
  file: File,
  sheetId?: string
): Promise<{ incomes: Income[]; expenses: Expense[] }> {
  if (!file) {
    throw new Error('No file selected');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split('\n').filter((line) => line.trim());

        let currentSection: 'income' | 'expense' | null = null;
        const newIncomes: Income[] = [];
        const newExpenses: Expense[] = [];

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const cells = parseCSVLine(line);

          // Skip empty lines
          if (cells.length === 0) continue;

          // Detect section headers
          if (cells[0] === 'Type' && cells[1] === 'Label') {
            // Check if this is income or expense header
            if (cells.includes('Source')) {
              currentSection = 'income';
            } else if (cells.includes('Category')) {
              currentSection = 'expense';
            }
            continue;
          }

          // Parse data rows
          if (currentSection === 'income' && cells.length >= 4) {
            // Determine if this row has frequency data
            const frequencyInterval = cells.length >= 6 && cells[5] ? parseInt(cells[5]) : 1;
            const frequencyType = cells.length >= 7 && cells[6] ? cells[6].toLowerCase() : 'month';
            
            const income: Income = {
              id: generateId('budget'),
              label: cells[1],
              description: cells[2],
              amount: parseFloat(cells[3]) || 0,
              source: cells[4],
              type: cells[4], // Using source as type
              cadence: {
                type: (frequencyType === 'day' || frequencyType === 'week' || frequencyType === 'month' || frequencyType === 'year') 
                  ? frequencyType 
                  : 'month',
                interval: isNaN(frequencyInterval) || frequencyInterval < 1 ? 1 : frequencyInterval,
              },
              notes: cells.length >= 8 ? cells[7] || '' : (cells[5] || ''),
            };
            // Assign to sheet if specified
            if (sheetId && sheetId !== 'all') {
              income.sheets = [sheetId];
            }
            newIncomes.push(income);
          } else if (currentSection === 'expense' && cells.length >= 4) {
            // Determine if this row has frequency data
            const frequencyInterval = cells.length >= 6 && cells[5] ? parseInt(cells[5]) : 1;
            const frequencyType = cells.length >= 7 && cells[6] ? cells[6].toLowerCase() : 'month';
            
            const expense: Expense = {
              id: generateId('budget'),
              label: cells[1],
              description: cells[2],
              amount: parseFloat(cells[3]) || 0,
              category: cells[4],
              subCategory: '', // Default to empty since not included in CSV
              cadence: {
                type: (frequencyType === 'day' || frequencyType === 'week' || frequencyType === 'month' || frequencyType === 'year') 
                  ? frequencyType 
                  : 'month',
                interval: isNaN(frequencyInterval) || frequencyInterval < 1 ? 1 : frequencyInterval,
              },
              notes: cells.length >= 8 ? cells[7] || '' : (cells[5] || ''),
            };
            // Assign to sheet if specified
            if (sheetId && sheetId !== 'all') {
              expense.sheets = [sheetId];
            }
            newExpenses.push(expense);
          }
        }

        resolve({ incomes: newIncomes, expenses: newExpenses });
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(file);
  });
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current);

  return result;
}

export interface CSVValidationResult {
  valid: boolean;
  errors: string[];
  hasFrequency: boolean;
}

export function validateCSV(content: string): CSVValidationResult {
  const errors: string[] = [];
  const lines = content.split('\n').filter((line) => line.trim());
  
  if (lines.length === 0) {
    return { valid: false, errors: ['CSV file is empty'], hasFrequency: false };
  }

  let hasIncomeSection = false;
  let hasExpenseSection = false;
  let hasFrequency = false;
  let incomeHeaderIndex = -1;
  let expenseHeaderIndex = -1;

  // Find sections and validate headers
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = parseCSVLine(line);
    
    // Detect section headers
    if (cells[0] === 'Type' && cells[1] === 'Label') {
      if (cells.includes('Source')) {
        hasIncomeSection = true;
        incomeHeaderIndex = i;
        
        // Check for required columns
        const hasType = cells.includes('Type');
        const hasLabel = cells.includes('Label');
        const hasAmount = cells.includes('Amount');
        const hasSource = cells.includes('Source');
        
        if (!hasType || !hasLabel || !hasAmount || !hasSource) {
          errors.push('Income section missing required columns (Type, Label, Amount, Source)');
        }
        
        // Check if frequency columns are present
        if (cells.includes('Frequency Interval') && cells.includes('Frequency Type')) {
          hasFrequency = true;
        }
        
      } else if (cells.includes('Category')) {
        hasExpenseSection = true;
        expenseHeaderIndex = i;
        
        // Check for required columns
        const hasType = cells.includes('Type');
        const hasLabel = cells.includes('Label');
        const hasAmount = cells.includes('Amount');
        const hasCategory = cells.includes('Category');
        
        if (!hasType || !hasLabel || !hasAmount || !hasCategory) {
          errors.push('Expense section missing required columns (Type, Label, Amount, Category)');
        }
        
        // Check if frequency columns are present
        if (cells.includes('Frequency Interval') && cells.includes('Frequency Type')) {
          hasFrequency = true;
        }
      }
    }
  }

  // At least one section is required
  if (!hasIncomeSection && !hasExpenseSection) {
    errors.push('CSV must contain at least one section (Income or Expense) with proper headers');
  }

  // Validate that sections have data
  if (hasIncomeSection) {
    let hasIncomeData = false;
    for (let i = incomeHeaderIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = parseCSVLine(line);
      if (cells[0] === 'Type' && cells.includes('Category')) {
        // Hit expense section
        break;
      }
      if (cells.length >= 4) {
        hasIncomeData = true;
        // Validate frequency values if present
        if (hasFrequency && cells.length >= 7) {
          const interval = parseInt(cells[5]);
          const type = cells[6].toLowerCase();
          if (isNaN(interval) || interval < 1) {
            errors.push(`Invalid frequency interval "${cells[5]}" on line ${i + 1} (must be a positive number)`);
          }
          if (!['day', 'week', 'month', 'year'].includes(type)) {
            errors.push(`Invalid frequency type "${cells[6]}" on line ${i + 1} (must be: day, week, month, or year)`);
          }
        }
        break;
      }
    }
    if (!hasIncomeData && hasIncomeSection) {
      // It's OK to have headers but no data - this is not an error
    }
  }

  if (hasExpenseSection) {
    let hasExpenseData = false;
    for (let i = expenseHeaderIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const cells = parseCSVLine(line);
      if (cells.length >= 4) {
        hasExpenseData = true;
        // Validate frequency values if present
        if (hasFrequency && cells.length >= 7) {
          const interval = parseInt(cells[5]);
          const type = cells[6].toLowerCase();
          if (isNaN(interval) || interval < 1) {
            errors.push(`Invalid frequency interval "${cells[5]}" on line ${i + 1} (must be a positive number)`);
          }
          if (!['day', 'week', 'month', 'year'].includes(type)) {
            errors.push(`Invalid frequency type "${cells[6]}" on line ${i + 1} (must be: day, week, month, or year)`);
          }
        }
        break;
      }
    }
    if (!hasExpenseData && hasExpenseSection) {
      // It's OK to have headers but no data - this is not an error
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    hasFrequency,
  };
}
