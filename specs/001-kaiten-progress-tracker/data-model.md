# Data Model: Отслеживание прогресса проектов из Kaiten

**Date**: 2025-02-02  
**Feature**: 001-kaiten-progress-tracker

## Overview

Приложение управляет сущностями **Project** (Проект) и **Stage** (Этап), используя **Task** (Задача) из Kaiten только для чтения. Задачи не хранятся в Supabase, только кэшируются локально и синхронизируются из Kaiten API.

## Entities

### Project (Проект)

**Ownership**: Приложение владеет проектами. Проекты создаются, редактируются и удаляются в приложении.

**Storage**: Supabase table `projects` (PostgreSQL)

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Уникальный идентификатор проекта (Firestore document ID) |
| `name` | string | Yes | Название проекта |
| `startDate` | Timestamp | No | Дата начала проекта |
| `endDate` | Timestamp | No | Дата окончания проекта |
| `status` | enum | Yes | Статус проекта: `'active'` \| `'completed'` \| `'archived'` |
| `kaitenBoardId` | string | No | ID доски в Kaiten (для связи с источником данных) |
| `createdAt` | Timestamp | Yes | Дата создания проекта |
| `updatedAt` | Timestamp | Yes | Дата последнего обновления |

**State Transitions**:
- `active` → `completed`: Проект завершён пользователем
- `active` → `archived`: Проект отправлен в архив
- `completed` → `archived`: Завершённый проект отправлен в архив
- `archived` → `active`: Проект восстановлен из архива (будущая функция)

**Validation Rules**:
- `name`: не пустая строка, максимум 200 символов
- `endDate`: если указана, должна быть >= `startDate`
- `status`: только допустимые значения enum

**Relationships**:
- Has many: `Stage` (через подколлекцию `projects/{projectId}/stages/{stageId}`)

---

### Stage (Этап)

**Ownership**: Приложение владеет этапами. Этапы создаются, редактируются и удаляются в приложении.

**Storage**: Supabase table `stages` (PostgreSQL) с foreign key на `projects.id`

**Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Уникальный идентификатор этапа (Supabase UUID или string) |
| `projectId` | string | Yes | ID родительского проекта |
| `name` | string | Yes | Название этапа |
| `startDate` | Timestamp | Yes | Дата начала этапа |
| `endDate` | Timestamp | Yes | Дата окончания этапа |
| `status` | enum | Yes | Статус этапа: `'active'` \| `'paused'` \| `'completed'` |
| `pauseReason` | string | No | Причина паузы (только если `status === 'paused'`) |
| `kaitenGroupId` | string | Yes | ID группы в Kaiten (для связи с этапом в Kaiten) |
| `createdAt` | Timestamp | Yes | Дата создания этапа |
| `updatedAt` | Timestamp | Yes | Дата последнего обновления |

**State Transitions**:
- `active` → `paused`: Этап поставлен на паузу с указанием причины
- `paused` → `active`: Этап возобновлён
- `active` → `completed`: Этап завершён
- `paused` → `completed`: Этап завершён с паузы

**Validation Rules**:
- `name`: не пустая строка, максимум 200 символов
- `endDate`: должна быть >= `startDate`
- `pauseReason`: обязательна, если `status === 'paused'`
- `kaitenGroupId`: обязателен, должен существовать в Kaiten

**Relationships**:
- Belongs to: `Project` (через `projectId`)
- References: `Task` из Kaiten (через `kaitenGroupId`, не хранится в Supabase)

**Computed Fields** (не хранятся, вычисляются):
- `progress`: процент выполнения (0-100), рассчитывается на основе задач из Kaiten
- `completedTasksCount`: количество выполненных задач
- `totalTasksCount`: общее количество задач

---

### Task (Задача)

**Ownership**: Kaiten владеет задачами. Приложение только читает задачи через API.

**Storage**: НЕ хранится в Supabase. Кэшируется только в локальном state React компонентов.

**Fields** (из Kaiten API):

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | number | Yes | ID задачи в Kaiten |
| `title` | string | Yes | Название задачи |
| `status` | object | Yes | Статус задачи из Kaiten (содержит информацию о выполнении) |
| `group_id` | number | Yes | ID группы (этапа) в Kaiten |
| `board_id` | number | Yes | ID доски в Kaiten |
| `created_at` | string | Yes | Дата создания (ISO string) |
| `updated_at` | string | Yes | Дата обновления (ISO string) |

**Computed Fields** (вычисляются в приложении):
- `isCompleted`: boolean - выполнена ли задача (на основе `status`)
- `stageId`: string - ID этапа в приложении (находится через `group_id` → `kaitenGroupId`)

**Validation Rules**:
- Задачи не валидируются в приложении (валидация в Kaiten)
- При синхронизации проверяется наличие обязательных полей из API

**Relationships**:
- Belongs to: `Stage` (через `group_id` → `kaitenGroupId`)
- Не имеет прямых связей в Supabase (только ссылочная связь через Kaiten)

---

## Data Flow

### Создание проекта с привязкой к Kaiten

1. Пользователь создаёт проект → создаётся документ в `projects/{projectId}`
2. Пользователь выбирает доску Kaiten → сохраняется `kaitenBoardId`
3. Пользователь выбирает группы (этапы) из Kaiten → создаются документы в `projects/{projectId}/stages/{stageId}` с `kaitenGroupId`
4. Пользователь устанавливает даты для этапов → обновляются `startDate` и `endDate` в этапах

### Синхронизация задач из Kaiten

1. Приложение запрашивает задачи для всех этапов проекта через Kaiten API
2. Задачи кэшируются в локальном state React компонента
3. Рассчитывается прогресс каждого этапа на основе статусов задач
4. Прогресс отображается в таймлайне

### Обновление прогресса этапа

1. При синхронизации получаются актуальные задачи из Kaiten
2. Для каждого этапа вычисляется: `progress = (completedTasks / totalTasks) * 100`
3. Прогресс отображается визуально в ячейке этапа в таймлайне

---

## Indexes

**Supabase PostgreSQL Indexes** (для оптимизации запросов):

1. `projects` collection:
   - Index on `status` (для фильтрации активных/архивных проектов)
   - Index on `createdAt` (для сортировки по дате создания)

2. `projects/{projectId}/stages` subcollection:
   - Index on `status` (для фильтрации этапов по статусу)
   - Index on `startDate` (для сортировки этапов в таймлайне)

---

## Constraints & Limitations

1. **Задачи не хранятся в Supabase**: Всегда синхронизируются из Kaiten при необходимости
2. **Односторонняя синхронизация**: Приложение не изменяет данные в Kaiten
3. **Связь через Kaiten IDs**: Этапы связаны с группами Kaiten через `kaitenGroupId`
4. **Максимальные размеры**:
   - Проект: до 50 проектов одновременно
   - Этапы: до 20 этапов на проект
   - Задачи: до 100 задач на этап (кэширование в памяти)

---

## Migration Considerations

**Future Changes** (не в первой версии):
- Добавление весов задач для расчёта прогресса
- Хранение истории изменений прогресса
- Поддержка подзадач
- Множественные доски Kaiten на один проект

**Backward Compatibility**:
- Все новые поля должны быть опциональными
- Старые версии приложения должны работать с новой структурой данных
