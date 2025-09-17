import { AssetsView } from '../components/assets-view'
import { getServerSession } from 'next-auth/next'
import { redirect } from 'next/navigation'

export default async function AssetsPage() {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return <AssetsView />
}
