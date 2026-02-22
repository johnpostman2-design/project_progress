import React, { useState } from 'react'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import './PasswordAuth.css'

interface PasswordAuthProps {
  onAuthenticate: (password: string) => boolean
  className?: string
}

export const PasswordAuth: React.FC<PasswordAuthProps> = ({
  onAuthenticate,
  className = '',
}) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password.trim()) {
      setError('Введите пароль')
      return
    }

    const isValid = onAuthenticate(password)
    if (!isValid) {
      setError('Неверный пароль')
      // Не очищаем пароль, чтобы показать ошибку
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value)
    // Сбрасываем ошибку при изменении пароля
    if (error) {
      setError(null)
    }
  }

  return (
    <div className={`password-auth ${className}`} data-name="enter-password-form" data-node-id="284:3775">
      <p className="password-auth-title" data-node-id="284:3709">
        Вход в систему
      </p>
      <form className="password-auth-form" onSubmit={handleSubmit} data-node-id="284:3774">
        <Input
          type="primary"
          size="small"
          inputType="password"
          placeholder="Пароль"
          value={password}
          onChange={handlePasswordChange}
          autoFocus
          error={error || undefined}
          className="password-auth-input-wrapper"
        />
        <Button
          type="primary"
          size="small"
          buttonType="submit"
          className="password-auth-button-wrapper"
        >
          Войти
        </Button>
      </form>
    </div>
  )
}
