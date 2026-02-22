import React from 'react'

type IconSize = 16 | 24 | 32

export interface IconProps {
  name: string
  size?: IconSize
  className?: string
  ariaLabel?: string
}

const iconModules = import.meta.glob<{ default: React.ComponentType<React.SVGProps<SVGSVGElement>> }>(
  '/src/assets/icons/icon/icon/icon/*.svg',
  { eager: true, query: '?react' }
)

/** Маппинг имён иконок в коде на файлы в assets/icons/icon/icon/icon/ */
const NAME_TO_FILE: Record<string, string> = {
  'plus': 'plus.svg',
  'minus': 'minus.svg',
  'check': 'check, done-1.svg',
  'cross': 'cross, delete-1.svg',
  'delete-circle': 'delete, cross, circle-1.svg',
  'arrow-left': 'arrow-left-1.svg',
  'arrow-right': 'arrow-right-1.svg',
  'link': 'link, chain-1.svg',
  'trash': 'trash, bin, delete-1.svg',
  'reload': 'reload-1.svg',
  'pencil': 'pencil, edit.svg',
  'pause': 'pause-2.svg',
  'kebab': 'kebab, menu, more.svg',
  'loading': 'loading-1.svg',
  'chart': 'chart-1.svg',
  'cloud': 'cloud-1.svg',
}

function getIconKey(name: string, _size: IconSize): string | undefined {
  const file = NAME_TO_FILE[name]
  if (!file) return undefined
  return Object.keys(iconModules).find((key) => key.endsWith(file))
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  className,
  ariaLabel,
}) => {
  const key = getIconKey(name, size)
  const mod = key ? iconModules[key] : null
  const Component = mod?.default ?? null

  if (!Component) {
    if (import.meta.env.DEV) {
      console.warn(`[Icon] Иконка не найдена: name="${name}"`)
    }
    return null
  }

  return (
    <Component
      width={size}
      height={size}
      className={className}
      role={ariaLabel ? 'img' : undefined}
      aria-label={ariaLabel}
      aria-hidden={!ariaLabel}
    />
  )
}
