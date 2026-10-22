/** Бесплатный номер по России (с 22.10.2026). */
export const PHONE_FREE = '8 (800) 600-12-87'
export const PHONE_FREE_NOTE = 'По России звонок бесплатный'

/** Мобильный отдела продаж, на нём же WhatsApp и Telegram. */
export const PHONE_MOBILE = '+7 (965) 615-50-59'

/**
 * Городской номер (с 16.10.2026). Если сделать пустым, на сайте под него останется место того же
 * размера (шапка, меню, подвал, главная, «Контакты»), а значки трубки будут звонить на мобильный.
 */
export const PHONE_CITY = '+7 (843) 250-72-23'

/** Куда звонят значки трубки без номера рядом: городской, а если его нет — мобильный. */
export const PHONE_CALL = PHONE_CITY || PHONE_MOBILE

/** 8-800 набирается с восьмёркой, остальные — в международном виде +7. */
export const tel = (phone: string) => {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('8') ? `tel:${digits}` : `tel:+${digits}`
}
