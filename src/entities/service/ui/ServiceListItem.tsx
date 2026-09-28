import { FiCheck, FiPhone } from 'react-icons/fi'
import { Link } from 'react-router'
import type { Service } from '../model/types'
import { getImageUrl } from '@/shared/lib'
import { UploadImg } from '@/shared/ui/UploadImg'

interface ServiceListItemProps {
  service: Service
}

export function ServiceListItem({ service }: ServiceListItemProps) {
  return (
    <Link to={`/services/${service.slug}`} className="block">
      <div className="bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] p-6 hover:border-[hsl(var(--primary))/0.5] transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
            {service.image ? (
              <UploadImg
                src={getImageUrl(service.image)}
                sizes="128px"
                alt={service.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h3 className="text-xl font-bold mb-2 hover:text-[hsl(var(--primary))] transition-colors">
              {service.title}
            </h3>
            <p className="text-[hsl(var(--muted-foreground))] mb-3">{service.description}</p>
            
            {service.features && service.features.length > 0 && (
              <ul className="space-y-1 text-sm text-[hsl(var(--muted-foreground))]">
                {service.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <FiCheck className="w-4 h-4 text-[hsl(var(--primary))] flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="flex-shrink-0">
            <div className="block w-full md:w-auto py-3 px-6 bg-accent-gradient rounded-lg font-bold text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-center">
              <FiPhone className="w-5 h-5" />
              Заказать
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}