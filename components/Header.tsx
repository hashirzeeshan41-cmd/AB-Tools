import Link from 'next/link'

export default function Header() {
  return (
    <header className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">AB-Tools</Link>
        <nav className="space-x-4 hidden md:block">
          <Link href="/tools">Tools</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/login" className="ml-4 px-3 py-1 border rounded">Login</Link>
          <Link href="/signup" className="ml-2 px-3 py-1 bg-blue-600 text-white rounded">Get Started</Link>
        </nav>
      </div>
    </header>
  )
}
