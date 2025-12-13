import {
  FILE_EXTENSION,
  FILE_HEADER_FIRST_LINE,
  FILE_HEADER_SECOND_LINE,
  FILE_HEADER_THIRD_LINE,
  FILE_TYPE,
} from './file.constants';
import type { Expense, Income } from './budget.types';
import type { Space } from './space.types';

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

export function exportCSV(fileName: string, space: Space) {
  // Create CSV content for incomes
  const incomesCSV = [
    'Type,Label,Description,Amount,Source,Cadence Type,Cadence Interval,Notes,Disabled',
    ...space.incomes.map((income: Income) =>
      [
        'Income',
        escapeCSV(income.label),
        escapeCSV(income.description),
        income.amount,
        escapeCSV(income.source),
        income.cadence.type,
        income.cadence.interval,
        escapeCSV(income.notes),
        income.disabled ? 'true' : 'false',
      ].join(',')
    ),
  ];

  // Create CSV content for expenses
  const expensesCSV = [
    'Type,Label,Description,Amount,Category,Sub-Category,Cadence Type,Cadence Interval,Notes,Disabled',
    ...space.expenses.map((expense: Expense) =>
      [
        'Expense',
        escapeCSV(expense.label),
        escapeCSV(expense.description),
        expense.amount,
        escapeCSV(expense.category),
        escapeCSV(expense.subCategory),
        expense.cadence.type,
        expense.cadence.interval,
        escapeCSV(expense.notes),
        expense.disabled ? 'true' : 'false',
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

function escapeCSV(value: string): string {
  if (!value) return '';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

export async function importCSV(space: Space): Promise<Space> {
  const file = await pickFile('.csv');
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
          if (currentSection === 'income' && cells.length >= 9) {
            newIncomes.push({
              id: crypto.randomUUID(),
              label: cells[1],
              description: cells[2],
              amount: parseFloat(cells[3]) || 0,
              source: cells[4],
              type: cells[4], // Using source as type
              cadence: {
                type: cells[5] as 'month' | 'week' | 'day' | 'year',
                interval: parseInt(cells[6]) || 1,
              },
              notes: cells[7] || '',
              disabled: cells[8]?.toLowerCase() === 'true',
            });
          } else if (currentSection === 'expense' && cells.length >= 10) {
            newExpenses.push({
              id: crypto.randomUUID(),
              label: cells[1],
              description: cells[2],
              amount: parseFloat(cells[3]) || 0,
              category: cells[4],
              subCategory: cells[5],
              cadence: {
                type: cells[6] as 'month' | 'week' | 'day' | 'year',
                interval: parseInt(cells[7]) || 1,
              },
              notes: cells[8] || '',
              disabled: cells[9]?.toLowerCase() === 'true',
            });
          }
        }

        const updatedSpace: Space = {
          ...space,
          incomes: newIncomes,
          expenses: newExpenses,
        };

        resolve(updatedSpace);
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
