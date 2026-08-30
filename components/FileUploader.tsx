'use client'

import { useCallback, useState } from 'react'

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }, [])

  return (
    <div onDragOver={e => e.preventDefault()} onDrop={onDrop} className="border border-dashed p-6 rounded text-center">
      <p className="mb-2">Drag & Drop files here or click to browse</p>
      <input type="file" multiple className="hidden" />
      {files.length > 0 && (
        <div className="mt-4 text-left">
          {files.map((f, i) => (
            <div key={i} className="py-1">{f.name} — {Math.round(f.size / 1024)} KB</div>
          ))}
        </div>
      )}
    </div>
  )
}
