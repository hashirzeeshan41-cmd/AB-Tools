export default function Home() {
  return (
    <section className="py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl font-bold mb-4">Every PDF Tool You Need, In One Place</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Merge, split, compress, convert, edit and manage your PDF files quickly and securely.</p>
          <div className="flex gap-3">
            <a href="/tools" className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow">Explore PDF Tools</a>
            <a href="/tools/merge-pdf" className="inline-block border border-gray-300 px-4 py-2 rounded">Merge PDF</a>
          </div>
        </div>
        <div>
          <div className="border border-dashed rounded p-6 text-center bg-white dark:bg-gray-800">
            <p className="mb-4">Drag & drop files here to get started</p>
            <a className="inline-block bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded">Select PDF Files</a>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Popular Tools</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">Merge PDF</div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">Split PDF</div>
          <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">Compress PDF</div>
        </div>
      </section>
    </section>
  )
}
