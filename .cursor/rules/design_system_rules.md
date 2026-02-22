# Design System Rules для интеграции с Figma MCP

Этот документ описывает структуру дизайн-системы проекта для эффективной интеграции с Figma через Model Context Protocol.

## 1. Token Definitions (Дизайн-токены)

### Расположение
Дизайн-токены определены в `frontend/src/index.css` в блоке `:root` через CSS переменные.

### Структура токенов

#### Цвета (Colors)
```css
/* Surface (поверхности) */
--surface-primary-main: white;
--surface-primary-hover: rgba(0, 0, 0, 0.08);
--surface-primary-invert-main: black;
--surface-primary-invert-hover: rgba(0, 0, 0, 0.6);
--surface-primary-invert-disabled: rgba(0, 0, 0, 0.04);
--surface-secondary-disabled: rgba(0, 0, 0, 0.04);
--surface-tertiary-main: rgba(0, 0, 0, 0.16);

/* Content (контент) */
--content-primary: black;
--content-secondary: rgba(0, 0, 0, 0.6);
--content-tertiary: rgba(0, 0, 0, 0.32);
--content-disabled: rgba(0, 0, 0, 0.08);
--content-invert: white;
--content-error: red;

/* Border (границы) */
--border-secondary: rgba(0, 0, 0, 0.32);
--border-tertiary: rgba(0, 0, 0, 0.16);
--border-disabled: rgba(0, 0, 0, 0.04);
--border-error: rgba(255, 0, 0, 0.4);
```

#### Spacing (Отступы)
```css
--spacing-4: 4px;
--spacing-8: 8px;
--spacing-12: 12px;
--spacing-16: 16px;
--spacing-20: 20px;
--spacing-24: 24px;
--spacing-28: 28px;
--spacing-32: 32px;
--spacing-44: 44px;
--spacing-60: 60px;
```

#### Typography (Типографика)
```css
--font-family: 'ONY_ONE', sans-serif;
--font-size-p2: 17px;
--font-size-label-small: 14px;
--font-size-label-large: 20px;
--font-size-caption: 12px;
--line-height-p2: 24px;
--line-height-label-small: 16px;
--line-height-label-large: 32px;
--line-height-caption: 14px;
```

#### Border Radius
```css
--radius-xs: 2px;
--radius-s: 4px;
```

### Использование токенов
Все компоненты должны использовать CSS переменные вместо хардкода значений:
```css
.button {
  padding: var(--spacing-8) var(--spacing-12);
  background: var(--surface-primary-invert-main);
  color: var(--content-invert);
  border-radius: var(--radius-s);
}
```

### Соглашения по именованию
- **Surface**: `--surface-{variant}-{state}` (например, `--surface-primary-main`)
- **Content**: `--content-{variant}` (например, `--content-primary`)
- **Border**: `--border-{variant}` (например, `--border-secondary`)
- **Spacing**: `--spacing-{value}` (например, `--spacing-8`)
- **Typography**: `--font-size-{name}`, `--line-height-{name}`

## 2. Component Library (Библиотека компонентов)

### Расположение
Компоненты находятся в `frontend/src/components/` с следующей структурой:

```
components/
├── common/          # Переиспользуемые UI компоненты
│   ├── Button.tsx
│   ├── Button.css
│   ├── Input.tsx
│   ├── Input.css
│   ├── DatePicker.tsx
│   ├── LoadingSpinner.tsx
│   ├── ConfirmDialog.tsx
│   ├── ErrorBoundary.tsx
│   └── icons/     # Иконки
├── auth/            # Компоненты аутентификации
├── projects/        # Компоненты проектов
├── stages/           # Компоненты этапов
├── timeline/         # Компоненты временной шкалы
└── kaiten/           # Компоненты интеграции с Kaiten
```

### Архитектура компонентов

#### Структура компонента
Каждый компонент состоит из:
1. **TypeScript файл** (`.tsx`) - логика и разметка
2. **CSS файл** (`.css`) - стили компонента
3. **Интерфейс Props** - типизированные пропсы

Пример структуры:
```typescript
// Button.tsx
import React from 'react'
import './Button.css'

interface ButtonProps {
  type?: 'primary' | 'secondary' | 'text' | 'backless'
  size?: 'small' | 'medium' | 'large'
  state?: 'default' | 'hover' | 'disabled'
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}

export const Button: React.FC<ButtonProps> = ({
  type = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  className = '',
}) => {
  return (
    <button
      className={`button button-${type} button-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}
```

#### Соглашения по именованию
- **Компоненты**: PascalCase (например, `Button`, `ProjectCard`)
- **Файлы**: Соответствуют имени компонента (например, `Button.tsx`, `Button.css`)
- **CSS классы**: kebab-case с префиксом компонента (например, `.button`, `.button-primary`)
- **Props интерфейсы**: `{ComponentName}Props` (например, `ButtonProps`)

#### Состояния компонентов
Компоненты поддерживают стандартные состояния:
- `default` - обычное состояние
- `hover` - при наведении
- `focus` - при фокусе (для инпутов)
- `disabled` - отключенное состояние
- `loading` - состояние загрузки (где применимо)
- `invalid` - невалидное состояние (для форм)

### Основные компоненты

#### Button
- **Типы**: `primary`, `secondary`, `text`, `backless`, `success`, `danger`, `caution`
- **Размеры**: `small` (32px), `medium` (40px), `large` (48px)
- **Файл**: `frontend/src/components/common/Button.tsx`

#### Input
- **Типы**: `backless`, `primary`
- **Размеры**: `small` (32px), `medium` (40px)
- **Состояния**: `default`, `hover`, `focus`, `filled`, `disabled`, `invalid`
- **Файл**: `frontend/src/components/common/Input.tsx`

#### ProgressBar
- Показывает прогресс этапа (0-100%)
- Поддерживает состояния `paused` и `completed`
- **Файл**: `frontend/src/components/timeline/ProgressBar.tsx`

## 3. Frameworks & Libraries

### UI Framework
- **React** 18.2.0
- **TypeScript** 5.2.2
- **React Router DOM** 6.20.0 (для маршрутизации)

### Styling
- **Чистый CSS** (без CSS-in-JS)
- **CSS Modules** не используются - каждый компонент имеет свой `.css` файл
- **CSS переменные** для дизайн-токенов

### Build System
- **Vite** 5.0.8 - сборщик и dev-сервер
- **ESLint** - линтинг кода
- **Prettier** - форматирование кода

### Конфигурация Vite
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Path Aliases
- `@/*` → `src/*` (например, `@/components/common/Button`)

## 4. Asset Management (Управление ассетами)

### Шрифты
- **Расположение**: `frontend/public/fonts/`
- **Формат**: WOFF2
- **Шрифт**: ONY_ONE (с весами: Thin 100, Light 300, Regular 400, Medium 500, Bold 700, Black 900)
- **Определение**: В `frontend/src/index.css` через `@font-face`

```css
@font-face {
  font-family: 'ONY_ONE';
  src: url('/fonts/ONYOne-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
```

### Изображения и иконки
- **Иконки**: Используются через Figma MCP API
- **Формат**: SVG/PNG через URL от Figma
- **Пример**: 
```typescript
const iconPlusImage = 'https://www.figma.com/api/mcp/asset/ec7cc8e2-e45f-455d-a0f7-c0158d56a7cb'
```

### Оптимизация
- Шрифты используют `font-display: swap` для быстрой загрузки
- Иконки загружаются по требованию через Figma API

### CDN
В проекте не используется внешний CDN. Все ассеты хранятся локально или загружаются через Figma MCP.

## 5. Icon System (Система иконок)

### Расположение
Иконки находятся в `frontend/src/components/common/icons/`

### Структура иконки
Каждая иконка состоит из:
- **TypeScript компонент** (например, `Icon24Plus.tsx`)
- **CSS файл** (например, `Icon24Plus.css`)

### Соглашения по именованию
- **Формат**: `Icon{Size}{Name}` (например, `Icon24Plus`, `Icon24Check`)
- **Размер**: Указывается в названии (например, `24` для 24x24px)
- **data-атрибуты**: 
  - `data-name` - имя иконки из Figma
  - `data-node-id` - ID ноды из Figma

### Пример иконки
```typescript
// Icon24Plus.tsx
import React from 'react'
import './Icon24Plus.css'

const iconPlusImage = 'https://www.figma.com/api/mcp/asset/...'

export const Icon24Plus: React.FC<Icon24PlusProps> = ({ className = '' }) => {
  return (
    <div className={`icon-24-plus ${className}`} data-name="24/plus" data-node-id="117:427">
      <div className="icon-24-plus-union" data-name="Union" data-node-id="205:898">
        <img alt="plus" className="icon-24-plus-image" src={iconPlusImage} />
      </div>
    </div>
  )
}
```

### Доступные иконки
- `Icon24Plus` - плюс
- `Icon24Check` - галочка
- `Icon24Pause` - пауза
- `Icon24Link` - ссылка

### Использование иконок
```typescript
import { Icon24Plus } from '../components/common/icons/Icon24Plus'

<Button>
  <Icon24Plus />
</Button>
```

## 6. Styling Approach (Подход к стилизации)

### Методология
- **Отдельные CSS файлы** для каждого компонента
- **CSS переменные** для дизайн-токенов
- **БЭМ-подобное именование** классов (например, `.button-primary`, `.button-small`)

### Глобальные стили
Определены в `frontend/src/index.css`:
- Сброс стилей (`* { margin: 0; padding: 0; box-sizing: border-box; }`)
- Базовые стили body
- Дизайн-токены
- Типографические классы (`.label-medium`, `.label-small`, `.caption-medium`)
- Layout классы (`.app-container`, `.main-content`, `.sidebar`)

### Стили компонентов
Каждый компонент импортирует свой CSS файл:
```typescript
import './Button.css'
```

### Responsive Design
В текущей версии проекта не используется медиа-запросы. Дизайн ориентирован на десктоп.

### CSS переменные в компонентах
Все компоненты должны использовать CSS переменные:
```css
.button {
  padding: var(--spacing-8) var(--spacing-12);
  background: var(--surface-primary-invert-main);
  color: var(--content-invert);
  font-family: var(--font-family);
  font-size: var(--font-size-p2);
  border-radius: var(--radius-s);
}
```

## 7. Project Structure (Структура проекта)

### Общая организация
```
frontend/
├── public/              # Статические файлы
│   └── fonts/          # Шрифты
├── src/
│   ├── components/     # React компоненты
│   │   ├── common/     # Общие компоненты
│   │   ├── auth/       # Аутентификация
│   │   ├── projects/   # Проекты
│   │   ├── stages/      # Этапы
│   │   ├── timeline/   # Временная шкала
│   │   └── kaiten/     # Интеграция Kaiten
│   ├── hooks/          # React хуки
│   ├── models/         # TypeScript модели данных
│   ├── pages/          # Страницы приложения
│   ├── services/       # Сервисы (Firebase, Kaiten API)
│   ├── utils/          # Утилиты
│   ├── App.tsx         # Главный компонент
│   ├── main.tsx        # Точка входа
│   └── index.css       # Глобальные стили и токены
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

### Паттерны организации

#### Feature-based структура
Компоненты организованы по функциональным областям:
- `components/projects/` - все компоненты, связанные с проектами
- `components/stages/` - компоненты этапов
- `components/timeline/` - компоненты временной шкалы

#### Общие компоненты
Переиспользуемые UI компоненты в `components/common/`:
- Базовые компоненты (Button, Input)
- Утилиты (LoadingSpinner, ErrorBoundary)
- Иконки

#### Сервисы
Бизнес-логика вынесена в `services/`:
- `services/firebase/` - работа с Firebase
- `services/kaiten/` - интеграция с Kaiten API
- `services/sync/` - синхронизация данных

#### Хуки
Кастомные React хуки в `hooks/`:
- `useProjects.ts` - управление проектами
- `useStages.ts` - управление этапами
- `useKaitenSync.ts` - синхронизация с Kaiten

## 8. Интеграция с Figma MCP

### Сопоставление компонентов
При интеграции компонентов из Figma:

1. **Используйте node-id** из Figma для отслеживания соответствия
2. **Сохраняйте data-атрибуты** `data-name` и `data-node-id` в компонентах
3. **Используйте CSS переменные** вместо хардкода значений из Figma
4. **Следуйте соглашениям именования** компонентов

### Пример интеграции
```typescript
// Компонент из Figma с node-id: 1-8
export const Button: React.FC<ButtonProps> = ({ ... }) => {
  return (
    <button
      className="button button-primary"
      data-name="button"
      data-node-id="1:8"
    >
      {children}
    </button>
  )
}
```

### Обновление токенов из Figma
При обновлении дизайн-токенов из Figma:
1. Экспортируйте токены из Figma
2. Обновите CSS переменные в `frontend/src/index.css`
3. Убедитесь, что все компоненты используют переменные

### Иконки из Figma
1. Используйте Figma MCP для получения URL иконок
2. Сохраните структуру иконки с data-атрибутами
3. Создайте компонент по паттерну `Icon{Size}{Name}`

## 9. Best Practices (Лучшие практики)

### Компоненты
- ✅ Используйте TypeScript для типизации
- ✅ Разделяйте логику и стили (отдельные файлы)
- ✅ Используйте CSS переменные для всех значений
- ✅ Добавляйте data-атрибуты для связи с Figma
- ❌ Не хардкодьте значения цветов, отступов, размеров

### Стили
- ✅ Используйте семантические классы
- ✅ Следуйте соглашениям именования
- ✅ Группируйте стили по состояниям
- ❌ Не используйте inline стили (кроме динамических значений)

### Иконки
- ✅ Создавайте компоненты для каждой иконки
- ✅ Сохраняйте data-атрибуты из Figma
- ✅ Используйте осмысленные alt-тексты

### Импорты
- ✅ Используйте path aliases (`@/components/...`)
- ✅ Группируйте импорты (React, библиотеки, компоненты, стили)
- ✅ Используйте именованные экспорты

## 10. Примеры использования

### Создание нового компонента из Figma

1. **Получите дизайн-контекст из Figma**:
```typescript
// Используйте Figma MCP get_design_context
```

2. **Создайте TypeScript компонент**:
```typescript
// components/common/NewComponent.tsx
import React from 'react'
import './NewComponent.css'

interface NewComponentProps {
  // определите пропсы
}

export const NewComponent: React.FC<NewComponentProps> = ({ ... }) => {
  return (
    <div className="new-component" data-node-id="...">
      {/* разметка */}
    </div>
  )
}
```

3. **Создайте CSS файл**:
```css
/* components/common/NewComponent.css */
.new-component {
  padding: var(--spacing-8);
  background: var(--surface-primary-main);
  color: var(--content-primary);
  /* используйте токены */
}
```

4. **Используйте компонент**:
```typescript
import { NewComponent } from '@/components/common/NewComponent'
```

---

**Последнее обновление**: 2024
**Версия дизайн-системы**: 0.1.0
