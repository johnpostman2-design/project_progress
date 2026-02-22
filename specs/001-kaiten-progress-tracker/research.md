# Research & Decisions: Отслеживание прогресса проектов из Kaiten

**Date**: 2025-02-02  
**Feature**: 001-kaiten-progress-tracker

## Research Areas

### 1. Kaiten API Integration

**Decision**: Использовать REST API Kaiten для получения досок, групп (этапов) и задач. Авторизация через API token в заголовках запросов.

**Rationale**: 
- Kaiten предоставляет REST API с документацией
- API token - стандартный метод авторизации для внешних интеграций
- REST API проще интегрировать, чем GraphQL или WebSocket

**Alternatives considered**:
- GraphQL API: Kaiten не предоставляет GraphQL endpoint
- WebSocket для real-time обновлений: избыточно для первой версии, можно добавить позже

**Implementation Notes**:
- Endpoints: `/api/v1/boards`, `/api/v1/boards/{boardId}/groups`, `/api/v1/cards` (задачи)
- Авторизация: `Authorization: Bearer {api_token}` в заголовках
- Rate limiting: необходимо учитывать лимиты Kaiten API (обычно 100 запросов/минуту)
- Retry strategy: exponential backoff для временных ошибок (5xx), до 3 попыток

**NEEDS CLARIFICATION**: Нет - решение принято на основе стандартных практик REST API интеграции.

---

### 2. Supabase PostgreSQL Structure

**Decision**: Использовать следующую структуру таблиц:
- `projects` - таблица проектов с полем `id` как primary key
- `stages` - таблица этапов с полем `project_id` как foreign key на `projects.id`

**Rationale**:
- Иерархическая структура отражает отношения проект → этап
- Эффективные запросы для получения всех этапов проекта
- Простые правила безопасности (доступ к проекту = доступ к этапам)

**Data Structure**:
```typescript
projects/{projectId}:
  - name: string
  - startDate: Timestamp
  - endDate: Timestamp
  - status: 'active' | 'completed' | 'archived'
  - kaitenBoardId?: string (опционально, для связи с доской Kaiten)
  - createdAt: Timestamp
  - updatedAt: Timestamp

projects/{projectId}/stages/{stageId}:
  - name: string
  - startDate: Timestamp
  - endDate: Timestamp
  - status: 'active' | 'paused' | 'completed'
  - pauseReason?: string
  - kaitenGroupId: string (ID группы в Kaiten)
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

**Alternatives considered**:
- Денормализация (хранить этапы в JSONB массиве внутри проекта): ограничения PostgreSQL на размер записи, сложнее обновления
- Отдельная таблица `stages` с `project_id` полем: выбранный вариант, эффективно для запросов, простые правила безопасности

**Security Rules (RLS)**:
- Чтение/запись только для аутентифицированных пользователей (через пароль)
- В первой версии - единый пароль для всех операций
- Row Level Security (RLS) политики в Supabase для контроля доступа

**NEEDS CLARIFICATION**: Нет - структура определена на основе best practices PostgreSQL/Supabase.

---

### 3. Timeline Rendering Algorithm

**Decision**: Использовать алгоритм размещения этапов в ряды на основе перекрывающихся дат. Параллельные этапы размещаются в отдельных горизонтальных рядах с визуальным смещением вправо.

**Algorithm**:
1. Сортировать этапы по дате начала
2. Для каждого этапа найти первый ряд, где нет перекрывающихся этапов
3. Если перекрытие есть во всех рядах - создать новый ряд
4. Визуально смещать каждый следующий ряд вправо на фиксированное значение (например, 20px)

**Rationale**:
- Визуально понятное отображение последовательности и параллельности
- Масштабируется для 20+ этапов
- Производительность: O(n²) в худшем случае, приемлемо для 20 этапов

**Alternatives considered**:
- Вертикальное размещение: не соответствует горизонтальному таймлайну
- Автоматическое масштабирование без смещения: менее понятно визуально

**Performance Considerations**:
- Для проектов с >20 этапами: виртуализация или пагинация
- Использовать CSS transforms для смещения (GPU-ускорение)
- Мемоизация расчёта layout при изменении дат

**NEEDS CLARIFICATION**: Нет - алгоритм определён на основе требований спецификации.

---

### 4. Progress Calculation

**Decision**: Процент выполнения этапа = (количество выполненных задач / общее количество задач) × 100%

**Formula**:
```
progress = (completedTasksCount / totalTasksCount) * 100
```

**Edge Cases**:
- Нет задач в этапе → progress = 0%
- Все задачи выполнены → progress = 100%
- Задачи без статуса → считаются невыполненными

**Rationale**:
- Простая и понятная формула
- Соответствует ожиданиям пользователя
- Легко вычисляется при каждой синхронизации

**Caching Strategy**:
- Пересчитывать прогресс при каждой синхронизации с Kaiten
- Кэшировать результат в локальном state компонента
- Обновлять только при изменении статусов задач

**Alternatives considered**:
- Учитывать вес задач: Kaiten не предоставляет веса задач в API
- Учитывать подзадачи: усложняет расчёт, не требуется в первой версии

**NEEDS CLARIFICATION**: Нет - формула стандартная для расчёта прогресса.

---

### 5. Figma MCP Integration

**Decision**: Использовать Figma MCP для получения компонентов UI kit и их интеграции в React приложение.

**Approach**:
1. Получить компоненты из Figma через MCP
2. Создать React компоненты на основе Figma дизайна
3. Использовать CSS/styled-components для стилизации согласно design system

**Rationale**:
- Соответствие конституции проекта (UI/UX Consistency)
- Единый источник истины для дизайна
- Упрощает поддержку и обновление UI

**Implementation Notes**:
- Использовать `mcp_Figma_get_design_context` для получения кода компонентов
- Адаптировать полученный код под React/TypeScript структуру проекта
- Сохранять соответствие с Figma при обновлениях дизайна

**Alternatives considered**:
- Ручное создание компонентов: не соответствует конституции, риск расхождений с дизайном
- Использование готовых UI библиотек: не соответствует требованию использовать Figma UI kit

**NEEDS CLARIFICATION**: Нет - подход определён конституцией проекта.

---

### 6. Task Storage Strategy

**Decision**: Задачи НЕ хранятся в Supabase. Они кэшируются только в локальном state приложения и всегда синхронизируются из Kaiten при необходимости.

**Rationale**:
- Задачи - это данные Kaiten, приложение их не владеет
- Избежание дублирования данных и проблем синхронизации
- Всегда актуальные данные из источника истины (Kaiten)

**Caching Strategy**:
- Кэшировать задачи в React state при загрузке этапа
- Обновлять кэш при синхронизации с Kaiten
- Не сохранять задачи в localStorage (слишком большой объём данных)

**Alternatives considered**:
- Хранить задачи в Firebase: дублирование данных, проблемы синхронизации, избыточно
- Хранить в localStorage: ограничения размера, сложность управления

**NEEDS CLARIFICATION**: Нет - стратегия определена в описании пользователя (задачи только для чтения).

---

### 7. Sync Strategy

**Decision**: Односторонняя синхронизация (read-only из Kaiten). Синхронизация при:
- Загрузке приложения
- Явном запросе пользователя (кнопка "Обновить")
- Возврате в приложение (focus event)

**Rationale**:
- Приложение не изменяет данные в Kaiten (требование спецификации)
- Пользователь контролирует момент синхронизации
- Избежание избыточных запросов к API

**Implementation**:
- Batch запросы к Kaiten API для всех этапов проекта одновременно
- Показывать индикатор загрузки во время синхронизации
- Обрабатывать ошибки синхронизации с возможностью retry

**Alternatives considered**:
- Автоматическая синхронизация каждые N минут: избыточно, может превысить rate limits
- WebSocket для real-time обновлений: Kaiten не предоставляет WebSocket API

**NEEDS CLARIFICATION**: Нет - стратегия определена в описании пользователя.

---

## Summary

Все research areas решены без NEEDS CLARIFICATION маркеров. Решения основаны на:
- Требованиях спецификации
- Best practices для используемых технологий
- Ограничениях и возможностях Kaiten API
- Принципах конституции проекта

Готово к переходу в Phase 1 (Design & Contracts).
