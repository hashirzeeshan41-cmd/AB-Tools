'use client'

import { useCallback, useState } from 'react'

export default function FileUploader() {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [uploaded, setUploaded] = useState<any[]>([])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    setFiles(prev => [...prev, ...dropped])
  }, [])

  const onSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return
    setFiles(prev => [...prev, ...Array.from(e.target.files)])
  }

  const upload = async () => {
    if (files.length === 0) return
    setUploading(true)
    setError(null)
    setProgress(0)
    const form = new FormData()
    files.forEach(f => form.append('files', f))

    try {
      // Use XMLHttpRequest to get upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', '/api/files/upload')
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100)
            setProgress(pct)
          }
        }
        xhr.onload = () => {
          setUploading(false)
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const res = JSON.parse(xhr.responseText)
              if (res.success) {
                setUploaded(res.data)
                setFiles([])
                resolve()
              } else {
                setError(res.error?.message || 'Upload failed')
                reject(new Error(res.error?.message || 'Upload failed'))
              }
            } catch (err) {
              setError('Invalid server response')
              reject(err)
            }
          } else {
            setError('Upload failed: ' + xhr.status)
            reject(new Error('Upload failed'))
          }
        }
        xhr.onerror = () => {
          setUploading(false)
          setError('Network error')
          reject(new Error('Network error'))
        }
        xhr.send(form)
      })
    } catch (err: any) {
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <div onDragOver={e => e.preventDefault()} onDrop={onDrop} className="border border-dashed p-6 rounded text-center">
        <p className="mb-2">Drag & Drop files here or click to browse</p>
        <input onChange={onSelect} type="file" multiple className="w-full" />
        <div className="mt-4">
          <button disabled={uploading || files.length===0} onClick={upload} className="bg-blue-600 text-white px-4 py-2 rounded">{uploading ? 'Uploading...' : 'Upload'}</button>
        </div>
        {uploading && (
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded h-3 overflow-hidden">
              <div style={{ width: `${progress}%` }} className="bg-blue-600 h-3" />
            </div>
            <div className="text-sm mt-1">{progress}%</div>
          </div>
        )}
        {error && <div className="text-red-600 mt-2">{error}</div>}
      </div>

      {uploaded.length > 0 && (
        <div className="mt-4 text-left">
          <h3 className="font-semibold">Uploaded</h3>
          {uploaded.map((u, i) => (
            <div key={i} className="py-1">{u.filename} — {Math.round(u.size / 1024)} KB — id: {u.id}</div>
          ))}
        </div>
      )}
    </div>
  )
}
