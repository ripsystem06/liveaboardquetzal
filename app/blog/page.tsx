import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Navigation } from '@/components/navigation'
import { Footer } from '@/components/footer'
import { BlogClient } from './blog-client'
import { prisma } from '@/lib/db'

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen">
      <Navigation />
      <BlogClient posts={posts} />
      <Footer />
    </main>
  )
}
