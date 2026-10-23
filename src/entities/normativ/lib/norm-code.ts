// Разбор и сравнение номеров документов. Логика та же, что в railways-catalog-api (src/normativ/norm-code.ts):
// обе стороны сверяются общими примерами test/fixtures/norm-codes.json — менять только вместе.
// Модуль грузится тестами Node напрямую: без `@/`-значений и без enum.

// Латинские буквы, похожие на русские, — в обозначениях их часто набирают не той раскладкой.
const LATIN_TO_CYRILLIC: Record<string, string> = { P: 'Р', C: 'С', T: 'Т', O: 'О', E: 'Е', A: 'А', K: 'К', M: 'М', H: 'Н', B: 'В', X: 'Х' }

/**
 * Номер для сравнения: верхний регистр, ё→е, один пробел, тире → «-», латиница-двойники → кириллица
 * (только если в строке есть кириллица), «ГОСТ Р» и «ГОСТ» с пробелом перед числом.
 */
export function normalizeCode(code: string): string {
  let text = code
    .toUpperCase()
    .replace(/Ё/g, 'Е')
    .replace(/[\s  ]+/g, ' ')
    .trim()
    .replace(/[‐-―−]/g, '-')
  if (/[А-Я]/.test(text)) text = text.replace(/[PCTOEAKMHBX]/g, (letter) => LATIN_TO_CYRILLIC[letter])
  return text.replace(/ГОСТ ?Р ?(?=\d)/g, 'ГОСТ Р ').replace(/ГОСТ ?(?=\d)/g, 'ГОСТ ')
}

// «(заменён на ГОСТ 5812-2014)»: начало с союзом, сам номер, закрывающая скобка
const REPLACED = /(\(\s*замен[её]н[а-яё]*\s+на\s+)([^)]*?)(\s*\))/i

/** Границы частей строки ГОСТ: резать по «;» и «,» вне скобок. */
function splitParts(gost: string): string[] {
  const parts: string[] = []
  let depth = 0
  let start = 0
  for (let index = 0; index < gost.length; index += 1) {
    const char = gost[index]
    if (char === '(') depth += 1
    else if (char === ')') depth = Math.max(0, depth - 1)
    else if ((char === ';' || char === ',') && depth === 0) {
      parts.push(gost.slice(start, index))
      start = index + 1
    }
  }
  parts.push(gost.slice(start))
  return parts
}

/** Номера из строки `gost` товара; «(заменён на …)» уходит в replacedBy. */
export function parseGostField(gost: string | null | undefined): { code: string; replacedBy: string | null }[] {
  const result: { code: string; replacedBy: string | null }[] = []
  for (const part of splitParts(gost ?? '')) {
    const replaced = part.match(REPLACED)
    const code = (replaced ? part.replace(REPLACED, '') : part).replace(/\s+/g, ' ').trim()
    if (code) result.push({ code, replacedBy: replaced ? replaced[2].trim() || null : null })
  }
  return result
}

export { splitParts as splitGostParts, REPLACED as GOST_REPLACED }
