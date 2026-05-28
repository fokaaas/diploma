interface SparklineProps {
  values: number[]
  color?: string
  height?: number
}

export function Sparkline({ values, color = 'var(--olive-600)', height = 36 }: SparklineProps) {
  const width = 120
  const max = Math.max(...values)
  const min = Math.min(...values)
  const norm = (v: number) =>
    max === min ? height / 2 : height - ((v - min) / (max - min)) * (height - 4) - 2
  const step = width / (values.length - 1)
  const line = values.map((v, i) => `${i ? 'L' : 'M'}${i * step},${norm(v)}`).join(' ')
  const area = `${line} L${width},${height} L0,${height} Z`
  return (
    <svg className="spark" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ height }}>
      <path d={area} fill={color} opacity={0.12} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.5} />
    </svg>
  )
}
