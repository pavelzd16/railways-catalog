import { Link } from 'react-router'
import { FiDownload, FiExternalLink, FiFileText } from 'react-icons/fi'
import type { NormDocumentFull } from '@/entities/normativ/model/types'
import { formatFileSize, formatIntroducedAt, kindLabel, statusLabel } from '@/entities/normativ/lib/norm-labels'
import { documentViewer, sourceLabel } from '@/entities/normativ/lib/norm-document-view'
import { Button } from '@/shared/ui/Button'

// Кнопки — как Button сайта (оранжевая основная, светлая с рамкой); ссылками, чтобы работали «Скачать» и новая вкладка.
const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold tracking-[0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
const DOWNLOAD_BUTTON = `${BUTTON} normativ-btn bg-accent text-accent-foreground hover:bg-[#E85E14]`
const OPEN_BUTTON = `${BUTTON} normativ-btn border border-border bg-white text-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]`

/** Метка «Действует» / «Заменён на …»: замена — ссылка, если она есть в справочнике. */
export function NormStatus({ document }: { document: Pick<NormDocumentFull, 'status' | 'replacedBy'> & { replacedByDoc?: { slug: string; code: string } | null } }) {
  return (
    <span className={`normativ-chip normativ-chip--${document.status}`}>
      {statusLabel(document.status)}
      {document.status === 'replaced' && document.replacedBy && ` на ${document.replacedBy}`}
    </span>
  )
}

/**
 * Карточка документа: номер, название, статус, дата введения, область применения, источник текста, файл и запрос цены.
 * Ссылок на другие сайты нет: источник — простым текстом (sourceUrl остаётся в данных), файл — с нашего сайта.
 */
export function NormDocumentCard({
  document,
  onRequestFile,
  onRequestPrice,
}: {
  document: NormDocumentFull
  onRequestFile: () => void
  onRequestPrice: () => void
}) {
  const introduced = formatIntroducedAt(document.introducedAt)
  const view = documentViewer(document)
  const size = formatFileSize(document.fileSize)
  const source = sourceLabel(document.sourceName)
  return (
    <aside className="normativ-card p-5" aria-label="Карточка документа">
      <div className="flex flex-wrap items-center gap-2">
        <span className="normativ-chip normativ-chip--kind">{kindLabel(document.kind)}</span>
        <NormStatus document={document} />
      </div>
      <p className="mt-3 break-words text-xl font-bold leading-snug">{document.code}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{document.name}</p>

      <dl className="mt-4 grid gap-3 border-t border-border pt-4">
        {document.status === 'replaced' && document.replacedBy && (
          <div>
            <dt>Заменён на</dt>
            <dd>
              {document.replacedByDoc ? (
                <Link to={`/normativ/${encodeURIComponent(document.replacedByDoc.slug)}`}>{document.replacedByDoc.code}</Link>
              ) : (
                document.replacedBy
              )}
            </dd>
          </div>
        )}
        {introduced && (
          <div>
            <dt>Дата введения</dt>
            <dd>{introduced}</dd>
          </div>
        )}
        {document.scope && (
          <div>
            <dt>Область применения</dt>
            <dd>{document.scope}</dd>
          </div>
        )}
        {source && (
          <div>
            <dt>Текст документа</dt>
            <dd>{source}</dd>
          </div>
        )}
      </dl>

      <div className="mt-5 grid gap-2.5">
        {view.file ? (
          <>
            <a href={view.file} download={view.downloadName} className={DOWNLOAD_BUTTON}>
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              Скачать PDF{size && ` (${size})`}
            </a>
            <a href={view.file} target="_blank" rel="noopener" className={OPEN_BUTTON}>
              <FiExternalLink className="h-4 w-4" aria-hidden="true" />
              Открыть в новом окне
            </a>
          </>
        ) : (
          <Button onClick={onRequestFile}>
            <FiFileText className="mr-2 h-4 w-4" aria-hidden="true" />
            Документ по запросу
          </Button>
        )}
        <Button variant="outline" onClick={onRequestPrice}>
          Запросить цену
        </Button>
      </div>
    </aside>
  )
}
