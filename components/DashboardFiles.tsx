'use client'

import { useEffect, useState } from 'react'

type FileRow = { id: string; filename: string; size: number }
type JobRow = { id: string; tool: string; status: string; resultKey?: string; createdAt: string }

export default function DashboardFiles() {
  const [files, setFiles] = useState<FileRow[]>([])
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [fRes, jRes] = await Promise.all([fetch('/api/files/list'), fetch('/api/jobs/list')])
      const fJson = await fRes.json()
      const jJson = await jRes.json()
      if (fJson.success) setFiles(fJson.data)
      if (jJson.success) setJobs(jJson.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const t = setInterval(fetchData, 5000)
    return () => clearInterval(t)
  }, [])

  const download = async (id: string) => {
    try {
      const res = await fetch(`/api/files/download?id=${id}`)
      if (!res.ok) {
        alert('Download failed')
        return
      }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // attempt to get filename from header
      const cd = res.headers.get('content-disposition') || ''
      const m = /filename="?([^";]+)"?/.exec(cd)
      a.download = m ? m[1] : 'file'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert('Download error')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Recent Files</h2>
        {loading ? <div>Loading...</div> : (
          <div className="mt-2">
            {files.length === 0 ? <div className="text-sm text-gray-500">No files yet.</div> : (
              <div className="space-y-2">
                {files.map(f => (
                  <div key={f.id} className="p-3 bg-white dark:bg-gray-800 rounded flex justify-between items-center">
                    <div>
                      <div className="font-medium">{f.filename}</div>
                      <div className="text-sm text-gray-500">{Math.round(f.size/1024)} KB</div>
                    </div>
                    <div>
                      <button onClick={() => download(f.id)} className="px-3 py-1 border rounded">Download</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold">Recent Jobs</h2>
        {loading ? <div>Loading...</div> : (
          <div className="mt-2 space-y-2">
            {jobs.length === 0 ? <div className="text-sm text-gray-500">No jobs yet.</div> : (
              jobs.map(j => (
                <div key={j.id} className="p-3 bg-white dark:bg-gray-800 rounded flex justify-between items-center">
                  <div>
                    <div className="font-medium">{j.tool} — {j.status}</div>
                    <div className="text-sm text-gray-500">{new Date(j.createdAt).toLocaleString()}</div>
                  </div>
                  <div>
                    {j.resultKey ? <a className="px-3 py-1 border rounded" href={`/api/files/download?key=${encodeURIComponent(j.resultKey)}`}>Download Result</a> : null}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
