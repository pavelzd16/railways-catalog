import { plainText } from '../lib/plain-text.ts'
import { detailRoute, isKnownPath, productPath, type PageData } from './route-data.ts'

export type Metadata = { title: string; description: string; socialDescription: string; canonical: string; robots: string; image: string; jsonLd: Record<string, unknown>[] }
const pages: Record<string, [string, string]> = {
  '/': ['ИНВИА — железнодорожные материалы и ВСП', 'Рельсы, шпалы, крепёж и другие материалы верхнего строения пути. Каталог ИНВИА: характеристики товаров, подбор и запрос стоимости.'],
  '/catalog': ['Каталог железнодорожных материалов | ИНВИА', 'Материалы верхнего строения пути: железнодорожные и крановые рельсы, шпалы, крепёж, накладки и прокладки. Подбор по категории, ГОСТ и характеристикам.'],
  '/services': ['Услуги для железнодорожного пути | ИНВИА', 'Услуги ИНВИА: описание работ, порядок оформления заявки и связь со специалистами. Выберите услугу и отправьте запрос на расчёт.'],
  '/about': ['О компании ИНВИА — поставщик материалов ВСП', 'Информация об ООО «ИНВИА», поставщике железнодорожных материалов. Компания в Зеленодольске, материалы верхнего строения пути и работа с заказчиками.'],
  '/contacts': ['Контакты и реквизиты ООО «ИНВИА»', 'Телефоны, электронная почта, адрес и реквизиты ООО «ИНВИА» в Зеленодольске. Свяжитесь с отделом продаж или отправьте заявку на сайте.'],
  '/delivery': ['Доставка и самовывоз ЖД материалов | ИНВИА', 'Условия поставки железнодорожных материалов ИНВИА: варианты доставки, самовывоз и согласование отгрузки с менеджером.'],
  '/price': ['Прайс на железнодорожные материалы | ИНВИА', 'Стоимость рельсов, шпал, крепежа и других ЖД материалов. Посмотрите позиции прайса ИНВИА и запросите актуальное коммерческое предложение.'],
  '/calculator': ['Калькулятор рельсов и крепежа по ГОСТ | ИНВИА', 'Онлайн-калькулятор материалов ВСП: метры рельсов в тонны, штуки крепежа в килограммы, ведомость рельсов, шпал и скреплений на участок пути. Массы — по ГОСТ.'],
  '/privacy': ['Политика обработки персональных данных | ИНВИА', 'Политика ООО «ИНВИА» в отношении обработки персональных данных пользователей сайта и обработки заявок.'],
  '/cart': ['Корзина — заявка на материалы | ИНВИА', 'Выбранные материалы и количество для заявки в ИНВИА. Укажите контакты, чтобы согласовать стоимость и поставку.'],
}

const summary = (value: string) => { const text = plainText(value); return text.length <= 170 ? text : text.slice(0, 167).replace(/\s+\S*$/, '') + '…' }

export function getMetadata(urlValue: string, data: PageData): Metadata {
  const url = new URL(urlValue, data.siteUrl)
  const path = url.pathname.replace(/\/$/, '') || '/'
  let [title, description] = pages[path] ?? ['Страница не найдена | ИНВИА', 'Страница не найдена. Перейдите в каталог материалов или свяжитесь с ИНВИА.']
  let canonicalPath = path
  let noindex = data.status >= 400 || path === '/cart' || path.startsWith('/admin') || !isKnownPath(path)
  const jsonLd: Record<string, unknown>[] = []
  let image = `${data.siteUrl}/logo.png`
  let searchDescription = ''
  if (path.startsWith('/admin')) [title, description] = ['Управление сайтом | ИНВИА', 'Вход в панель управления ИНВИА.']
  if (path === '/catalog') {
    const category = data.categories?.find((item) => item.slug === url.searchParams.get('category'))
    const subcategory = category?.subcategories?.find((item) => item.slug === url.searchParams.get('subcategory'))
    const params = new URLSearchParams()
    if (category) {
      const label = subcategory?.name ?? category.name
      title = `${label} — каталог и характеристики | ИНВИА`
      description = subcategory ? `${label}: позиции каталога ИНВИА, ГОСТ и технические характеристики. Запросите стоимость и наличие выбранных материалов.` : category.description
      params.set('category', category.slug)
      if (subcategory) params.set('subcategory', subcategory.slug)
    }
    const page = Number(url.searchParams.get('page'))
    if (Number.isInteger(page) && page > 1) {
      params.set('page', String(page))
      title = title.replace(' | ИНВИА', ` — страница ${page} | ИНВИА`)
      description += ` Страница ${page}.`
    }
    canonicalPath += params.size ? `?${params}` : ''
    noindex ||= [...url.searchParams.keys()].some((key) => !['category', 'subcategory', 'page', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].includes(key))
    noindex ||= (!!url.searchParams.get('category') && !category) || (!!url.searchParams.get('subcategory') && !subcategory)
  }
  const route = detailRoute(path)
  if (route?.kind === 'product' && data.product?.slug === route.slug) {
    const product = data.product
    title = `${plainText(product.title)} — характеристики и заказ | ИНВИА`
    const productTitle = plainText(product.title)
    const productText = plainText(product.description)
    // Описание обычно начинается с названия товара — в сниппете не повторяем его дважды подряд.
    const repeatsTitle = productText.toLocaleLowerCase('ru').startsWith(productTitle.toLocaleLowerCase('ru'))
    const lead = [repeatsTitle ? '' : productTitle, plainText(product.gost)].filter(Boolean).join('. ')
    description = `${lead ? `${lead}. ` : ''}${productText || 'Характеристики и комплектация в каталоге ИНВИА.'} Запросите стоимость и условия поставки.`
    searchDescription = plainText(product.descriptionTags)
    canonicalPath = productPath(product)
    if (product.images[0]) image = new URL(product.images[0], data.siteUrl).href
    // Хлебные крошки уже размечены microdata в Breadcrumbs — здесь только сам товар.
    const condition = { new: 'https://schema.org/NewCondition', used: 'https://schema.org/UsedCondition' }[product.condition as string]
    const properties = [...(product.gost ? [{ '@type': 'PropertyValue', name: 'ГОСТ', value: plainText(product.gost) }] : []), ...(product.specs ?? []).filter((spec) => !product.gost || plainText(spec.label).toLocaleLowerCase('ru') !== 'гост').map((spec) => ({ '@type': 'PropertyValue', name: plainText(spec.label), value: plainText(spec.value), ...(plainText(spec.unit) ? { unitText: plainText(spec.unit) } : {}) }))].filter((item) => item.name && item.value)
    jsonLd.push({
      '@context': 'https://schema.org', '@type': 'Product', name: productTitle, sku: product.sku, url: data.siteUrl + canonicalPath,
      ...(productText ? { description: productText } : {}),
      ...(product.images.length ? { image: product.images.map((item) => new URL(item, data.siteUrl).href) } : {}),
      ...(product.category?.name ? { category: [product.category.name, product.subcategory?.name].filter(Boolean).map(plainText).join(' / ') } : {}),
      ...(condition ? { itemCondition: condition } : {}),
      ...(properties.length ? { additionalProperty: properties } : {}),
      // Цены на сайте пока не заполнены; предложение без цены поисковики считают ошибкой, поэтому только при цене.
      ...(product.price && product.price > 0 ? { offers: { '@type': 'Offer', price: product.price, priceCurrency: 'RUB', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/BackOrder', url: data.siteUrl + canonicalPath, ...(condition ? { itemCondition: condition } : {}), seller: { '@type': 'Organization', name: 'ООО «ИНВИА»' } } } : {}),
    })
  } else if (route?.kind === 'service' && data.service?.slug === route.slug) {
    const service = data.service
    title = `${plainText(service.title)} — услуга и расчёт стоимости | ИНВИА`
    description = `${plainText(service.title)}. ${plainText(service.description)} Отправьте заявку в ИНВИА для расчёта стоимости.`
    canonicalPath = `/services/${encodeURIComponent(service.slug)}`
    if (service.image) image = new URL(service.image, data.siteUrl).href
    jsonLd.push({ '@context': 'https://schema.org', '@type': 'Service', name: plainText(service.title), description: plainText(service.fullDescription || service.description), url: data.siteUrl + canonicalPath, provider: { '@type': 'Organization', name: 'ООО «ИНВИА»', url: data.siteUrl } })
  } else if (route) {
    title = data.status === 404 ? (route.kind === 'product' ? 'Товар не найден | ИНВИА' : 'Услуга не найдена | ИНВИА') : 'Загрузка страницы | ИНВИА'
    description = data.status >= 500 ? 'Не удалось загрузить данные. Повторите попытку позже.' : 'Каталог материалов и услуг ИНВИА.'
  }
  if (data.status >= 500) title = 'Страница временно недоступна | ИНВИА'
  if (path === '/') jsonLd.push({ '@context': 'https://schema.org', '@type': 'Organization', name: 'ООО «ИНВИА»', url: data.siteUrl, logo: `${data.siteUrl}/logo.png`, telephone: ['+7-843-227-00-05', '+7-960-039-01-01'], email: 'zakaz@traer.ru' })
  const socialDescription = summary(description)
  return { title, description: searchDescription || socialDescription, socialDescription, canonical: data.siteUrl + canonicalPath, robots: noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large', image, jsonLd }
}
