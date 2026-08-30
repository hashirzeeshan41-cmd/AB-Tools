# Storage + UI integration notes

This branch adds client-side upload functionality and a dashboard widget to list files and jobs. Endpoints added:

- GET /api/files/list — list recent files
- GET /api/jobs/list — list recent processing jobs
- GET /api/files/download?id=<fileId> OR ?key=<storageKey> — download file
- POST /api/tools/split { fileIds: [...] } — enqueue split job
- POST /api/tools/compress { fileId } — enqueue compress job

Files to test in UI:
- Use the home page and the FileUploader component to upload files.
- Open /dashboard to view Uploaded files and Jobs (DashboardFiles component will poll every 5s).

Next steps after this branch:
- Wire FileUploader into the main home hero area; add drag reorder UI for merge; add progress/status UI for jobs; add authentication checks for upload endpoints.
