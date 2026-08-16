import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BlogDetailClient } from './blog-detail-client'
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

interface BlogDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params
  
  const post = await prisma.blogPost.findFirst({
    where: { id, status: 'published' },
  })

  if (!post) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <Navigation />
      <BlogDetailClient post={post} />
      <Footer />
    </main>
  )
}
