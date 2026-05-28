import type { ReactNode } from 'react'
import { Icon } from './Icon'

interface ModalProps {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  size?: 'md' | 'lg'
}

export function Modal({ title, onClose, children, footer, size = 'md' }: ModalProps) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${size === 'lg' ? 'modal--lg' : ''}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal__header">
          <h3 className="modal__title">{title}</h3>
          <button className="modal__close" onClick={onClose} aria-label="Закрити">
            <Icon name="x" size={18} />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>
  )
}
