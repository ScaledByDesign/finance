import AccountCardSkeleton from "./account-card-skeleton"

const AccountCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-2 gap-4">
        <AccountCardSkeleton />
        <AccountCardSkeleton />
    </div>
  )
}

export default AccountCardsSkeleton