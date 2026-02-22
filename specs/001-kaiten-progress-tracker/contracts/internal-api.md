# Internal API Contracts

**Date**: 2025-02-02  
**Feature**: 001-kaiten-progress-tracker

## Overview

Внутренние API контракты для сервисов приложения. Эти контракты определяют интерфейсы между компонентами приложения.

## Services

### KaitenService

**Location**: `services/kaiten/kaitenApi.ts`

#### `getBoards(): Promise<Board[]>`
Получить список всех досок из Kaiten.

**Returns**: Массив досок Kaiten

**Errors**:
- `KaitenApiError`: Ошибка API Kaiten
- `NetworkError`: Проблемы с сетью

---

#### `getBoardGroups(boardId: number): Promise<Group[]>`
Получить группы (этапы) для доски.

**Parameters**:
- `boardId: number` - ID доски в Kaiten

**Returns**: Массив групп доски

**Errors**:
- `KaitenApiError`: Доска не найдена или ошибка API
- `NetworkError`: Проблемы с сетью

---

#### `getCardsByGroup(groupId: number, boardId: number): Promise<Card[]>`
Получить задачи для группы (этапа).

**Parameters**:
- `groupId: number` - ID группы в Kaiten
- `boardId: number` - ID доски в Kaiten

**Returns**: Массив задач группы

**Errors**:
- `KaitenApiError`: Группа не найдена или ошибка API
- `NetworkError`: Проблемы с сетью

---

#### `getCardsByBoard(boardId: number): Promise<Card[]>`
Получить все задачи доски.

**Parameters**:
- `boardId: number` - ID доски в Kaiten

**Returns**: Массив всех задач доски

**Errors**:
- `KaitenApiError`: Доска не найдена или ошибка API
- `NetworkError`: Проблемы с сетью

---

### SupabaseService

**Location**: `services/supabase/supabaseService.ts`

#### `getProjects(): Promise<Project[]>`
Получить все проекты пользователя.

**Returns**: Массив проектов

**Errors**:
- `SupabaseError`: Ошибка Supabase

---

#### `getProject(projectId: string): Promise<Project | null>`
Получить проект по ID.

**Parameters**:
- `projectId: string` - ID проекта

**Returns**: Проект или null, если не найден

**Errors**:
- `SupabaseError`: Ошибка Supabase

---

#### `createProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>): Promise<Project>`
Создать новый проект.

**Parameters**:
- `project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>` - Данные проекта

**Returns**: Созданный проект с ID и датами

**Errors**:
- `SupabaseError`: Ошибка создания
- `ValidationError`: Невалидные данные

---

#### `updateProject(projectId: string, updates: Partial<Project>): Promise<void>`
Обновить проект.

**Parameters**:
- `projectId: string` - ID проекта
- `updates: Partial<Project>` - Обновления

**Errors**:
- `SupabaseError`: Ошибка обновления
- `NotFoundError`: Проект не найден

---

#### `deleteProject(projectId: string): Promise<void>`
Удалить проект (включая все этапы).

**Parameters**:
- `projectId: string` - ID проекта

**Errors**:
- `SupabaseError`: Ошибка удаления
- `NotFoundError`: Проект не найден

---

#### `getStages(projectId: string): Promise<Stage[]>`
Получить все этапы проекта.

**Parameters**:
- `projectId: string` - ID проекта

**Returns**: Массив этапов

**Errors**:
- `SupabaseError`: Ошибка Supabase

---

#### `createStage(projectId: string, stage: Omit<Stage, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>): Promise<Stage>`
Создать новый этап в проекте.

**Parameters**:
- `projectId: string` - ID проекта
- `stage: Omit<Stage, 'id' | 'projectId' | 'createdAt' | 'updatedAt'>` - Данные этапа

**Returns**: Созданный этап

**Errors**:
- `SupabaseError`: Ошибка создания
- `ValidationError`: Невалидные данные

---

#### `updateStage(projectId: string, stageId: string, updates: Partial<Stage>): Promise<void>`
Обновить этап.

**Parameters**:
- `projectId: string` - ID проекта
- `stageId: string` - ID этапа
- `updates: Partial<Stage>` - Обновления

**Errors**:
- `SupabaseError`: Ошибка обновления
- `NotFoundError`: Этап не найден

---

#### `deleteStage(projectId: string, stageId: string): Promise<void>`
Удалить этап.

**Parameters**:
- `projectId: string` - ID проекта
- `stageId: string` - ID этапа

**Errors**:
- `SupabaseError`: Ошибка удаления
- `NotFoundError`: Этап не найден

---

### SyncService

**Location**: `services/sync/syncService.ts`

#### `syncProjectTasks(project: Project): Promise<Task[]>`
Синхронизировать задачи для всех этапов проекта из Kaiten.

**Parameters**:
- `project: Project` - Проект для синхронизации

**Returns**: Массив всех задач проекта

**Errors**:
- `KaitenApiError`: Ошибка API Kaiten
- `NetworkError`: Проблемы с сетью

---

#### `calculateStageProgress(stage: Stage, tasks: Task[]): number`
Рассчитать прогресс этапа на основе задач.

**Parameters**:
- `stage: Stage` - Этап
- `tasks: Task[]` - Задачи этапа

**Returns**: Процент выполнения (0-100)

**Returns**: `number` - Процент выполнения (0-100)

---

## Types

### Board
```typescript
interface Board {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}
```

### Group
```typescript
interface Group {
  id: number;
  name: string;
  board_id: number;
  position: number;
  created_at: string;
  updated_at: string;
}
```

### Card (Task)
```typescript
interface Card {
  id: number;
  title: string;
  status: {
    id: number;
    name: string;
    is_closed: boolean;
  };
  group_id: number;
  board_id: number;
  created_at: string;
  updated_at: string;
}
```

### Project
```typescript
interface Project {
  id: string;
  name: string;
  startDate?: Timestamp;
  endDate?: Timestamp;
  status: 'active' | 'completed' | 'archived';
  kaitenBoardId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Stage
```typescript
interface Stage {
  id: string;
  projectId: string;
  name: string;
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'paused' | 'completed';
  pauseReason?: string;
  kaitenGroupId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Task
```typescript
interface Task {
  id: number;
  title: string;
  status: {
    id: number;
    name: string;
    is_closed: boolean;
  };
  group_id: number;
  board_id: number;
  created_at: string;
  updated_at: string;
  // Computed
  isCompleted: boolean;
  stageId?: string;
}
```
