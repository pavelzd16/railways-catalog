import { test } from 'node:test'
import assert from 'node:assert/strict'
import { buildProductFaq } from '../src/shared/lib/product-faq.ts'

const bare = { title: 'Башмак тормозной', gost: '', price: null, stock: 0, condition: 'new', categorySlug: 'bashmaki-tormoznye', specs: [] }
const questions = (items) => items.map((item) => item.question)

test('товар без ГОСТа и характеристик получает ровно четыре общих вопроса: цена, наличие, оплата, доставка', () => {
  const items = buildProductFaq(bare)
  assert.equal(items.length, 4)
  assert.match(items[0].question, /цен/i)
  assert.match(items[1].question, /наличи/i)
  assert.match(items[2].question, /оплат/i)
  assert.match(items[2].answer, /безналичн/i)
  assert.match(items[3].question, /доставл/i)
  assert.equal(items[3].link?.href, '/delivery')
  for (const item of items) assert.ok(item.question.trim() && item.answer.trim())
})

const rail = {
  title: 'Железнодорожные рельсы Р-65', gost: 'ГОСТ Р 51685-2013', price: null, stock: 0, condition: 'new',
  categorySlug: 'zheleznodorozhnye-relsy',
  specs: [
    { label: 'Мерная длина', value: '12,5', unit: 'м' },
    { label: 'Масса 1 м', value: '64,88', unit: 'кг' },
    { label: 'Метров в тонне', value: '15,4', unit: 'м' },
    { label: 'Масса рельса длиной 12,5 м', value: '811', unit: 'кг' },
  ],
}

test('рельс с «Метров в тонне» получает этот вопрос с данными карточки, без характеристики — не получает', () => {
  const item = buildProductFaq(rail).find((entry) => /метров/i.test(entry.question))
  assert.ok(item, 'нет вопроса про метры в тонне')
  assert.match(item.answer, /15,4 м/)
  assert.match(item.answer, /64,88 кг/)
  assert.match(item.answer, /12,5 м/)
  assert.match(item.answer, /811 кг/)
  const withoutSpec = { ...rail, specs: rail.specs.filter((spec) => spec.label !== 'Метров в тонне') }
  assert.ok(!questions(buildProductFaq(withoutSpec)).some((question) => /метров/i.test(question)))
})

test('ответ про метры в тонне — без оборота «в одной тонне», данные карточки в прежнем порядке', () => {
  const item = buildProductFaq(rail).find((entry) => /метров/i.test(entry.question))
  assert.doesNotMatch(`${item.question} ${item.answer}`, /в\s+одной\s+тонне/i)
  assert.match(item.answer, /15,4 м.*64,88 кг.*12,5 м.*811 кг\.$/)
})

test('ступени в ответе про цену — как в блоке ступеней: у рельсов 10/15/20/40 т, у штучного раздела ни слова', () => {
  const price = (product) => buildProductFaq(product)[0].answer
  assert.match(price(rail), /розница — от 10 т, мелкий опт — от 15 т, опт — от 20 т, вагонная цена — от 40 т/)
  assert.match(price({ ...bare, categorySlug: 'zhd-krepezh' }), /розница — от 1 т, мелкий опт — от 10 т, опт — от 18 т, вагонная цена — вагон/)
  assert.doesNotMatch(price(bare), /ступен|розниц|опт|вагон/i)
  assert.match(price({ ...rail, price: 52800 }), /ориентир/)
})

test('наличие — те же три случая и сроки, что на плашке «Наличие»', () => {
  const stock = (value) => buildProductFaq({ ...rail, stock: value })[1].answer
  assert.match(stock(150), /в наличии, отгрузка 1–3 дня/)
  assert.match(stock(100), /остаток.*100 шт/i)
  assert.match(stock(1), /остаток.*— 1 шт/i)
  assert.match(stock(0), /под заказ, срок 7–14 дней/)
  assert.match(stock(0), /«Железнодорожные рельсы Р-65»/)
})

test('вопрос «старогодный» — у б/у и в разделе старогодных, с «Состоянием» из карточки; у нового — нет', () => {
  const oldQuestion = (product) => buildProductFaq(product).find((item) => /старогодн/i.test(item.question))
  const used = oldQuestion({ ...rail, condition: 'used', specs: [...rail.specs, { label: 'Состояние', value: 'старогодный, пригоден к укладке;' }] })
  assert.ok(used, 'нет вопроса у б/у')
  assert.match(used.answer, /снят[а-я]* с пути/)
  assert.match(used.answer, /старогодный, пригоден к укладке\./)
  assert.ok(oldQuestion({ ...bare, categorySlug: 'starogodnye-materialy-vsp' }), 'нет вопроса в разделе старогодных')
  assert.equal(oldQuestion(rail), undefined)
})

const bolt = {
  title: 'Болт путевой М22х135', gost: 'ГОСТ 11530-2014', price: null, stock: 40, condition: 'new', categorySlug: 'zhd-krepezh',
  specs: [
    { label: 'Штук в тонне', value: '1323 шт.' },
    { label: 'Масса 1 шт.', value: '0,756;', unit: 'кг' },
    { label: 'Единица измерения', value: 'шт или кг,' },
  ],
}

test('штуки в тонне и масса штуки — из карточки, хвостовые «;», «,», «.» срезаны; без этих характеристик вопроса нет', () => {
  const item = buildProductFaq(bolt).find((entry) => /штук|весит/i.test(entry.question))
  assert.ok(item, 'нет вопроса про штуки в тонне')
  assert.match(item.answer, /1323 шт[^.]/)
  assert.match(item.answer, /0,756 кг/)
  assert.match(item.answer, /шт или кг\./)
  assert.doesNotMatch(item.answer, /[;,.]\s*[;,.]|\s[;,.]/)
  const onlyMass = buildProductFaq({ ...bare, specs: [{ label: 'Масса', value: '19', unit: 'кг' }] })
  assert.match(onlyMass.find((entry) => /весит/i.test(entry.question))?.answer ?? '', /19 кг/)
  assert.ok(!questions(buildProductFaq({ ...bolt, specs: [] })).some((question) => /штук|весит/i.test(question)))
})

test('вопрос и ответ про штуки в тонне — без оборота «в одной тонне», данные карточки в прежнем порядке', () => {
  const item = buildProductFaq(bolt).find((entry) => /штук/i.test(entry.question))
  assert.doesNotMatch(`${item.question} ${item.answer}`, /в\s+одной\s+тонне/i)
  assert.match(item.answer, /1323 шт.*0,756 кг.*шт или кг\.$/)
  const bare = buildProductFaq({ ...bolt, specs: [{ label: 'Штук в тонне', value: '278' }] }).find((entry) => /штук/i.test(entry.question))
  assert.match(bare.answer, /278 шт\.$/)
  assert.doesNotMatch(bare.answer, /в\s+одной\s+тонне/i)
})

test('ГОСТ, комплектность и аналог — только когда заполнены, со значениями карточки', () => {
  const nut = { ...bare, gost: 'ГОСТ 11532-2014', specs: [{ label: 'Комплектность', value: 'болт, гайка, две шайбы' }, { label: 'Аналог', value: 'DIN 934' }] }
  const items = buildProductFaq(nut)
  const find = (pattern) => items.find((item) => pattern.test(item.question))
  assert.match(find(/стандарт/i)?.answer ?? '', /ГОСТ 11532-2014/)
  assert.match(find(/стандарт/i)?.answer ?? '', /сертификат или паспорт качества завода-изготовителя/)
  assert.match(find(/комплект/i)?.answer ?? '', /болт, гайка, две шайбы/)
  assert.match(find(/аналог/i)?.answer ?? '', /DIN 934/)
  assert.equal(items.length, 7)
  const none = questions(buildProductFaq(bare))
  assert.ok(!none.some((question) => /стандарт|комплект|аналог/i.test(question)))
})

test('не больше 7 вопросов: лишние снимаются с конца, четыре общих остаются на местах', () => {
  const everything = {
    ...rail, condition: 'used',
    specs: [...rail.specs, ...bolt.specs, { label: 'Комплектность', value: 'рельс' }, { label: 'Аналог', value: 'DIN 536' }],
  }
  const items = buildProductFaq(everything)
  assert.equal(items.length, 7)
  const list = questions(items)
  assert.match(list[0], /цен/)
  assert.match(list[1], /наличии/)
  assert.match(list[2], /метров/)
  assert.match(list[3], /штук/)
  assert.match(list[4], /стандарт/)
  assert.match(list[5], /оплат/)
  assert.match(list[6], /доставля/)
  assert.ok(!list.some((question) => /комплект|аналог|старогодн/i.test(question)))
})

test('вопрос про цену не согласуется с названием: у названия во множественном числе нет «стоит «…»»', () => {
  const plural = { ...bare, title: 'Болты клеммные и закладные с гайками, старогодные', categorySlug: 'starogodnye-materialy-vsp' }
  const question = buildProductFaq(plural)[0].question
  assert.doesNotMatch(question, /стоит «/)
  assert.doesNotMatch(buildProductFaq(rail)[0].question, /стоит «/)
  assert.match(question, /цен/i)
})

test('остаток 1–100 — только факт «остаток N шт», без добавок', () => {
  assert.equal(buildProductFaq({ ...rail, stock: 40 })[1].answer, 'Остаток по позиции «Железнодорожные рельсы Р-65» — 40 шт.')
})

test('обещание сертификата или паспорта завода — только у новых; у б/у и в старогодных разделах ответ про стандарт без него', () => {
  const gostAnswer = (product) => buildProductFaq(product).find((item) => /стандарт/i.test(item.question))?.answer ?? ''
  assert.match(gostAnswer(rail), /паспорт качества завода-изготовителя/)
  for (const old of [{ ...rail, condition: 'used' }, { ...rail, subcategorySlug: 'starogodnye-relsy' }, { ...rail, categorySlug: 'starogodnye-materialy-vsp' }]) {
    const answer = gostAnswer(old)
    assert.match(answer, /ГОСТ Р 51685-2013/)
    assert.doesNotMatch(answer, /сертификат|паспорт|завод/i)
  }
})
