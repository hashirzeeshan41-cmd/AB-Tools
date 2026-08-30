export default function Footer() {
  return (
    <footer className="border-t mt-12 py-8">
      <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        © {new Date().getFullYear()} AB-Tools. All rights reserved.
      </div>
    </footer>
  )
}
