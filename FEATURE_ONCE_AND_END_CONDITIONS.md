# Feature: "Once" Items and End Conditions for Budget Items

## Overview
This feature enhancement allows users to create budget items that occur just once (non-recurring) and to set end conditions for recurring items, similar to how Google Calendar handles recurring events.

## User-Facing Features

### 1. Once vs Recurring Toggle
- Users can now choose between "Once" and "Recurring" when creating or editing budget items
- **Once**: The item occurs one time only (no cadence required)
- **Recurring**: The item repeats on a schedule (cadence required)

### 2. End Conditions for Recurring Items
When a budget item is set to "Recurring", users can optionally specify when it should end:

#### End After # Occurrences
- Specify how many times the item should occur before ending
- Example: "Gym membership - ends after 12 monthly payments"

#### End After Period
- Specify a time period after which the item should end
- Configurable with value + cadence type (days, weeks, months, years)
- Example: "Temporary contract income - ends after 6 months"

#### End When Total Reaches Amount
- Specify a cumulative total threshold
- Example: "Loan payment - ends when total reaches $5,000"

### 3. Default Behavior
- By default, recurring items have **no end condition** and continue indefinitely
- This maintains the existing behavior for backwards compatibility

## Technical Implementation

### Type Definitions
```typescript
// budget.types.ts

export interface BudgetItemEnd {
  type: 'period' | 'amount' | 'occurrences';
  period?: {
    value: number;
    cadence: BudgetItemCadenceType;
  };
  amount?: number;
  occurrences?: number;
}

export interface Income {
  // ... existing fields
  cadence?: BudgetItemCadence; // Now optional
  end?: BudgetItemEnd; // New optional field
}

export interface Expense {
  // ... existing fields
  cadence?: BudgetItemCadence; // Now optional
  end?: BudgetItemEnd; // New optional field
}
```

### Calculation Logic
```typescript
// budget.actions.ts

export function getBudgetItemWindowAmount(
  amount: number,
  itemCadence: BudgetItemCadence | undefined,
  window: BudgetItemCadence,
  conversionMethod: 'exact' | 'day-based' = 'exact',
): number {
  // If no cadence, this is a "once" item - return amount as-is
  if (!itemCadence) {
    return amount;
  }
  
  // Otherwise, perform period conversion as before
  // ...
}
```

### UI Components

#### Frequency Toggle
The form now includes a toggle between "Once" and "Recurring":
```tsx
<div>
  <label>Frequency</label>
  <div className='flex gap-2'>
    <button onClick={handleToggleOnce}>Once</button>
    <button onClick={handleToggleOnce}>Recurring</button>
  </div>
</div>
```

#### End Condition Controls
When "Recurring" is selected, users can optionally add end conditions:
```tsx
{!isOnce && showEndCondition && (
  <div>
    <label>Ends</label>
    {/* Toggle between end types */}
    <button onClick={() => setEndType('occurrences')}>After # times</button>
    <button onClick={() => setEndType('period')}>After period</button>
    <button onClick={() => setEndType('amount')}>After total amount</button>
    
    {/* Type-specific inputs */}
    {end?.type === 'occurrences' && (
      <input type="number" value={end.occurrences} />
    )}
    {/* ... other end type inputs */}
  </div>
)}
```

## Backwards Compatibility

### Existing Data
✅ **Fully backwards compatible** - no migration required:
- Existing items with `cadence` defined continue to work exactly as before
- Items without `end` field continue to recur indefinitely
- Items without `cadence` are treated as one-time amounts

### Data Flow
1. **Loading existing data**: Items without `cadence` or `end` fields are handled gracefully
2. **Saving new data**: New fields are only added when user explicitly sets them
3. **Calculations**: The `getBudgetItemWindowAmount` function safely handles both old and new data formats

## Future Enhancements

### Phase 2: End Condition Enforcement
Currently, the end conditions are stored but not actively enforced in calculations. Future work includes:

1. **Date-based tracking**: Track when items started to calculate when they should end
2. **Occurrence counting**: Keep track of how many times a recurring item has occurred
3. **Amount tracking**: Sum up total amounts to determine when cap is reached
4. **Visual indicators**: Show users when items are approaching their end conditions
5. **Automatic disabling**: Disable items that have reached their end conditions

### Example Implementation (Future)
```typescript
function shouldIncludeItem(
  item: Income | Expense,
  currentDate: Date,
  historicalData: ItemHistory
): boolean {
  if (!item.end) return true; // No end condition
  
  switch (item.end.type) {
    case 'occurrences':
      return historicalData.count < item.end.occurrences;
    case 'period':
      return isWithinPeriod(currentDate, item.createdAt, item.end.period);
    case 'amount':
      return historicalData.totalAmount < item.end.amount;
    default:
      return true;
  }
}
```

## Testing

### Manual Testing Scenarios

1. **Create a "Once" item**
   - Toggle to "Once"
   - Verify cadence inputs are hidden
   - Verify item saves without cadence
   - Verify item displays correct amount without period conversion

2. **Create recurring item with occurrences end**
   - Toggle to "Recurring"
   - Set cadence (e.g., monthly)
   - Add end condition
   - Select "After # times"
   - Set number (e.g., 12)
   - Verify item saves with end condition

3. **Create recurring item with period end**
   - Follow steps above but select "After period"
   - Set value and cadence type
   - Verify item saves correctly

4. **Create recurring item with amount end**
   - Follow steps above but select "After total amount"
   - Set threshold amount
   - Verify item saves correctly

5. **Test backwards compatibility**
   - Load app with existing data
   - Verify all existing items display correctly
   - Edit an existing item
   - Verify cadence is still present
   - Save without changes
   - Verify data integrity

## Code Quality

### Review Results
- ✅ Type safety improvements implemented
- ✅ CodeQL security scan: 0 alerts
- ✅ Build successful
- ✅ No new linting errors introduced

### Security Considerations
- All user inputs are validated (min values, type checking)
- No sensitive data stored in end conditions
- All data remains in browser localStorage (privacy maintained)

## Files Modified

1. `src/lib/budget.types.ts` - Type definitions
2. `src/lib/budget.actions.ts` - Calculation logic
3. `src/components/forms/BudgetItemForm.tsx` - UI component
4. `src/components/forms/IncomeForm.tsx` - Income form integration
5. `src/components/forms/ExpenseForm.tsx` - Expense form integration

## Migration Guide

No migration is required! This is a purely additive change:

1. Deploy the updated code
2. Users with existing data will see no changes to their items
3. Users can start creating "Once" items or adding end conditions to new items
4. Existing items can be edited to add these new features

## Summary

This feature provides users with much more flexibility in how they model their finances:
- **One-time events**: Gift received, one-time bonus, emergency expense
- **Limited-term recurring**: Contract work with known end date, temporary subscriptions
- **Goal-based**: Save until reaching a target, pay off a fixed amount

All while maintaining 100% backwards compatibility with existing user data.
