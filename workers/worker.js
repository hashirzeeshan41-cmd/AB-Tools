const { Worker, Queue, QueueScheduler } = require('bullmq')
const IORedis = require('ioredis')
const { getStorageAdapter } = require('../lib/storage')
const { prisma } = require('../lib/prisma')
const { PDFDocument } = require('pdf-lib')

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379')
new QueueScheduler('pdf-jobs', { connection })

console.log('Worker starting...')

const worker = new Worker('pdf-jobs', async (job) => {
  console.log('Processing job', job.name, job.data)
  if (job.name === 'merge') {
    const { processingJobId, fileIds } = job.data
    await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'processing' } })
    try {
      // load files
      const files = await prisma.file.findMany({ where: { id: { in: fileIds } } })
      const adapter = getStorageAdapter()
      const mergedPdf = await PDFDocument.create()
      for (const f of files) {
        const buf = await adapter.download(f.storageKey)
        const src = await PDFDocument.load(buf)
        const srcPages = await mergedPdf.copyPages(src, src.getPageIndices())
        srcPages.forEach(p => mergedPdf.addPage(p))
      }
      const out = await mergedPdf.save()
      const filename = `merged-${Date.now()}.pdf`
      const { key, size } = await adapter.upload(Buffer.from(out), filename, 'application/pdf')
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'completed', resultKey: key, resultSize: size } })
      console.log('Job completed', processingJobId)
    } catch (err) {
      console.error('Job failed', err)
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'failed', error: String(err) } })
    }
  }
}, { connection })

worker.on('completed', (job) => console.log('Worker completed job', job.id))
worker.on('failed', (job, err) => console.error('Worker failed job', job?.id, err))
