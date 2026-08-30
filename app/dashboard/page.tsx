import { getServerSession as getSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await getSession({ req: undefined, ...{ authOptions } } as any)

  if (!session) {
    return (
      <div>
        <h2 className="text-xl">Not signed in</h2>
        <Link href="/login" className="text-blue-600">Sign in</Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      <div className="bg-white dark:bg-gray-800 p-4 rounded">
        <p>Email: {session.user?.email}</p>
        <p>Name: {session.user?.name}</p>
      </div>
    </div>
  )
}
