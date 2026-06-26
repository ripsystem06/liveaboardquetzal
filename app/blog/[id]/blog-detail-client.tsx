'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/contexts/language-context'

interface BlogPost {
  id: string
  title: string
  content: string
  imageUrl: string | null
  status: string
  createdAt: Date
  updatedAt: Date
}

interface BlogDetailClientProps {
  post: BlogPost
}

export function BlogDetailClient({ post }: BlogDetailClientProps) {
  const { t } = useLanguage()

  // Split content into paragraphs
  const paragraphs = post.content.split('\n').filter(p => p.trim() !== '')

  return (
    <>
      {/* Back link */}
      <section className="pt-32 pb-4 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Button asChild variant="ghost" className="mb-4">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.back')}
            </Link>
          </Button>
        </div>
      </section>

      {/* Article Header */}
      <section className="py-8 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{post.title}</h1>
          <p className="text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </section>

      {/* Featured Image */}
      {post.imageUrl && (
        <section className="py-4 bg-background">
          <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
            <div className="aspect-video relative overflow-hidden rounded-lg">
              <img 
                src={post.imageUrl} 
                alt={post.title}
                className="object-cover w-full h-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* Article Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className="prose prose-lg max-w-none">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="font-sans text-foreground leading-relaxed mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* Back to Blog */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('blog.back')}
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
