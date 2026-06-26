'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '@/contexts/language-context'
import { Table, TableHead, TableRow, TableCell, TableHeader, TableBody } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BlogFormModal } from '@/components/admin/blog-form-modal'
import { Loader2, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react'

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl: string
  status: string
  createdAt: string
  updatedAt: string
}

export function AdminBlog() {
  const { t } = useLanguage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/blog', { credentials: 'include' })
      if (!res.ok) throw new Error('Failed to load posts')
      const data = await res.json()
      setPosts(data.posts || [])
      setTotalCount(data.totalCount || 0)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.blog.confirmDelete'))) return
    setActionLoading(id)
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Delete failed')
      }
      await fetchPosts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActionLoading(null)
    }
  }

  const openEdit = (post: BlogPost) => {
    setEditingPost(post)
    setModalOpen(true)
  }

  const openAdd = () => {
    setEditingPost(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPost(null)
  }

  const publishedPosts = posts.filter((p) => p.status === 'published')
  const fifoCount = publishedPosts.length
  const fifoPercent = (fifoCount / 5) * 100

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{t('admin.blog.title')}</h2>
          {/* FIFO Indicator */}
          <div className="flex items-center gap-3 mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{t('admin.blog.fifoLabel')}</span>
              <span className="font-semibold text-foreground">{fifoCount}/5</span>
            </div>
            <Progress value={fifoPercent} className="w-24 h-2" />
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={fetchPosts}>
            <RefreshCw className="size-4" />
          </Button>
          <Button size="sm" onClick={openAdd}>
            <Plus className="size-4" />
            {t('admin.blog.add')}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-destructive">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {t('admin.blog.empty')}
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.blog.titleCol')}</TableHead>
                <TableHead>{t('admin.blog.status')}</TableHead>
                <TableHead>{t('admin.blog.createdAt')}</TableHead>
                <TableHead>{t('admin.common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="font-medium max-w-xs truncate">{post.title}</TableCell>
                  <TableCell>
                    <Badge variant={post.status === 'published' ? 'default' : 'outline'}>
                      {post.status === 'published' ? t('admin.blog.published') : t('admin.blog.draft')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => openEdit(post)}
                        title={t('admin.common.edit')}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(post.id)}
                        disabled={actionLoading === post.id}
                        title={t('admin.common.delete')}
                      >
                        {actionLoading === post.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 text-destructive" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {modalOpen && (
        <BlogFormModal
          post={editingPost}
          onClose={closeModal}
          onSuccess={fetchPosts}
        />
      )}
    </div>
  )
}
