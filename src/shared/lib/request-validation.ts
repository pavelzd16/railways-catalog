export interface RequestContact {
  name: string
  phone: string
  email: string
  policyAccepted: boolean
}

export function validateRequestContact(contact: RequestContact) {
  const errors: Partial<Record<keyof RequestContact, string>> = {}
  if (!contact.name.trim()) errors.name = 'Укажите имя или организацию'
  if (!/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/.test(contact.phone.trim())) errors.phone = 'Введите телефон полностью: +7 (XXX) XXX-XX-XX'
  if (contact.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email.trim())) errors.email = 'Проверьте адрес электронной почты'
  if (!contact.policyAccepted) errors.policyAccepted = 'Необходимо согласие с политикой конфиденциальности'
  return errors
}
