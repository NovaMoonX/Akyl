# UI Flow: Budget Item Form

## Form Structure

```
┌─────────────────────────────────────────────┐
│  Add/Edit Income/Expense                    │
├─────────────────────────────────────────────┤
│                                             │
│  Name: [_________________________]          │
│                                             │
│  Amount: [___] $ 💹                         │
│                                             │
│  Frequency:  [Once] [Recurring]  ← NEW!    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ IF RECURRING:                        │   │
│  │                                      │   │
│  │  Repeats: every [1] [month(s) ▼]    │   │
│  │                                      │   │
│  │  [Add end condition] ← Optional      │   │
│  │                                      │   │
│  │  ┌───────────────────────────────┐  │   │
│  │  │ IF END CONDITION:              │  │   │
│  │  │                                │  │   │
│  │  │  Ends: [After # times]         │  │   │
│  │  │        [After period]          │  │   │
│  │  │        [After total amount]    │  │   │
│  │  │                                │  │   │
│  │  │  ┌─────────────────────────┐  │  │   │
│  │  │  │ IF "After # times":      │  │  │   │
│  │  │  │   After [12] occurrence(s)│ │  │   │
│  │  │  └─────────────────────────┘  │  │   │
│  │  │                                │  │   │
│  │  │  ┌─────────────────────────┐  │  │   │
│  │  │  │ IF "After period":       │  │  │   │
│  │  │  │   After [6] [month(s) ▼] │  │  │   │
│  │  │  └─────────────────────────┘  │  │   │
│  │  │                                │  │   │
│  │  │  ┌─────────────────────────┐  │  │   │
│  │  │  │ IF "After total amount": │  │  │   │
│  │  │  │   Total reaches [1000] $ │  │  │   │
│  │  │  └─────────────────────────┘  │  │   │
│  │  │                                │  │   │
│  │  │  [Remove end condition]        │  │   │
│  │  └───────────────────────────────┘  │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Source/Category: [____________]            │
│                                             │
│  Sheets: [Sheet 1] [Sheet 2]                │
│                                             │
│  [Delete]      [Cancel] [Save]              │
└─────────────────────────────────────────────┘
```

## User Interaction Flow

### Scenario 1: Creating a "Once" Item
```
1. User opens form to add income/expense
2. Fills in Name: "Holiday Bonus"
3. Fills in Amount: 500
4. Frequency defaults to "Recurring" with cadence
5. User clicks "Once" button
   → Cadence inputs disappear
   → End condition section disappears
6. User fills in other fields and saves
7. Result: Item stored without cadence or end
```

### Scenario 2: Creating Recurring with End
```
1. User opens form to add expense
2. Fills in Name: "Gym Membership"
3. Fills in Amount: 50
4. Frequency: Keeps "Recurring"
5. Sets cadence: every 1 month(s)
6. Clicks "Add end condition"
   → End condition section appears
7. Selects "After # times"
8. Sets occurrences: 12
9. User fills in other fields and saves
10. Result: Item with cadence and end.occurrences = 12
```

### Scenario 3: Editing Existing Item
```
1. User edits existing recurring item (has cadence)
2. Form loads with "Recurring" selected
3. Cadence shows: every 1 month(s)
4. End condition section is hidden (no end set)
5. User can:
   a. Switch to "Once" → removes cadence
   b. Add end condition → shows end options
   c. Keep as-is → no changes
6. User saves
7. Result: Updated based on user's choices
```

## Visual States

### State 1: Once Selected
```
┌─────────────────────────────┐
│ Amount: [50] $              │
│                             │
│ Frequency: [Once*] [Recurring]
└─────────────────────────────┘
```
*Active button shown in accent color

### State 2: Recurring (No End)
```
┌─────────────────────────────────┐
│ Amount: [50] $                  │
│                                 │
│ Frequency: [Once] [Recurring*]  │
│                                 │
│ Repeats: every [1] [month(s) ▼] │
│                                 │
│ [Add end condition]             │
└─────────────────────────────────┘
```

### State 3: Recurring with End (Occurrences)
```
┌─────────────────────────────────────┐
│ Amount: [50] $                      │
│                                     │
│ Frequency: [Once] [Recurring*]      │
│                                     │
│ Repeats: every [1] [month(s) ▼]     │
│                                     │
│ Ends:                               │
│   [After # times*] [After period]   │
│   [After total amount]              │
│                                     │
│   After [12] occurrence(s)          │
│                                     │
│   [Remove end condition]            │
└─────────────────────────────────────┘
```

### State 4: Recurring with End (Period)
```
┌─────────────────────────────────────┐
│ Amount: [500] $                     │
│                                     │
│ Frequency: [Once] [Recurring*]      │
│                                     │
│ Repeats: every [2] [week(s) ▼]      │
│                                     │
│ Ends:                               │
│   [After # times] [After period*]   │
│   [After total amount]              │
│                                     │
│   After [6] [month(s) ▼]            │
│                                     │
│   [Remove end condition]            │
└─────────────────────────────────────┘
```

### State 5: Recurring with End (Amount)
```
┌─────────────────────────────────────┐
│ Amount: [200] $                     │
│                                     │
│ Frequency: [Once] [Recurring*]      │
│                                     │
│ Repeats: every [1] [month(s) ▼]     │
│                                     │
│ Ends:                               │
│   [After # times] [After period]    │
│   [After total amount*]             │
│                                     │
│   Total reaches [5000] $            │
│                                     │
│   [Remove end condition]            │
└─────────────────────────────────────┘
```

## Validation Rules

### Once Items
- ✅ Name required
- ✅ Amount > 0 required
- ✅ Source/Category required
- ✅ At least one sheet required
- ❌ Cadence NOT required (will be undefined)
- ❌ End NOT allowed (will be undefined)

### Recurring Items
- ✅ Name required
- ✅ Amount > 0 required
- ✅ Source/Category required
- ✅ At least one sheet required
- ✅ Cadence interval > 0 required
- ✅ Cadence type required
- ⚠️ End optional

### End Conditions (when present)
- If type = 'occurrences': occurrences > 0 required
- If type = 'period': period.value > 0 and period.cadence required
- If type = 'amount': amount > 0 required

## Color Coding

- **Income items**: Green/Emerald accents
  - Active buttons: `bg-emerald-500`
  - Input focus: `focus:border-emerald-500`

- **Expense items**: Red accents
  - Active buttons: `bg-red-500`
  - Input focus: `focus:border-red-500`

- **Inactive buttons**: Gray
  - Default: `border-gray-300 bg-white`
  - Hover: `hover:border-gray-400`

## Accessibility

- All inputs have proper labels
- Buttons have clear text labels
- Number inputs have min/max constraints
- Proper focus states for keyboard navigation
- Form can be submitted with Enter key
