type AvatarSize = 'sm' | 'md' | 'lg'

interface AvatarProps {
  initials: string
  size?: AvatarSize
  color?: string
}

export function Avatar({ initials, size = 'sm', color }: AvatarProps) {
  const cls = size === 'lg' ? 'avatar avatar--lg' : size === 'md' ? 'avatar avatar--md' : 'avatar'
  return (
    <span className={cls} style={color ? { background: color } : undefined}>
      {initials}
    </span>
  )
}
