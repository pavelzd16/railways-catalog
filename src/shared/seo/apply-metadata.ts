import type { Metadata } from './metadata'
import { jsonForHtml } from '../lib/plain-text'

export function applyMetadata(meta: Metadata) {
  document.title = meta.title
  const tags: [string, string, string | null][] = [
    ['name', 'description', meta.description], ['name', 'robots', meta.robots],
    ['property', 'og:title', meta.title], ['property', 'og:description', meta.socialDescription], ['property', 'og:url', meta.canonical], ['property', 'og:image', meta.image],
    ['name', 'twitter:title', meta.title], ['name', 'twitter:description', meta.socialDescription], ['name', 'twitter:image', meta.image],
  ]
  for (const [attribute, name, content] of tags) {
    let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${name}"]`)
    if (content === null) { element?.remove(); continue }
    if (!element) { element = document.createElement('meta'); element.setAttribute(attribute, name); document.head.appendChild(element) }
    element.content = content
  }
  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (meta.canonical) {
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical) }
    canonical.href = meta.canonical
  } else canonical?.remove()
  document.getElementById('seo-json-ld')?.remove()
  if (meta.jsonLd.length) {
    const script = document.createElement('script'); script.id = 'seo-json-ld'; script.type = 'application/ld+json'; script.textContent = jsonForHtml(meta.jsonLd); document.head.appendChild(script)
  }
}
