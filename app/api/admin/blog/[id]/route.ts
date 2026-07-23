import { NextRequest } from 'next/server'
import { requireAdmin } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { AuthError, ForbiddenError } from '@/lib/auth'
import { UpdateBlogPostSchema } from '@/lib/validations'

interface RouteParams { params: Promise<{ id: string }> }

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    return Response.json(post)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('GET /api/admin/blog/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params
    const rawBody = await request.json()

    const parsed = UpdateBlogPostSchema.safeParse(rawBody)
    if (!parsed.success) {
      return Response.json(
        {
          error: 'Validation failed',
          ...(process.env.NODE_ENV !== 'production' ? { details: parsed.error.flatten() } : {}),
        },
        { status: 400 }
      )
    }
    const body = parsed.data

    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    const updated = await prisma.blogPost.update({
      where: { id },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.status !== undefined && { status: body.status }),
      },
    })

    return Response.json(updated)
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('PATCH /api/admin/blog/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin()
    const { id } = await params

    const post = await prisma.blogPost.findUnique({ where: { id } })
    if (!post) {
      return Response.json({ error: 'Post not found' }, { status: 404 })
    }

    await prisma.blogPost.delete({ where: { id } })

    return Response.json({ ok: true })
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return Response.json({ error: error.message }, { status: 403 })
    }
    if (error instanceof AuthError) {
      return Response.json({ error: error.message }, { status: 401 })
    }
    console.error('DELETE /api/admin/blog/[id] error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
