import { Card, Text, Metric } from '@tremor/react'
import { OfficeBuildingIcon, CreditCardIcon } from '@heroicons/react/outline';

const AccountDetailSkeleton = () => {
  return (
    <Card
      className="mt-5 mx-auto"
      decoration="top"
      decorationColor="indigo"
    >
      <div className='mb-2'>
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded max-w-60 mb-2"></div>
      </div>
      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded max-w-48"></div>
      <div className='flex items-center my-4'>
          <CreditCardIcon className='w-8 me-2' />
          <p className="text-tremor-content dark:text-dark-tremor-content text-2xl">Recent Transactions</p>
      </div>
      <table className="w-full text-sm leading-5">
          <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                  <th className="py-2 px-4 text-left font-medium text-gray-600 dark:text-gray-300">Name</th>
                  <th className="py-2 px-4 text-left font-medium text-gray-600 dark:text-gray-300">Date</th>
                  <th className="py-2 px-4 text-left font-medium text-gray-600 dark:text-gray-300">Amount</th>
              </tr>
          </thead>
          <tbody>
              <tr>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
              </tr>
              <tr>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
              </tr>
              <tr>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
                  <td className='py-2 px-4'>
                      <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded"></div>
                  </td>
              </tr>
          </tbody>
      </table>
    </Card>
  )
}

export default AccountDetailSkeleton