# Currency Formatting Standards

## Overview

The Finance application now uses a centralized currency formatting system to ensure consistent money display across all components, including the AI chat system and Elysia integration.

## Centralized Currency Utility

### Location
`src/utils/currency.ts`

### Primary Functions

#### `formatCurrency(amount, options?)`
The main currency formatter that should be used throughout the application.

```typescript
import { formatCurrency } from '@/utils/currency'

// Basic usage
formatCurrency(1234.56) // "$1,234.56"

// With options
formatCurrency(1234.56, { 
  currency: 'EUR', 
  locale: 'de-DE' 
}) // "1.234,56 €"

// Compact notation for large amounts
formatCurrency(1234567, { compact: true }) // "$1.2M"
```

#### `formatCurrencyWithSign(amount, options?)`
Explicitly shows positive/negative signs for transaction displays.

```typescript
formatCurrencyWithSign(1234.56) // "+$1,234.56"
formatCurrencyWithSign(-1234.56) // "-$1,234.56"
```

#### `formatCurrencyCompact(amount, options?)`
Shorthand for compact notation.

```typescript
formatCurrencyCompact(1234567) // "$1.2M"
formatCurrencyCompact(1234) // "$1,234.00"
```

## Updated Components

### Frontend Components

#### AI Chat System
- **File**: `src/app/v2/components/ai-chat-button.tsx`
- **Changes**: All hardcoded money values now use `formatCurrency()`
- **Example**: `$24,563` → `formatCurrency(24563)` → `$24,563.00`

#### Account Cards
- **File**: `src/components/chatui/account-cards.tsx`
- **Changes**: Removed local `formatCurrency` function, uses centralized one
- **Impact**: Consistent formatting across all account displays

#### Account Details
- **File**: `src/components/chatui/account-detail.tsx`
- **Changes**: Balance and transaction amounts use centralized formatting
- **Impact**: Proper currency symbols and decimal places

#### Business Transactions
- **File**: `src/app/v2/components/business-transactions-screen.tsx`
- **Changes**: Replaced local formatting with centralized utility
- **Impact**: Consistent formatting in stats, transactions, and category summaries

#### Personal Transactions
- **File**: `src/app/v2/components/transactions-screen.tsx`
- **Changes**: Updated income/expense displays to use centralized formatting
- **Impact**: Proper currency formatting in transaction lists

### Backend Components

#### Elysia AI Integration
- **File**: `elysia/main.py`
- **Changes**: Added `format_currency()` function for consistent Python-side formatting
- **Impact**: All AI responses now show properly formatted currency

**Example Elysia Responses:**
```python
# Before
"Your monthly expenses are 4210.50"

# After  
f"Your monthly expenses are {format_currency(4210.50)}"  # "$4,210.50"
```

## Benefits

### 1. Consistency
- All money amounts display with proper currency symbols
- Consistent decimal places (2 digits)
- Proper thousand separators (commas)

### 2. Internationalization Ready
- Supports different currencies and locales
- Easy to switch between USD, EUR, etc.
- Locale-aware formatting (US vs European number formats)

### 3. Maintainability
- Single source of truth for currency formatting
- Easy to update formatting rules globally
- Reduced code duplication

### 4. User Experience
- Professional appearance with consistent formatting
- Clear distinction between positive/negative amounts
- Compact notation for large numbers when appropriate

## Migration Guide

### For New Components
Always import and use the centralized formatter:

```typescript
import { formatCurrency } from '@/utils/currency'

// Use this
const displayAmount = formatCurrency(amount)

// Instead of this
const displayAmount = `$${amount.toLocaleString()}`
```

### For Existing Components
1. Import the centralized utility
2. Replace local formatting functions
3. Update all currency displays to use `formatCurrency()`

### For Backend/API Responses
Use the Python `format_currency()` function in Elysia:

```python
# Use this
response = f"Your balance is {format_currency(balance)}"

# Instead of this
response = f"Your balance is ${balance}"
```

## Testing

### Frontend Testing
```typescript
import { formatCurrency } from '@/utils/currency'

// Test basic formatting
expect(formatCurrency(1234.56)).toBe('$1,234.56')

// Test edge cases
expect(formatCurrency(0)).toBe('$0.00')
expect(formatCurrency(null)).toBe('$0.00')
```

### Backend Testing
```python
# Test Python formatting
assert format_currency(1234.56) == "$1,234.56"
assert format_currency(0) == "$0.00"
```

## Future Enhancements

1. **Multi-currency Support**: Extend to support user-selected currencies
2. **Locale Detection**: Automatically detect user locale for formatting
3. **Cryptocurrency**: Add support for Bitcoin, Ethereum, etc.
4. **Accessibility**: Ensure screen readers properly announce currency amounts

## Legacy Support

The old formatting functions in `src/utils/util.js` are marked as deprecated but still functional for backward compatibility. New development should use the centralized currency utilities.
