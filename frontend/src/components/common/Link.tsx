import React from 'react'
import './Link.css'

interface LinkProps {
  href?: string
  onClick?: () => void
  children: React.ReactNode
  className?: string
  /** Как кнопка (без href), для возврата/действий */
  asButton?: boolean
}

/**
 * Компонент Link из библиотеки Figma (node-id: 227-203).
 * Типографика: Label/small (14px, 16px), цвет content-secondary.
 */
export const Link: React.FC<LinkProps> = ({
  href,
  onClick,
  children,
  className = '',
  asButton = false,
}) => {
  const classList = `link ${className}`.trim()

  if (asButton || (!href && onClick)) {
    return (
      <button type="button" className={classList} onClick={onClick}>
        {children}
      </button>
    )
  }

  if (href) {
    return (
      <a className={classList} href={href} onClick={onClick}>
        {children}
      </a>
    )
  }

  return <span className={classList}>{children}</span>
}
