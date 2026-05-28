import { forwardRef } from 'react'
import type { AnchorHTMLAttributes } from 'react'
import { createLink, type LinkComponent } from '@tanstack/react-router'

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

const StyledAnchor = forwardRef<HTMLAnchorElement, AnchorProps>(({ className, ...props }, ref) => (
  <a ref={ref} className={`entity-link ${className ?? ''}`.trim()} {...props} />
))
StyledAnchor.displayName = 'StyledAnchor'

const CreatedEntityLink = createLink(StyledAnchor)

/** Type-safe mono "chip" link to another entity (e.g. request → procurement). */
export const EntityLink: LinkComponent<typeof StyledAnchor> = (props) => (
  <CreatedEntityLink preload="intent" {...props} />
)
