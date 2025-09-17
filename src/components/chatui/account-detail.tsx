import Link from 'next/link';
import { Card, Text, Metric, Flex } from '@tremor/react'
import { OfficeBuildingIcon, CreditCardIcon } from '@heroicons/react/outline';
import { ArrowNarrowRightIcon } from '@heroicons/react/outline';
import { formatCurrency } from '@/utils/currency';

interface Transaction {
  name: string;
  value: number;
  date: string;
}

interface Account {
  id: string;
  bank: string;
  name: string;
  type: string;
  balance: number;
  transactions: Transaction[]
}

const AccountDetail = ({ props: account } : { props: Account }) => {
  return (
    <Card
      className="mx-auto"
      decoration="top"
      decorationColor="indigo"
    >
      <div className='flex items-center'>
        <OfficeBuildingIcon className='w-12 me-2' />
        <div>
          <p className="text-2xl text-tremor-content-strong dark:text-dark-tremor-content-strong font-semibold">{account.bank}</p>
          <p className="text-tremor-content dark:text-dark-tremor-content mb-2">{account.name} - {account.type}</p>
        </div>
      </div>
      <div className='flex items-center ps-2'>
        <Text className="mt-2">
          Current Balance
          <Metric>{formatCurrency(account.balance)}</Metric>
        </Text>
      </div>
      <div className='flex items-center my-4'>
        <CreditCardIcon className='w-8 me-2' />
        <p className="text-tremor-content dark:text-dark-tremor-content text-2xl">Recent Transactions</p>
      </div>
      <table className="w-full text-sm leading-5">
        <thead className="bg-gray-100 dark:bg-gray-800">
          <tr>
            <th className="py-2 px-4 text-left font-medium text-gray-900 dark:text-gray-100">Name</th>
            <th className="py-2 px-4 text-left font-medium text-gray-900 dark:text-gray-100">Date</th>
            <th className="py-2 px-4 text-left font-medium text-gray-900 dark:text-gray-100">Amount</th>
          </tr>
        </thead>
        <tbody>
        {account.transactions && account.transactions.map((tx: Transaction, idx: number) => (<tr key={`tx_${idx}`}>
          <td className="py-2 px-4 text-left font-medium text-gray-900 dark:text-gray-100">{tx.name}</td>
          <td className="py-2 px-4 text-left text-gray-700 dark:text-gray-300">{new Date(tx.date).toLocaleDateString()}</td>
          <td className="py-2 px-4 text-right text-gray-900 dark:text-gray-100">{formatCurrency(tx.value)}</td>
        </tr>))}
        </tbody>
      </table>
      <Flex className="pt-4">
        <Link href={"/dashboard/transaction?account=" + account.id}>
          <div className='flex items-center'>
            <p className='text-sm'>View in Explorer</p>
            <ArrowNarrowRightIcon className='w-4 ml-2' />
          </div>
        </Link>
      </Flex>
    </Card>
  )
}

export default AccountDetail