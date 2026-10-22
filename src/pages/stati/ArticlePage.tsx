import { useParams } from 'react-router'
import { Layout } from '@/widgets/Layout'
import { useArticle } from '@/entities/article/model/useArticle'

// Заглушка: вёрстку статьи собирает Task 7.
export function ArticlePage() {
  const { slug } = useParams<{ slug: string }>()
  const { article } = useArticle(slug)
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {article && <h1 className="text-3xl font-bold">{article.h1}</h1>}
      </div>
    </Layout>
  )
}
