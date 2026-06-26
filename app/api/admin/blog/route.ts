import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()

    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const totalCount = posts.length

    return Response.json({ posts, totalCount })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('GET /api/admin/blog error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()

    const body = await request.json()
    const { title, content, imageUrl, status } = body

    if (!title || !content) {
      return Response.json({ error: 'Missing required fields: title, content' }, { status: 400 })
    }

    // Validate status is either 'draft' or 'published'
    if (status !== undefined && status !== 'draft' && status !== 'published') {
      return Response.json({ error: "status must be either 'draft' or 'published'" }, { status: 400 })
    }

    // Enforce FIFO: if 5+ published posts, delete oldest before inserting
    // Use transaction to prevent race conditions
    const post = await prisma.$transaction(async (tx) => {
      const publishedCount = await tx.blogPost.count({
        where: { status: 'published' },
      })

      if (publishedCount >= 5) {
        const oldest = await tx.blogPost.findFirst({
          where: { status: 'published' },
          orderBy: { createdAt: 'asc' },
        })
        if (oldest) {
          await tx.blogPost.delete({ where: { id: oldest.id } })
        }
      }

      return tx.blogPost.create({
        data: {
          title,
          content,
          imageUrl: imageUrl || '',
          status: status || 'draft',
        },
      })
    })

    return Response.json(post, { status: 201 })
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    console.error('POST /api/admin/blog error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}