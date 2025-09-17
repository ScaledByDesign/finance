'use client'

import { type Account } from "./account-card"
import { Wallet, CreditCard, PiggyBank, TrendingUp, Building2, ExternalLink } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { formatCurrency } from '@/utils/currency'

const AccountCardsMobile = ({ props: accounts }: { props: Account[] }) => {
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

  // Handle account click - navigate to transaction page with account filter
  const handleAccountClick = (account: Account) => {
    if (account.account_id) {
      router.push(`/dashboard/transaction?accounts=${account.account_id}`);
    } else {
      router.push('/dashboard/transaction');
    }
  };

  // Responsive Table Layout with Light Theme Optimized
  return (
    <div className="space-y-4">
      {/* Net Worth Summary - Light Theme Optimized */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="text-center">
          <p className="text-sm text-blue-700 font-medium">Total Net Worth</p>
          <p className="text-2xl font-bold text-blue-900 mt-1">
            {formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Responsive Account Table - Light Theme Optimized */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-gray-900 text-sm md:text-base">Account</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm md:text-base hidden sm:table-cell">Type</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm md:text-base">Balance</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900 text-sm md:text-base hidden sm:table-cell">Available</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts && accounts.map((account: Account, idx: number) => {
                const Icon = getAccountIcon(account.type);
                const isCredit = account.type.toLowerCase() === 'credit';

                return (
                  <tr
                    key={`acc_${idx}`}
                    onClick={() => handleAccountClick(account)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors active:bg-gray-100"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 flex-shrink-0 ${
                          isCredit ? 'text-red-500' :
                          account.type === 'investment' ? 'text-green-600' :
                          account.type.includes('saving') ? 'text-blue-600' : 'text-gray-600'
                        }`} />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                            {account.name}
                          </p>
                          <p className="text-xs text-gray-500 sm:hidden capitalize">
                            {account.type}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className="text-gray-700 text-sm md:text-base capitalize">
                        {account.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div>
                        <span className={`font-semibold text-sm md:text-base ${
                          isCredit ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatCurrency(account.balance)}
                        </span>
                        <p className="text-xs text-gray-500 sm:hidden mt-1">
                          Available: {formatCurrency(account.available)}
                        </p>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right hidden sm:table-cell">
                      <span className="font-medium text-gray-700 text-sm md:text-base">
                        {formatCurrency(account.available)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats - Light Theme Optimized */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-sm text-green-700 font-medium">Total Assets</p>
          <p className="font-bold text-green-900 text-lg mt-1">
            {formatCurrency(accounts?.filter(a => a.type !== 'credit').reduce((sum, a) => sum + a.balance, 0) || 0)}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <p className="text-sm text-red-700 font-medium">Total Debt</p>
          <p className="font-bold text-red-900 text-lg mt-1">
            {formatCurrency(accounts?.filter(a => a.type === 'credit').reduce((sum, a) => sum + a.balance, 0) || 0)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AccountCardsMobile