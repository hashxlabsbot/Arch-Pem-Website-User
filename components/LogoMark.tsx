interface Props {
  /** Rendered height of the logo in px (width scales to keep aspect ratio). */
  size?: number
  style?: React.CSSProperties
  /** On dark surfaces, place the logo on a light chip so the navy wordmark stays legible. */
  onDark?: boolean
}

export default function LogoMark({ size = 36, style, onDark }: Props) {
  const img = (
    <img
      src="/logo.png"
      alt="ARC PEM"
      style={{ display: 'block', height: size, width: 'auto', flexShrink: 0 }}
    />
  )

  if (onDark) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          background: '#ffffff',
          borderRadius: Math.round(size * 0.3),
          padding: `${Math.round(size * 0.2)}px ${Math.round(size * 0.32)}px`,
          boxShadow: '0 2px 12px rgba(0,0,0,0.28)',
          flexShrink: 0,
          ...style,
        }}
      >
        {img}
      </span>
    )
  }

  return (
    <img
      src="/logo.png"
      alt="ARC PEM"
      style={{ display: 'block', height: size, width: 'auto', flexShrink: 0, ...style }}
    />
  )
}
