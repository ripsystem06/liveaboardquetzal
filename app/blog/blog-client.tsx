'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
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

interface BlogClientProps {
  posts: BlogPost[]
}

export function BlogClient({ posts }: BlogClientProps) {
  const { t } = useLanguage()

  return (
    <>
      {/* Header */}
      <section className="pt-32 pb-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl md:text-5xl font-normal text-foreground mb-4">{t('blog.title')}</h1>
          <p className="font-sans text-lg text-muted-foreground max-w-2xl mx-auto">{t('blog.subtitle')}</p>
        </div>
      </section>

      {/* Blog Posts */}
      {posts.length === 0 ? (
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4 lg:px-8 text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-normal text-foreground mb-4">{t('blog.empty')}</h2>
            <p className="font-sans text-lg text-muted-foreground max-w-xl mx-auto mb-8">{t('blog.emptyDesc')}</p>
            <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90 font-sans font-semibold">
              <Link href="/">
                {t('shared.backHome')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post) => {
                const excerpt = post.content.length > 200 
                  ? post.content.slice(0, 200) + '...' 
                  : post.content
                return (
                  <article key={post.id} className="bg-card rounded-lg overflow-hidden shadow-sm border border-border">
                    {post.imageUrl && (
                      <div className="aspect-video relative overflow-hidden">
                        <img 
                          src={post.imageUrl} 
                          alt={post.title}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="font-serif text-2xl font-normal text-foreground mb-2">{post.title}</h2>
                      <p className="text-sm text-muted-foreground mb-4">
                        {new Date(post.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="font-sans text-muted-foreground mb-4 line-clamp-3">{excerpt}</p>
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/blog/${post.id}`}>
                          {t('blog.readMore')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
