# Implementation Plan: Отслеживание прогресса проектов из Kaiten

**Branch**: `001-kaiten-progress-tracker` | **Date**: 2025-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-kaiten-progress-tracker/spec.md`

## Summary

Веб-приложение для визуализации прогресса проектов в виде таймлайна, где готовность этапов рассчитывается автоматически на основе статусов задач из Kaiten API. Приложение владеет сущностями Проект и Этап, используя Kaiten как внешний источник задач только для чтения. Одностраничное приложение с локальным состоянием, интеграцией с Kaiten API и закрытым доступом по паролю.

## Technical Context

**Language/Version**: TypeScript 5.x, React 18.x  
**Primary Dependencies**: React, React Router, Supabase SDK (PostgreSQL), Kaiten API client, Figma MCP для UI компонентов  
**Storage**: Supabase PostgreSQL для проектов, этапов, настроек пользователя  
**Testing**: Jest, React Testing Library, MSW (Mock Service Worker) для моков Kaiten API  
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari последних версий)  
**Project Type**: Web application (frontend-only с Supabase как backend-as-a-service)  
**Performance Goals**: Загрузка списка проектов < 3 сек, рендеринг таймлайна с 20 этапами < 1 сек, синхронизация с Kaiten < 5 сек  
**Constraints**: Работа с до 50 проектами, до 20 этапов на проект, до 100 задач на этап. Поддержка параллельных этапов с перекрывающимися датами.  
**Scale/Scope**: Личное приложение для одного пользователя или небольшой команды (первая версия)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

✅ **I. Type Safety First**: Все компоненты, API вызовы, модели данных будут полностью типизированы TypeScript. Type definitions для Kaiten API будут созданы на основе документации API.

✅ **II. Component-Based Architecture**: Timeline, StageCell, ProjectList, StageDetails, ProjectDetails реализованы как независимые React компоненты с чёткими props интерфейсами, error boundaries и loading states.

✅ **III. Стандарты интеграции с API**: Kaiten API абстрагирован за service layer (`services/kaiten/kaitenApi.ts`). Все вызовы включают error handling, retry logic для временных сбоев, кэширование ответов. Синхронизация односторонняя (read-only из Kaiten).

✅ **IV. Консистентность UI/UX**: Все UI компоненты следуют design system из Figma UI kit через Figma MCP. Кастомное стилизование только при явном одобрении.

✅ **V. Масштабируемость и расширяемость**: Модульная структура с разделением data layer (models, services), presentation layer (components), business logic (hooks, utils). Configuration для feature flags.

✅ **VI. Целостность синхронизации данных**: Прогресс этапов рассчитывается автоматически на основе статусов задач из Kaiten. Таймлайн всегда отражает актуальное состояние через синхронизацию.

**GATE STATUS (Pre-Research)**: ✅ PASSED - Все принципы конституции соблюдены

### Post-Design Check

✅ **I. Type Safety First**: Модели данных полностью типизированы (см. data-model.md). API контракты определены с TypeScript интерфейсами (см. contracts/).

✅ **II. Component-Based Architecture**: Структура компонентов определена в Project Structure. Каждый компонент имеет чёткую область ответственности.

✅ **III. Стандарты интеграции с API**: Kaiten API контракты определены (contracts/kaiten-api.yaml). Service layer структура определена (contracts/internal-api.md). Error handling и retry strategies описаны в research.md.

✅ **IV. Консистентность UI/UX**: Подход к использованию Figma MCP определён в research.md. Все компоненты будут следовать design system.

✅ **V. Масштабируемость и расширяемость**: Модульная структура определена. Разделение concerns реализовано через layers (models, services, components, hooks).

✅ **VI. Целостность синхронизации данных**: Стратегия синхронизации определена (односторонняя, read-only). Формула расчёта прогресса определена в research.md и data-model.md.

**GATE STATUS (Post-Design)**: ✅ PASSED - Все принципы конституции соблюдены после Phase 1

## Project Structure

### Documentation (this feature)

```text
specs/001-kaiten-progress-tracker/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── timeline/
│   │   │   ├── Timeline.tsx
│   │   │   ├── TimelineRow.tsx
│   │   │   ├── StageCell.tsx
│   │   │   └── ProgressBar.tsx
│   │   ├── projects/
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectCard.tsx
│   │   │   └── ProjectDetails.tsx
│   │   ├── stages/
│   │   │   ├── StageDetails.tsx
│   │   │   ├── StagePauseModal.tsx
│   │   │   └── StageTaskList.tsx
│   │   ├── kaiten/
│   │   │   ├── KaitenBoardSelector.tsx
│   │   │   ├── KaitenStagePreview.tsx
│   │   │   └── KaitenImportModal.tsx
│   │   ├── common/
│   │   │   ├── DatePicker.tsx
│   │   │   ├── ConfirmDialog.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   └── auth/
│   │       └── PasswordAuth.tsx
│   ├── services/
│   │   ├── kaiten/
│   │   │   ├── kaitenApi.ts
│   │   │   ├── kaitenTypes.ts
│   │   │   └── kaitenSync.ts
│   │   ├── firebase/
│   │   │   ├── firebaseConfig.ts
│   │   │   ├── firebaseService.ts
│   │   │   └── firebaseTypes.ts
│   │   └── sync/
│   │       └── syncService.ts
│   ├── models/
│   │   ├── project.ts
│   │   ├── stage.ts
│   │   └── task.ts
│   ├── hooks/
│   │   ├── useProjects.ts
│   │   ├── useStages.ts
│   │   ├── useKaitenSync.ts
│   │   └── useTimeline.ts
│   ├── utils/
│   │   ├── progressCalculator.ts
│   │   ├── timelineLayout.ts
│   │   └── dateUtils.ts
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Archive.tsx
│   │   └── Auth.tsx
│   ├── App.tsx
│   └── main.tsx
├── public/
└── tests/
    ├── unit/
    │   ├── components/
    │   ├── services/
    │   └── utils/
    ├── integration/
    │   └── kaitenSync.test.ts
    └── e2e/
        └── projectWorkflow.test.ts
```

**Structure Decision**: Web application структура (Option 2) выбрана, так как это frontend-only приложение с Supabase как backend-as-a-service. Все компоненты организованы по функциональным областям (timeline, projects, stages, kaiten). Services слой абстрагирует работу с внешними API и Supabase. Hooks инкапсулируют бизнес-логику и состояние.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

Нет нарушений конституции, требующих обоснования.

## Phase 0: Research & Decisions

*See [research.md](./research.md) for detailed research findings and decisions.*

### Research Areas

1. **Kaiten API Integration**
   - Endpoints для досок, групп (этапов), задач
   - Авторизация и authentication flow
   - Rate limiting и best practices
   - Обработка ошибок и retry strategies

2. **Supabase PostgreSQL Structure**
   - Оптимальная структура коллекций для проектов и этапов
   - Индексы для запросов
   - Правила безопасности (security rules)
   - Офлайн-поддержка (если требуется)

3. **Timeline Rendering Algorithm**
   - Алгоритм размещения параллельных этапов
   - Визуальное смещение рядов
   - Производительность рендеринга больших таймлайнов
   - Responsive design подходы

4. **Progress Calculation**
   - Формула расчёта процента выполнения этапа
   - Обработка задач без статуса
   - Кэширование результатов расчёта

5. **Figma MCP Integration**
   - Получение компонентов из Figma UI kit
   - Использование компонентов в React
   - Кастомизация компонентов при необходимости

## Phase 1: Design Artifacts

✅ **COMPLETED** - Все артефакты созданы.

*See detailed artifacts:*
- **[data-model.md](./data-model.md)** - Модели данных Project, Stage, Task с полями, валидацией и state transitions
- **[contracts/kaiten-api.yaml](./contracts/kaiten-api.yaml)** - OpenAPI спецификация для Kaiten API (read-only)
- **[contracts/internal-api.md](./contracts/internal-api.md)** - Внутренние API контракты для сервисов приложения
- **[quickstart.md](./quickstart.md)** - Сценарии использования и quick start guide с error handling

### Key Design Decisions

1. **Data Model**: Проекты и этапы хранятся в Supabase PostgreSQL. Задачи НЕ хранятся в Supabase, только кэшируются локально в React state и всегда синхронизируются из Kaiten API.

2. **Kaiten Mapping**:
   - Доска Kaiten → источник данных проекта (сохраняется `kaitenBoardId` для связи)
   - Группа Kaiten → этап проекта (связь через `kaitenGroupId`, обязательное поле)
   - Задача Kaiten → используется только для расчёта прогресса, не хранится в Firebase

3. **Timeline Layout**: Параллельные этапы размещаются в отдельных горизонтальных рядах с визуальным смещением вправо (20px) для показа последовательности. Алгоритм: O(n²) в худшем случае, приемлемо для 20 этапов.

4. **Sync Strategy**: Односторонняя синхронизация (read-only из Kaiten). Приложение НЕ изменяет данные в Kaiten. Синхронизация при загрузке приложения, явном запросе пользователя, возврате в приложение (focus event).

5. **Progress Calculation**: Формула `progress = (completedTasksCount / totalTasksCount) * 100`. Пересчитывается при каждой синхронизации с Kaiten.

6. **Supabase Structure**: Реляционная структура `projects` и `stages` таблиц с foreign key для эффективных запросов и простых правил безопасности (RLS).

## Phase 2: Implementation Strategy

*This section will be completed after Phase 1 design artifacts are finalized.*

### Implementation Phases (from user input)

1. **Базовая модель данных** - Project, Stage, Task entities
2. **Интеграция с Kaiten** - API client, авторизация, загрузка данных
3. **Создание проекта** - UI для создания и привязки к Kaiten
4. **Визуализация таймлайна** - Timeline компонент с поддержкой параллельных этапов
5. **Работа с этапом** - Боковая панель с управлением этапом
6. **Управление проектом** - Боковая панель проекта, архивация
7. **Синхронизация** - Стратегия обновления данных из Kaiten
8. **Доступ и безопасность** - Парольная защита приложения

### Edge Cases Handling

- Kaiten API недоступен → показ ошибки, возможность retry
- Этап в Kaiten удалён → пометка этапа как "недоступен в Kaiten", возможность перепривязки
- Задачи изменили статус → автоматический пересчёт прогресса при синхронизации
- Параллельные этапы → размещение в отдельных рядах с визуальным смещением
- Дата окончания раньше начала → валидация и предупреждение пользователя
- Новые этапы в Kaiten → возможность перепривязки через UI
- Много этапов (50+) → виртуализация или пагинация таймлайна
- Этап на паузе → прогресс не обновляется автоматически, но данные синхронизируются

## Next Steps

После завершения Phase 1 (design artifacts) можно переходить к:
- `/speckit.tasks` - разбивка на конкретные задачи
- `/speckit.implement` - начало реализации
