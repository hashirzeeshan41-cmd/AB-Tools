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
  } else if (job.name === 'split') {
    const { processingJobId, fileIds } = job.data
    await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'processing' } })
    try {
      const files = await prisma.file.findMany({ where: { id: { in: fileIds } } })
      const adapter = getStorageAdapter()
      const results = []
      for (const f of files) {
        const buf = await adapter.download(f.storageKey)
        const src = await PDFDocument.load(buf)
        const pageIndices = src.getPageIndices()
        for (const i of pageIndices) {
          const single = await PDFDocument.create()
          const [p] = await single.copyPages(src, [i])
          single.addPage(p)
          const out = await single.save()
          const filename = `split-${f.id}-${i}-${Date.now()}.pdf`
          const { key, size } = await adapter.upload(Buffer.from(out), filename, 'application/pdf')
          results.push({ key, size, filename })
        }
      }
      // store JSON array in resultKey as a simple approach
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'completed', resultKey: JSON.stringify(results) } })
      console.log('Split job completed', processingJobId)
    } catch (err) {
      console.error('Split job failed', err)
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'failed', error: String(err) } })
    }
  } else if (job.name === 'compress') {
    const { processingJobId, fileId } = job.data
    await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'processing' } })
    try {
      const f = await prisma.file.findUnique({ where: { id: fileId } })
      if (!f) throw new Error('File not found')
      const adapter = getStorageAdapter()
      const buf = await adapter.download(f.storageKey)
      // Basic compress: re-save PDF which may reduce size; for production use specialized libraries
      const src = await PDFDocument.load(buf)
      const dst = await PDFDocument.create()
      const srcPages = await dst.copyPages(src, src.getPageIndices())
      srcPages.forEach(p => dst.addPage(p))
      const out = await dst.save()
      const filename = `compressed-${f.id}-${Date.now()}.pdf`
      const { key, size } = await adapter.upload(Buffer.from(out), filename, 'application/pdf')
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'completed', resultKey: key, resultSize: size } })
      console.log('Compress job completed', processingJobId)
    } catch (err) {
      console.error('Compress job failed', err)
      await prisma.processingJob.update({ where: { id: processingJobId }, data: { status: 'failed', error: String(err) } })
    }
  }
}, { connection })

worker.on('completed', (job) => console.log('Worker completed job', job.id))
worker.on('failed', (job, err) => console.error('Worker failed job', job?.id, err))
