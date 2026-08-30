import { getServerSession } from 'next-auth'
import { authOptions } from './route'

export async function getSession() {
  return await getServerSession(authOptions as any)
}
