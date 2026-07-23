import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

const mockCount = vi.fn()
const mockFindFirst = vi.fn()
const mockDelete = vi.fn()
const mockCreate = vi.fn()
const mockFindMany = vi.fn()

// Mock $transaction to call the callback with a tx object
const mockTransaction = vi.fn(async (callback) => {
  const tx = {
    blogPost: {
      count: mockCount,
      findFirst: mockFindFirst,
      delete: mockDelete,
      create: mockCreate,
    },
  }
  return callback(tx)
})

vi.mock('@/lib/db', () => ({
  prisma: {
    blogPost: {
      count: mockCount,
      findFirst: mockFindFirst,
      delete: mockDelete,
      create: mockCreate,
      findMany: mockFindMany,
    },
    $transaction: mockTransaction,
    auditLog: {
      create: vi.fn().mockReturnValue(Promise.resolve({})),
    },
  },
}))

vi.mock('@/lib/admin-auth', () => ({
  requireAdmin: vi.fn(() => Promise.resolve('admin@quetzal.com')),
}))

vi.mock('@/lib/auth', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/auth')>()
  return {
    ...actual,
  }
})

const { GET, POST } = await import('@/app/api/admin/blog/route')

describe('POST /api/admin/blog — FIFO Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates a new post when fewer than 5 published posts exist', async () => {
    mockCount.mockResolvedValue(3)
    mockCreate.mockResolvedValue({
      id: 'post_new',
      title: 'New Post',
      content: 'Content here',
      imageUrl: '',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Post',
        content: 'Content here',
        status: 'published',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    // Should NOT have called delete
    expect(mockDelete).not.toHaveBeenCalled()
    // Should have called create
    expect(mockCreate).toHaveBeenCalledWith({
      data: {
        title: 'New Post',
        content: 'Content here',
        imageUrl: '',
        status: 'published',
      },
    })
  })

  it('deletes oldest post when 5 published posts already exist', async () => {
    // Simulate 5 existing published posts
    mockCount.mockResolvedValue(5)
    mockFindFirst.mockResolvedValue({
      id: 'oldest_post',
      title: 'Oldest Post',
      content: 'Old content',
      status: 'published',
      createdAt: new Date('2025-01-01'),
    })
    mockDelete.mockResolvedValue({ id: 'oldest_post' })
    mockCreate.mockResolvedValue({
      id: 'post_new',
      title: 'New Post',
      content: 'New content',
      imageUrl: '',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Post',
        content: 'New content',
        status: 'published',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    // Should have called delete on the oldest post
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { status: 'published' },
      orderBy: { createdAt: 'asc' },
    })
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'oldest_post' } })
    // Should have called create
    expect(mockCreate).toHaveBeenCalled()
  })

  it('deletes oldest post when more than 5 published posts exist (edge case)', async () => {
    // Simulate 6 existing published posts (edge case)
    mockCount.mockResolvedValue(6)
    mockFindFirst.mockResolvedValue({
      id: 'oldest_post',
      title: 'Oldest Post',
      content: 'Old content',
      status: 'published',
      createdAt: new Date('2025-01-01'),
    })
    mockDelete.mockResolvedValue({ id: 'oldest_post' })
    mockCreate.mockResolvedValue({
      id: 'post_new',
      title: 'New Post',
      content: 'New content',
      imageUrl: '',
      status: 'published',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'New Post',
        content: 'New content',
        status: 'published',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(201)

    // Should have called delete
    expect(mockDelete).toHaveBeenCalled()
  })

  it('returns 400 when title is missing', async () => {
    const request = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify({
        content: 'Some content',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 when content is missing', async () => {
    const request = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Some title',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 400 for invalid status value', async () => {
    const request = new NextRequest('http://localhost/api/admin/blog', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Some title',
        content: 'Some content',
        status: 'invalid_status',
      }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})

describe('GET /api/admin/blog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns all posts with totalCount', async () => {
    const posts = [
      { id: 'post1', title: 'Post 1', content: 'Content 1', status: 'published', createdAt: new Date(), updatedAt: new Date() },
      { id: 'post2', title: 'Post 2', content: 'Content 2', status: 'draft', createdAt: new Date(), updatedAt: new Date() },
    ]
    mockFindMany.mockResolvedValue(posts)

    const request = new NextRequest('http://localhost/api/admin/blog')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body.posts).toHaveLength(2)
    expect(body.totalCount).toBe(2)
  })
})
