import styles from './LoadingIndicator.module.css'

interface LoadingIndicatorProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function LoadingIndicator({ size = 'md', className = '' }: LoadingIndicatorProps) {
  const configs = {
    sm: { trackWidth: 48, trackHeight: 12, dotSize: 12, animationClass: styles.animateSm },
    md: { trackWidth: 64, trackHeight: 16, dotSize: 16, animationClass: styles.animateMd },
    lg: { trackWidth: 80, trackHeight: 20, dotSize: 20, animationClass: styles.animateLg }
  }

  const config = configs[size]

  return (
    <div
      className={`relative border border-gray-200 ${className}`}
      style={{
        width: `${config.trackWidth}px`,
        height: `${config.trackHeight}px`
      }}
    >
      <div className="absolute inset-0 bg-gray-50" />
      <div
        className={`absolute bg-gray-600 ${config.animationClass}`}
        style={{
          width: `${config.dotSize}px`,
          height: `${config.dotSize}px`,
          top: `${(config.trackHeight - config.dotSize) / 2}px`
        }}
      />
    </div>
  )
}
