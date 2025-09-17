import { Card } from '@tremor/react';

const AccountCardSkeleton = () => {
  return (
    <Card
      className="mx-auto"
      decoration="top"
      decorationColor="indigo"
    >
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-300 dark:bg-gray-600 rounded max-w-52 mb-2"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded max-w-32"></div>
        <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded max-w-32"></div>
      </div>
      
    </Card>
  )
}

export default AccountCardSkeleton;