import { FiDownload, FiExternalLink, FiFileText } from 'react-icons/fi'
import type { NormDocumentFull } from '@/entities/normativ/model/types'
import { documentViewer, pagesLabel, sourceLabel } from '@/entities/normativ/lib/norm-document-view'
import { getImageUrl } from '@/shared/lib'
import { UploadImg } from '@/shared/ui/UploadImg'

// Кнопки — как «Скачать PDF» в карточке документа и Button сайта (оранжевая основная, светлая с рамкой).
const BUTTON =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-base font-semibold tracking-[0.01em] transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
export const DOWNLOAD_BUTTON = `${BUTTON} normativ-btn bg-accent text-accent-foreground hover:bg-[#E85E14]`
export const OPEN_BUTTON = `${BUTTON} normativ-btn border border-border bg-white text-foreground hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]`

/**
 * Блок «Документ»: первая страница PDF крупно — белым листом с тенью, до двух миниатюр следующих страниц,
 * подпись «N страниц · PDF · M МБ», «Скачать PDF» и «Открыть в новом окне». Файл — с нашего сайта (/uploads/…).
 * Без картинок страниц — лист-заглушка с номером документа; без файла блок не рисуется (в карточке «Документ по запросу»).
 */
export function NormDocumentViewer({ document }: { document: NormDocumentFull }) {
  const view = documentViewer(document)
  if (view.mode === 'request' || !view.file) return null
  const openLabel = `Открыть ${document.code} в новом окне`
  const source = sourceLabel(document.sourceName)

  return (
    <section aria-labelledby="normativ-doc-title" className="normativ-doc mb-10">
      <div className="grid gap-6 md:grid-cols-[minmax(0,400px)_minmax(0,1fr)] md:gap-8">
        {/* Лист первой страницы: клик открывает PDF в новой вкладке штатным просмотрщиком браузера */}
        <a href={view.file} target="_blank" rel="noopener" aria-label={openLabel} className="normativ-sheet group">
          {view.sheet ? (
            <UploadImg
              src={getImageUrl(view.sheet)}
              sizes="(min-width: 768px) 400px, calc(100vw - 74px)"
              alt={`Первая страница: ${document.code}`}
              decoding="async"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="normativ-sheet-blank">
              <FiFileText className="h-10 w-10 text-[hsl(var(--primary))]" aria-hidden="true" />
              <span className="mt-4 block text-[clamp(1.25rem,3vw,1.625rem)] font-bold leading-tight text-foreground">{document.code}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{document.name}</span>
              <span className="mt-auto block text-xs font-bold tracking-[0.08em] text-muted-foreground">PDF</span>
            </span>
          )}
          <span className="normativ-sheet-hint" aria-hidden="true">
            <FiExternalLink className="h-4 w-4" />
            Открыть в новом окне
          </span>
        </a>

        <div className="flex min-w-0 flex-col">
          <p id="normativ-doc-title" className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Текст документа
          </p>
          <p className="mt-2 break-words text-xl font-bold leading-snug text-foreground">{document.code}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{document.name}</p>
          <p className="mt-3 text-sm font-semibold text-foreground">{view.facts}</p>
          {source && <p className="mt-1 text-sm text-muted-foreground">Текст документа: {source}</p>}

          <div className="mt-5 grid gap-2.5 sm:max-w-[320px]">
            <a href={view.file} download={view.downloadName} className={DOWNLOAD_BUTTON}>
              <FiDownload className="h-4 w-4" aria-hidden="true" />
              Скачать PDF
            </a>
            <a href={view.file} target="_blank" rel="noopener" className={OPEN_BUTTON}>
              <FiExternalLink className="h-4 w-4" aria-hidden="true" />
              Открыть в новом окне
            </a>
          </div>

          {view.thumbs.length > 0 && (
            <div className="mt-6 md:mt-auto md:pt-6">
              <ul className="grid max-w-[300px] grid-cols-2 gap-3" aria-label="Следующие страницы">
                {view.thumbs.map((thumb) => (
                  <li key={thumb.src}>
                    <a
                      href={thumb.href}
                      target="_blank"
                      rel="noopener"
                      aria-label={`Страница ${thumb.page} — открыть в новом окне`}
                      className="normativ-sheet normativ-sheet--thumb"
                    >
                      <UploadImg
                        src={getImageUrl(thumb.src)}
                        sizes="(min-width: 768px) 140px, 40vw"
                        alt={`Страница ${thumb.page}: ${document.code}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-contain"
                      />
                    </a>
                    <span className="mt-1.5 block text-center text-xs text-muted-foreground">Стр. {thumb.page}</span>
                  </li>
                ))}
              </ul>
              {view.morePages > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  и ещё {pagesLabel(view.morePages)} — в файле
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
