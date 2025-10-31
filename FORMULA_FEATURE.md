# Calculated Amount Feature

## Overview
Budget items (incomes and expenses) now support calculated amounts using formulas. This feature allows you to create dynamic budget items that automatically compute their amounts based on other items, sources, or categories.

## Formula Syntax

### References
You can reference other budget data in your formulas:

- **Sources**: `@source:Name` - References all incomes from a specific source
  - Example: `@source:Work` sums all incomes from the "Work" source
  
- **Categories**: `@category:Name` - References all expenses from a specific category
  - Example: `@category:Housing` sums all expenses from the "Housing" category
  
- **Specific Items**: `@item:id` - References a specific income or expense by its ID
  - Example: `@item:budget_abc123` references the amount of a specific budget item

### Operators
Standard arithmetic operators are supported:
- Addition: `+`
- Subtraction: `-`
- Multiplication: `*`
- Division: `/`
- Parentheses: `()` for grouping

### Examples

1. **Simple arithmetic**: 
   ```
   1000 + 500
   ```
   Result: 1500

2. **Percentage of source**:
   ```
   @source:Work * 0.1
   ```
   Calculates 10% of all income from "Work" source

3. **Complex calculation**:
   ```
   (@source:Work + @source:Freelance) * 0.15
   ```
   Calculates 15% of combined income from Work and Freelance

4. **Subtract fixed amount from category**:
   ```
   @category:Housing - 200
   ```
   Subtracts 200 from total Housing expenses

## Using the Formula Helper

When adding or editing a budget item:

1. Click "Use calculated amount" to enable formula mode
2. Click "Show formula helper" to access quick references
3. Click on any source, category, or budget item to insert it into your formula
4. Use the operator buttons to add arithmetic operations
5. The formula is validated in real-time with error messages if invalid

## Visual Indicators

- Budget items with formulas show a 📊 "Calculated" indicator
- Items with formula errors show a ⚠️ "Formula error" indicator
- Hover over the indicator to see the formula or error message

## Deletion Warnings

When deleting:
- **Budget items**: You'll be warned if other items reference this item in their formulas
- **Sources/Categories**: Deletion warnings show which items will be affected

## Backwards Compatibility

- Existing budget items without formulas continue to work exactly as before
- The `formula` field is optional and defaults to empty/undefined
- Static amounts (without formulas) are stored in the `amount` field as always
- Old saved spaces/files load correctly without any migration needed

## Technical Details

### Amount Calculation Priority
1. If a formula exists and is valid, the calculated result is used
2. If a formula exists but has an error, the amount is set to 0 (with error shown)
3. If no formula exists, the static `amount` field is used

### Circular Dependency Detection
The system checks for circular dependencies when items reference each other. While the basic implementation is in place, complex circular references may cause calculation errors.

### Time Window Adjustment
Calculated amounts respect the time window settings just like static amounts. The formula is evaluated first, then the result is adjusted for the selected time period (day/week/month/year).

## Known Limitations

1. **Case Sensitivity**: Source and category names in formulas are case-insensitive, but exact matching is recommended
2. **Item IDs**: When referencing specific items, you need the exact item ID (available via the formula helper)
3. **Calculation Order**: Items are calculated independently; complex interdependencies may not evaluate in optimal order
4. **Error Recovery**: If a referenced item is deleted, formulas referencing it will show errors but won't crash the app

## Future Enhancements

Potential improvements for future versions:
- Auto-complete for source/category names while typing
- Formula templates for common calculations
- Visual formula builder with drag-and-drop
- Advanced functions (SUM, AVG, MIN, MAX)
- Conditional logic (IF statements)
- Historical data references (previous month, year-over-year)
