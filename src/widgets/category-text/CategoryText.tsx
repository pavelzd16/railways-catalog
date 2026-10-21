import type {
  CategoryText,
  TextBlock,
  TextInline,
} from '@/shared/seo/category-texts'

// Текст раздела из документа по медиаплану. Рисуется на сервере вместе со страницей:
// поисковики должны видеть его в исходном HTML, поэтому ничего не прячем и не догружаем.

function Inline({ nodes }: { nodes: TextInline[] }) {
  return nodes.map((node, i) =>
    typeof node === 'string' ? (
      node
    ) : 'b' in node ? (
      <strong key={i}>{node.b}</strong>
    ) : (
      <a
        key={i}
        href={node.href}
        className="text-primary underline underline-offset-2 hover:no-underline"
      >
        {node.text}
      </a>
    ),
  )
}

function Block({ block }: { block: TextBlock }) {
  if ('h2' in block)
    return <h2 className="mt-10 mb-4 text-2xl font-bold first:mt-0">{block.h2}</h2>
  if ('h3' in block)
    return <h3 className="mt-6 mb-3 text-lg font-bold">{block.h3}</h3>
  if ('p' in block)
    return (
      <p className="my-3 leading-relaxed text-muted-foreground">
        <Inline nodes={block.p} />
      </p>
    )
  if ('ul' in block)
    return (
      <ul className="my-3 list-disc space-y-1.5 pl-6 leading-relaxed text-muted-foreground">
        {block.ul.map((item, i) => (
          <li key={i}>
            <Inline nodes={item} />
          </li>
        ))}
      </ul>
    )
  return (
    <div className="my-5 overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[560px] border-collapse text-left text-sm">
        <thead className="bg-muted">
          <tr>
            {block.table.head.map((cell, i) => (
              <th key={i} scope="col" className="px-3 py-2.5 font-bold">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.table.rows.map((row, i) => (
            <tr key={i} className="border-t border-border align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2.5 text-muted-foreground">
                  <Inline nodes={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Первый абзац раздела — под H1, над товарами. */
export function CategoryIntro({ text }: { text: CategoryText }) {
  return (
    <p className="mt-3 max-w-4xl leading-relaxed text-muted-foreground">
      <Inline nodes={text.intro} />
    </p>
  )
}

/** Остальной текст раздела — под товарами и фильтрами, перед подвалом. */
export function CategoryArticle({ text }: { text: CategoryText }) {
  return (
    <section
      className="mt-12 max-w-4xl border-t border-border pt-8"
      aria-label={`О разделе «${text.h1}»`}
    >
      {text.body.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </section>
  )
}
