export interface Client {
  name: string
  /** Путь к логотипу в public/, например '/clients/nlmk.svg' */
  logo: string
  /** Что и куда поставляли: «Рельсы Р65, Липецк» */
  supplied: string
}

/** Добавляйте только клиентов, давших согласие на публикацию логотипа. */
export const CLIENTS: Client[] = []