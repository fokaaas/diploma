import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { Icon } from '../ui/Icon'

export interface Crumb {
  label: ReactNode
  onClick?: () => void
}

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  breadcrumb?: Crumb[]
}

export function PageHeader({ title, subtitle, actions, breadcrumb }: PageHeaderProps) {
  return (
    <div>
      {breadcrumb && (
        <div className="breadcrumb">
          {breadcrumb.map((crumb, i) => (
            <Fragment key={i}>
              {i > 0 && <Icon name="chevron-right" size={12} />}
              {crumb.onClick ? (
                <a
                  href="#"
                  onClick={(event) => {
                    event.preventDefault()
                    crumb.onClick?.()
                  }}
                >
                  {crumb.label}
                </a>
              ) : (
                <span>{crumb.label}</span>
              )}
            </Fragment>
          ))}
        </div>
      )}
      <div className="page__header">
        <div>
          <h1 className="page__title">{title}</h1>
          {subtitle && <div className="page__subtitle">{subtitle}</div>}
        </div>
        {actions && <div className="page__actions">{actions}</div>}
      </div>
    </div>
  )
}
