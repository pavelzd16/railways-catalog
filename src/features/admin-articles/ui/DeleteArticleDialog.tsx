import { useState } from 'react'
import { Dialog } from '@/shared/ui/Dialog'
import { Button } from '@/shared/ui/Button'
import type { ArticleListItem } from '@/entities/article/model/types'

interface DeleteArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: ArticleListItem
  onDelete: (id: string) => Promise<void>
}

export function DeleteArticleDialog({ open, onOpenChange, article, onDelete }: DeleteArticleDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      await onDelete(article.id)
      onOpenChange(false)
    } catch {
      setError('Не удалось удалить статью')
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleClose}
      title="Удалить статью?"
      description={`Вы уверены, что хотите удалить статью «${article.title}»? Это действие нельзя отменить.`}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={handleClose} disabled={isDeleting}>
          Отмена
        </Button>
        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
          {isDeleting ? 'Удаление...' : 'Удалить'}
        </Button>
      </div>
    </Dialog>
  )
}
