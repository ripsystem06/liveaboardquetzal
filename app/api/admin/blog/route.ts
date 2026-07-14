import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError } from '@/lib/auth'
import { CreateBlogPostSchema } from '@/lib/validations'

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

    const rawBody = await request.json()

    const parsed = CreateBlogPostSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        { error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      )
    }
    const body = parsed.data

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
          title: body.title,
          content: body.content,
          imageUrl: body.imageUrl,
          status: body.status,
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