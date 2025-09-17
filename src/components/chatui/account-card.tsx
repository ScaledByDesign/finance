import { Card } from '@tremor/react';
import { Wallet, CreditCard, PiggyBank, TrendingUp, Building2 } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

export interface Account {
    name: string;
    type: string;
    balance: number;
    available: number;
    account_id?: string; // Optional for backward compatibility
}

// Helper function to get account icon and colors based on type
const getAccountStyle = (type: string) => {
  switch (type.toLowerCase()) {
    case 'credit':
      return {
        icon: CreditCard,
        bgColor: 'bg-red-50 dark:bg-red-950/20',
        borderColor: 'border-red-200 dark:border-red-800',
        iconColor: 'text-red-600 dark:text-red-400',
        textColor: 'text-red-900 dark:text-red-100'
      };
    case 'investment':
      return {
        icon: TrendingUp,
        bgColor: 'bg-green-50 dark:bg-green-950/20',
        borderColor: 'border-green-200 dark:border-green-800',
        iconColor: 'text-green-600 dark:text-green-400',
        textColor: 'text-green-900 dark:text-green-100'
      };
    case 'depository':
      if (type.includes('saving')) {
        return {
          icon: PiggyBank,
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          iconColor: 'text-blue-600 dark:text-blue-400',
          textColor: 'text-blue-900 dark:text-blue-100'
        };
      }
      return {
        icon: Wallet,
        bgColor: 'bg-gray-50 dark:bg-gray-950/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        iconColor: 'text-gray-600 dark:text-gray-400',
        textColor: 'text-gray-900 dark:text-gray-100'
      };
    default:
      return {
        icon: Building2,
        bgColor: 'bg-gray-50 dark:bg-gray-950/20',
        borderColor: 'border-gray-200 dark:border-gray-800',
        iconColor: 'text-gray-600 dark:text-gray-400',
        textColor: 'text-gray-900 dark:text-gray-100'
      };
  }
};

const AccountCard = ({ props: account }: { props: Account }) => {
  const style = getAccountStyle(account.type);
  const Icon = style.icon;

  // Remove local formatCurrency function - using centralized one

  // Determine if this is a credit account (debt)
  const isCredit = account.type.toLowerCase() === 'credit';

  return (
    <div className={`rounded-lg border p-4 ${style.bgColor} ${style.borderColor} transition-all hover:shadow-md`}>
      {/* Header with icon and account name */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-full bg-white dark:bg-gray-800 ${style.borderColor} border`}>
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm ${style.textColor} truncate`}>
            {account.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {account.type}
          </p>
        </div>
      </div>

      {/* Balance Information */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {isCredit ? 'Balance Owed' : 'Current Balance'}
          </span>
          <span className={`font-bold text-sm ${style.textColor}`}>
            {formatCurrency(account.balance)}
          </span>
        </div>

        {account.available !== account.balance && (
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {isCredit ? 'Available Credit' : 'Available'}
            </span>
            <span className="font-medium text-sm text-gray-700 dark:text-gray-300">
              {formatCurrency(account.available)}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountCard;