import { CLIENTS } from "../data/clients"

/**
 * Лента логотипов заказчиков. Пока в clients.ts нет записей, блок не показывается:
 * логотипы публикуем только с письменного согласия заказчика.
 */
export function ClientLogos() {
  if (CLIENTS.length === 0) return null
  return (
    <section className="border-t border-border bg-muted py-12 md:py-16" aria-labelledby="clients-title">
      <div className="container mx-auto px-6 xl:px-8">
        <h2 id="clients-title" className="section-title mb-8">
          Нам доверяют
        </h2>
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {CLIENTS.map((client) => (
            <li key={client.name} className="flex flex-col items-center rounded-lg border border-border bg-white p-4 text-center">
              <img src={client.logo} alt={client.name} loading="lazy" className="h-16 w-auto max-w-full object-contain" />
              <p className="mt-3 text-xs leading-snug text-muted-foreground">{client.supplied}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}