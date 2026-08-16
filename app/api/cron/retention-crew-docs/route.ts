import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import { getSupabaseAdmin, CREW_DOCS_BUCKET } from '@/lib/supabase'

const RETENTION_YEARS = 5

/**
 * GET /api/cron/retention-crew-docs
 * Vercel Cron endpoint — enforces the 5-year document retention policy:
 * deletes crew-registration documents older than 5 years and their storage
 * objects in the private `crew-docs` bucket. Runs via vercel.json.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('CRON_SECRET not configured — refusing to run cron job')
    return Response.json({ error: 'CRON_SECRET not configured' }, { status: 500 })
  }
  if (authHeader !== `Bearer ${cronSecret}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - RETENTION_YEARS)

    const staleDocs = await prisma.crewRegistrationDocument.findMany({
      where: { uploadedAt: { lt: cutoff } },
      select: { id: true, storagePath: true },
    })

    if (staleDocs.length === 0) {
      return Response.json({ deleted: 0 })
    }

    const supabase = getSupabaseAdmin()
    const storagePaths = staleDocs.map((doc) => doc.storagePath)
    await supabase.storage.from(CREW_DOCS_BUCKET).remove(storagePaths)

    const { count } = await prisma.crewRegistrationDocument.deleteMany({
      where: { id: { in: staleDocs.map((doc) => doc.id) } },
    })

    return Response.json({ deleted: count })
  } catch (error) {
    console.error('GET /api/cron/retention-crew-docs error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
