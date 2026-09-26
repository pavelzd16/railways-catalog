// src/widgets/shipment-map/TranzitDostavka.tsx
// Плашка о транзитной доставке под сроками доставки: автомобиль проходит 1500 км в сутки.
// Только рассказ на странице — отдельной услуги в заявке нет.
import { FiTruck } from 'react-icons/fi'

// Неразрывный пробел в числе задан руками, чтобы сервер и браузер печатали одинаково.
const KM_V_SUTKI = `1${String.fromCharCode(0xa0)}500`

export function TranzitDostavka() {
  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-primary/40 bg-primary/5">
      <div className="grid gap-6 p-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-10 md:p-8">
        <div>
          <p className="tranzit-cifra">
            {KM_V_SUTKI}
            <span> км</span>
          </p>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            проходит автомобиль за сутки
          </p>
          <div className="tranzit-doroga" aria-hidden="true">
            <FiTruck className="tranzit-mashina" />
          </div>
        </div>

        <div>
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Транзитная доставка
          </h3>
          <p className="mt-2 text-base text-muted-foreground leading-relaxed">
            Когда груз нужен быстрее, везём его транзитом на автомобиле: машина проходит
            {` ${KM_V_SUTKI} км`} в сутки. Срок до вашего объекта посчитаем по заявке.
          </p>
        </div>
      </div>
    </div>
  )
}
