'use client'

import { type Account } from "./account-card"
import { Wallet, CreditCard, PiggyBank, TrendingUp, Building2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/utils/currency'

const AccountCards = ({ props: accounts }: { props: Account[] }) => {
  const router = useRouter();

  // Calculate total net worth
  const totalBalance = accounts?.reduce((sum, account) => {
    // For credit cards, subtract the balance (debt)
    if (account.type === 'credit') {
      return sum - account.balance;
    }
    return sum + account.balance;
  }, 0) || 0;

  // Helper function to get account icon based on type
  const getAccountIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'credit':
        return CreditCard;
      case 'investment':
        return TrendingUp;
      case 'depository':
        return type.includes('saving') ? PiggyBank : Wallet;
      default:
        return Building2;
    }
  };

  // Remove local formatCurrency function - using centralized one

  // Handle account click - navigate to transaction page with account filter
  const handleAccountClick = (account: Account) => {
    if (account.account_id) {
      // Navigate to transaction page with account filter
      router.push(`/dashboard/transaction?accounts=${account.account_id}`);
    } else {
      // Fallback: navigate to transaction page without filter
      router.push('/dashboard/transaction');
    }
  };

  return (
    <div className="space-y-3">
      {/* Net Worth Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
        <div className="text-center">
          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Total Net Worth</p>
          <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Compact Account Table */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-gray-100">Account</th>
                <th className="text-right py-2 px-3 font-medium text-gray-900 dark:text-gray-100">Balance</th>
                <th className="text-right py-2 px-3 font-medium text-gray-900 dark:text-gray-100">Available</th>
                <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-gray-100 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {accounts && accounts.map((account: Account, idx: number) => {
                const Icon = getAccountIcon(account.type);
                const isCredit = account.type.toLowerCase() === 'credit';

                return (
                  <tr
                    key={`acc_${idx}`}
                    onClick={() => handleAccountClick(account)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors active:bg-gray-100 dark:active:bg-gray-700/50"
                  >
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-4 w-4 ${
                          isCredit ? 'text-red-500' :
                          account.type === 'investment' ? 'text-green-500' :
                          account.type.includes('saving') ? 'text-blue-500' : 'text-gray-500'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-gray-100 truncate text-xs">
                            {account.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {account.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className={`font-medium text-xs ${
                        isCredit ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'
                      }`}>
                        {formatCurrency(account.balance)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <span className="font-medium text-xs text-gray-700 dark:text-gray-300">
                        {formatCurrency(account.available)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <ExternalLink className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AccountCards