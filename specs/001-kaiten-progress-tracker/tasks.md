# Tasks: Отслеживание прогресса проектов из Kaiten

**Input**: Документы дизайна из `/specs/001-kaiten-progress-tracker/`
**Prerequisites**: plan.md (обязателен), spec.md (обязателен для user stories), research.md, data-model.md, contracts/

**Tests**: Тесты ОПЦИОНАЛЬНЫ - не запрошены явно в спецификации, поэтому задачи на тесты не включены.

**Organization**: Задачи сгруппированы по user story для независимой реализации и тестирования каждой истории.

## Формат: `[ID] [P?] [Story] Описание`

- **[P]**: Можно выполнять параллельно (разные файлы, нет зависимостей)
- **[Story]**: К какой user story относится задача (например, US1, US2, US3)
- Включать точные пути к файлам в описаниях

## Соглашения о путях

- **Web app**: `frontend/src/` (на основе структуры plan.md)

---

## Phase 1: Setup (Общая инфраструктура)

**Цель**: Инициализация проекта и базовая структура

- [x] T001 Создать структуру проекта согласно implementation plan в frontend/
- [x] T002 Инициализировать React + TypeScript проект с Vite в frontend/
- [x] T003 [P] Настроить ESLint и Prettier в frontend/
- [x] T004 [P] Настроить TypeScript strict mode в frontend/tsconfig.json
- [x] T005 [P] Инициализировать конфигурацию Supabase проекта в frontend/src/services/supabase/supabaseConfig.ts
- [x] T006 [P] Настроить React Router в frontend/src/App.tsx

---

## Phase 2: Foundational - Базовая модель данных (Блокирующие предварительные требования)

**Цель**: Основные модели данных и логика расчёта прогресса, которые ДОЛЖНЫ быть завершены перед реализацией ЛЮБОЙ user story

**⚠️ КРИТИЧНО**: Работа над user stories не может начаться до завершения этой фазы

### Project Model

- [x] T007 [US1] Определить interface модели Project в frontend/src/models/project.ts с полями: id, name, startDate, endDate, status, kaitenBoardId, createdAt, updatedAt
- [x] T008 [US1] Реализовать тип Project с enum ProjectStatus ('active' | 'completed' | 'archived') в frontend/src/models/project.ts
- [x] T009 [US1] Добавить правила валидации Project (name: непустая строка максимум 200 символов, endDate >= startDate) в frontend/src/models/project.ts
- [x] T010 [US1] Создать функции переходов состояний Project (active → completed, active → archived) в frontend/src/models/project.ts

### Stage Model

- [x] T011 [US1] Определить interface модели Stage в frontend/src/models/stage.ts с полями: id, projectId, name, startDate, endDate, status, pauseReason, kaitenGroupId, createdAt, updatedAt
- [x] T012 [US1] Реализовать тип Stage с enum StageStatus ('active' | 'paused' | 'completed') в frontend/src/models/stage.ts
- [x] T013 [US1] Добавить правила валидации Stage (name: непустая строка максимум 200 символов, endDate >= startDate, pauseReason обязателен если paused) в frontend/src/models/stage.ts
- [x] T014 [US1] Создать функции переходов состояний Stage (active → paused, paused → active, active → completed, paused → completed) в frontend/src/models/stage.ts

### Task Model

- [x] T015 [US1] Определить interface модели Task в frontend/src/models/task.ts с полями из Kaiten API: id, title, status, group_id, board_id, created_at, updated_at
- [x] T016 [US1] Добавить interface вычисляемых полей Task (isCompleted: boolean, stageId?: string) в frontend/src/models/task.ts
- [x] T017 [US1] Создать маппинг типа Task из ответа Kaiten API в frontend/src/models/task.ts

### Progress Calculation Logic

- [x] T018 [US1] Реализовать функцию расчёта прогресса в frontend/src/utils/progressCalculator.ts: calculateStageProgress(stage: Stage, tasks: Task[]): number
- [x] T019 [US1] Добавить логику подсчёта выполненных задач (status.is_closed === true) в frontend/src/utils/progressCalculator.ts
- [x] T020 [US1] Добавить логику подсчёта общего количества задач для этапа в frontend/src/utils/progressCalculator.ts
- [x] T021 [US1] Реализовать формулу: progress = (completedTasksCount / totalTasksCount) * 100 в frontend/src/utils/progressCalculator.ts
- [x] T022 [US1] Обработать граничные случаи: нет задач (progress = 0), все задачи выполнены (progress = 100), задачи без статуса (считать как невыполненные) в frontend/src/utils/progressCalculator.ts

**Checkpoint**: Основа готова - модели Project, Stage, Task и логика расчёта прогресса завершены. Реализация user stories может начаться.

---

## Phase 3: User Story 1 - Просмотр прогресса проектов по этапам (Priority: P1) 🎯 MVP

**Цель**: Пользователь видит список проектов с прогресс-барами по этапам, может просмотреть детали этапа. Прогресс рассчитывается на основе статусов задач из Kaiten.

**Independent Test**: Создать тестовый проект с этапами и задачами вручную (без интеграции с Kaiten) и проверить отображение прогресса. Пользователь видит состояние своих проектов.

### Implementation for User Story 1

- [x] T023 [US1] Создать Supabase service для проектов: getProjects() в frontend/src/services/supabase/supabaseService.ts
- [x] T024 [US1] Создать Supabase service для этапов: getStages(projectId: string) в frontend/src/services/supabase/supabaseService.ts
- [x] T025 [US1] Реализовать hook useProjects для загрузки проектов в frontend/src/hooks/useProjects.ts
- [x] T026 [US1] Реализовать hook useStages для загрузки этапов в frontend/src/hooks/useStages.ts
- [x] T027 [US1] Создать component ProjectList для отображения списка проектов в frontend/src/components/projects/ProjectList.tsx
  [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=275-1500&t=afReocuhmzFx7Ew8-4]
- [x] T028 [US1] Создать component ProjectCard с визуализацией progress bar в frontend/src/components/projects/ProjectCard.tsx
  [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=248-2466&t=afReocuhmzFx7Ew8-4]
- [x] T029 [US1] Создать component ProgressBar для отображения процента выполнения этапа в frontend/src/components/timeline/ProgressBar.tsx
  [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=284-2224&t=afReocuhmzFx7Ew8-11]
- [x] T030 [US1] Создать component Timeline для горизонтальной визуализации этапов в frontend/src/components/timeline/Timeline.tsx
  [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=248-2430&t=afReocuhmzFx7Ew8-11]
- [x] T031 [US1] Создать component TimelineRow для layout параллельных этапов в frontend/src/components/timeline/TimelineRow.tsx
 [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=248-2430&t=afReocuhmzFx7Ew8-11]
- [x] T032 [US1] Реализовать algorithm layout таймлайна для параллельных этапов в frontend/src/utils/timelineLayout.ts
- [x] T033 [US1] Создать component StageCell с hover tooltip показывающим даты в frontend/src/components/timeline/StageCell.tsx
 [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=284-2224&t=afReocuhmzFx7Ew8-11]
- [x] T034 [US1] Создать component StageDetails показывающий название этапа, количество задач, статусы задач, даты в frontend/src/components/stages/StageDetails.tsx
 [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-1918&t=afReocuhmzFx7Ew8-11]
- [x] T035 [US1] Реализовать page Dashboard со списком проектов в frontend/src/pages/Dashboard.tsx
 [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=230-140&t=afReocuhmzFx7Ew8-11]
- [x] T036 [US1] Подключить расчёт прогресса к визуализации StageCell в frontend/src/components/timeline/StageCell.tsx

**Checkpoint**: На этом этапе User Story 1 должна быть полностью функциональна и независимо тестируема. Пользователь может просматривать проекты с progress bars и деталями этапов.

---

## Phase 4: User Story 2 - Создание проектов и привязка к Kaiten API (Priority: P2)

**Цель**: Пользователь создаёт новый проект и привязывает к нему этапы и задачи из Kaiten через API. Система синхронизирует данные.

**Independent Test**: Создать проект и привязать его к тестовым данным Kaiten API (или моковым данным). Проверить, что этапы и задачи отображаются корректно.

### Implementation for User Story 2

- [x] T037 [US2] Создать типы Kaiten API на основе contracts в frontend/src/services/kaiten/kaitenTypes.ts
- [x] T038 [US2] Реализовать Kaiten API client: getBoards() в frontend/src/services/kaiten/kaitenApi.ts
- [x] T039 [US2] Реализовать Kaiten API client: getBoardGroups(boardId: number) в frontend/src/services/kaiten/kaitenApi.ts
- [x] T040 [US2] Реализовать Kaiten API client: getCardsByGroup(groupId: number, boardId: number) в frontend/src/services/kaiten/kaitenApi.ts
- [x] T041 [US2] Добавить error handling и retry logic для вызовов Kaiten API в frontend/src/services/kaiten/kaitenApi.ts
- [x] T042 [US2] Создать component KaitenBoardSelector для выбора доски в frontend/src/components/kaiten/KaitenBoardSelector.tsx
- [x] T043 [US2] Создать component KaitenStagePreview показывающий preview групп в frontend/src/components/kaiten/KaitenStagePreview.tsx
- [x] T044 [US2] Создать component KaitenImportModal с выбором доски, preview этапов, inputs для дат в frontend/src/components/kaiten/KaitenImportModal.tsx
- [x] T045 [US2] Реализовать Supabase service: createProject() в frontend/src/services/supabase/supabaseService.ts
- [x] T046 [US2] Реализовать Supabase service: createStage() в frontend/src/services/supabase/supabaseService.ts
- [x] T047 [US2] Реализовать sync service: syncProjectTasks(project: Project) в frontend/src/services/sync/syncService.ts
- [x] T048 [US2] Создать hook useKaitenSync для синхронизации задач из Kaiten в frontend/src/hooks/useKaitenSync.ts
- [x] T049 [US2] Реализовать flow создания проекта с привязкой к Kaiten в frontend/src/pages/Dashboard.tsx
 [Figma: макет пустого дашборда https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=230-140&t=afReocuhmzFx7Ew8-11. Макет с формой создания проекта https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=246-830&t=afReocuhmzFx7Ew8-11. Макет с привязанными этапами https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=247-1357&t=afReocuhmzFx7Ew8-11]
- [x] T050 [US2] Создать component StageTaskList для отображения задач из Kaiten в frontend/src/components/stages/StageTaskList.tsx
 [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-1918&t=afReocuhmzFx7Ew8-11]

**Checkpoint**: На этом этапе User Stories 1 И 2 должны работать независимо. Пользователь может создавать проекты и привязывать их к Kaiten.

---

## Phase 5: User Story 3 - Управление проектами и этапами (Priority: P3)

**Цель**: Пользователь управляет проектами и этапами: переименовывает, удаляет, завершает, устанавливает даты, перепривязывает этапы.

**Independent Test**: Создать проект с этапами и проверить все операции управления (переименование, удаление, завершение, установка дат).

### Implementation for User Story 3

- [x] T051 [US3] Реализовать Supabase service: updateProject() в frontend/src/services/supabase/supabaseService.ts
- [x] T052 [US3] Реализовать Supabase service: deleteProject() в frontend/src/services/supabase/supabaseService.ts
- [x] T053 [US3] Реализовать Supabase service: updateStage() в frontend/src/services/supabase/supabaseService.ts
- [x] T054 [US3] Реализовать Supabase service: deleteStage() в frontend/src/services/supabase/supabaseService.ts
- [x] T055 [US3] Создать component DatePicker для выбора даты в frontend/src/components/common/DatePicker.tsx
- [x] T056 [US3] Создать component ConfirmDialog для подтверждения удаления в frontend/src/components/common/ConfirmDialog.tsx
      [Figma: https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-4046&t=afReocuhmzFx7Ew8-11]
- [x] T057 [US3] Создать component ProjectDetails с действиями управления проектом в frontend/src/components/projects/ProjectDetails.tsx
      [Figma: макет с дефолтным набором действий - https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=274-1255&t=afReocuhmzFx7Ew8-11 макет, если проект на паузе - https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-1891&t=afReocuhmzFx7Ew8-11]
- [x] T057a [US3] Создать component ProjectSidebar для отображения информации о проекте в правом сайдбаре в frontend/src/components/projects/ProjectSidebar.tsx
      [Figma: макет созданного проекта https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=302-7811&t=afReocuhmzFx7Ew8-11]
- [x] T057b [US3] Создать component ProjectDropdownMenu с действиями управления проектом в frontend/src/components/projects/ProjectDropdownMenu.tsx
      [Figma: макет дропдауна https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=274-1255&t=afReocuhmzFx7Ew8-11]
- [x] T058 [US3] Добавить функциональность переименования проекта в frontend/src/components/projects/ProjectDetails.tsx
      [Figma: макет дропдауна с действием Переименовать https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=274-1255&t=afReocuhmzFx7Ew8-11. Макет компонента с состоянием инпут https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=231-677&t=afReocuhmzFx7Ew8-11. У названия проекта есть ховер, клик на название откроет инпут с возможностью изменить названия. Клик за пределы инпута/клавиша enter применит изменения. Кнокпа рядом с названием с иконкой kebab открывает дропдаун с действиями управления проектом]
- [x] T059 [US3] Добавить функциональность удаления проекта с подтверждением в frontend/src/components/projects/ProjectDetails.tsx
      [Figma: макет дропдауна с действием удаления https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=274-1255&t=afReocuhmzFx7Ew8-11. Макет диалоговога окна https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-4046&t=afReocuhmzFx7Ew8-11]
- [x] T060 [US3] Добавить функциональность завершения проекта в frontend/src/components/projects/ProjectDetails.tsx
      [Figma: макет дропдауна с действием Завершить https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=274-1255&t=afReocuhmzFx7Ew8-11]
      [Figma: макет с диалоговым окном https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-4046&t=afReocuhmzFx7Ew8-11]
- [x] T061 [US3] Добавить функциональность переименования этапа в frontend/src/components/stages/StageDetails.tsx
      [Figma: макет компонента этапа https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=284-2224&t=afReocuhmzFx7Ew8-11. Клик на название этапа откроет инпут с возможностью изменить названия. Клик за пределы инпута/клавиша enter применит изменения]
- [x] T062 [US3] Добавить функциональность удаления этапа в frontend/src/components/stages/StageDetails.tsx
      [Figma: макет диалогового окна https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-4339&t=afReocuhmzFx7Ew8-11]
- [x] T063 [US3] Добавить редактирование дат для проекта (startDate, endDate) в frontend/src/components/projects/ProjectDetails.tsx
      [Figma: макет дат рядом с ячейкой этапа в таймлайне https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=218-101&t=afReocuhmzFx7Ew8-11. Макет компонента кнопок вызывающих календарь https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=218-115&t=afReocuhmzFx7Ew8-11. Макет кнопок выбора дат начала и конца проекта https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=248-2430&t=afReocuhmzFx7Ew8-11]
- [x] T064 [US3] Добавить редактирование дат для этапа (startDate, endDate) в frontend/src/components/stages/StageDetails.tsx
- [x] T065 [US3] Реализовать flow перепривязки этапов при изменении структуры Kaiten в frontend/src/components/kaiten/KaitenImportModal.tsx
- [x] T066 [US3] Добавить валидацию дат (endDate >= startDate) в frontend/src/utils/dateUtils.ts

**Checkpoint**: На этом этапе User Stories 1, 2 И 3 должны работать независимо. Пользователь может полностью управлять проектами и этапами.

---

## Phase 6: User Story 4 - Управление состоянием этапов и архивация (Priority: P4)

**Цель**: Пользователь может ставить этапы на паузу с причиной, редактировать причину, отправлять проекты в архив, просматривать архивные проекты.

**Independent Test**: Создать проект с этапами, поставить этап на паузу с причиной, отредактировать причину, отправить проект в архив. Проверить, что архивные проекты скрыты в основном списке.

### Implementation for User Story 4

- [x] T067 [US4] Создать component StagePauseModal для постановки этапа на паузу с причиной в frontend/src/components/stages/StagePauseModal.tsx
      [Figma: пример диалогового окна https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=282-1548&t=afReocuhmzFx7Ew8-11]
- [x] T068 [US4] Добавить функциональность постановки этапа на паузу с input причины в frontend/src/components/stages/StageDetails.tsx
      [Figma: макет дропдауна с дествием Пауза https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=274-774&t=afReocuhmzFx7Ew8-11. Макет ячейки этапа поставленного на паузу https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=218-101&t=afReocuhmzFx7Ew8-11]
- [x] T069 [US4] Добавить функциональность редактирования причины паузы в frontend/src/components/stages/StageDetails.tsx
      [Figma: макет далогового окна https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=282-2134&t=afReocuhmzFx7Ew8-4]
- [x] T070 [US4] Реализовать архивацию проекта (status → 'archived') в frontend/src/services/firebase/firebaseService.ts
- [x] T071 [US4] Добавить фильтр для активных проектов (исключить архивные) в frontend/src/hooks/useProjects.ts
- [x] T072 [US4] Создать page Archive для просмотра архивных проектов в frontend/src/pages/Archive.tsx
      [Figma: макет архива с проектами https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=276-2613&t=afReocuhmzFx7Ew8-11. Макет архива без проектов https://www.figma.com/design/pj5aiXE1X40rEoVbtyVQ2F/Turbo?node-id=284-3534&t=afReocuhmzFx7Ew8-11]
- [x] T073 [US4] Добавить query фильтра архива в Supabase service в frontend/src/services/supabase/supabaseService.ts
- [x] T074 [US4] Добавить navigation на page Archive в frontend/src/App.tsx

**Checkpoint**: На этом этапе все user stories должны быть независимо функциональны. Пользователь может управлять состояниями этапов и архивировать проекты.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Цель**: Улучшения, затрагивающие несколько user stories

- [x] T075 [P] Реализовать password authentication (HTTP Basic Auth или простая форма) в frontend/src/components/auth/PasswordAuth.tsx
- [x] T076 [P] Добавить защиту routes аутентификацией в frontend/src/App.tsx
- [x] T077 [P] Добавить loading states и error boundaries во все components
- [x] T078 [P] Реализовать error handling для сбоев Kaiten API с retry UI
- [x] T079 [P] Добавить date utilities для форматирования и валидации в frontend/src/utils/dateUtils.ts
- [x] T080 [P] Оптимизировать загрузку списка проектов для достижения метрики < 3 сек (SC-001): кэширование, lazy loading, оптимизация Supabase queries в frontend/src/services/supabase/supabaseService.ts
- [x] T081 [P] Оптимизировать синхронизацию с Kaiten для достижения метрики < 5 сек (SC-003): batch запросы, параллельная загрузка, прогресс-индикатор в frontend/src/services/sync/syncService.ts
- [x] T082 [P] Оптимизировать рендеринг таймлайна для 20 параллельных этапов без визуальных конфликтов (SC-006): virtualization, мемоизация layout расчётов в frontend/src/utils/timelineLayout.ts и frontend/src/components/timeline/Timeline.tsx
- [x] T083 [P] Добавить конфигурацию Supabase indexes для queries по status и date в frontend/src/services/supabase/supabaseConfig.ts
- [x] T084 [P] Реализовать автоматическую синхронизацию при focus/return приложения в frontend/src/hooks/useKaitenSync.ts
- [x] T085 [P] Добавить кнопку ручной синхронизации в Dashboard в frontend/src/pages/Dashboard.tsx
- [x] T086 [P] Добавить performance monitoring для отслеживания метрик SC-001, SC-003, SC-006 в production
- [x] T087 [P] Запустить validation scenarios из quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Нет зависимостей - можно начинать сразу
- **Foundational (Phase 2)**: Зависит от завершения Setup - БЛОКИРУЕТ все user stories
- **User Stories (Phase 3+)**: Все зависят от завершения Foundational phase
  - User stories могут затем выполняться параллельно (если есть ресурсы)
  - Или последовательно в порядке приоритета (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Зависит от завершения всех желаемых user stories

### User Story Dependencies

- **User Story 1 (P1)**: Может начаться после Foundational (Phase 2) - Нет зависимостей от других stories. Требует: модель Project, модель Stage, модель Task, расчёт прогресса
- **User Story 2 (P2)**: Может начаться после Foundational (Phase 2) - Требует: модель Project, модель Stage, модель Task. Может интегрироваться с components US1, но должна быть независимо тестируема
- **User Story 3 (P3)**: Может начаться после Foundational (Phase 2) - Требует: модель Project, модель Stage. Может интегрироваться с US1/US2, но должна быть независимо тестируема
- **User Story 4 (P4)**: Может начаться после Foundational (Phase 2) - Требует: модель Project, модель Stage. Может интегрироваться с US1/US2/US3, но должна быть независимо тестируема

### Within Each User Story

- Models перед services
- Services перед components
- Core implementation перед integration
- Story завершена перед переходом к следующему приоритету

### Parallel Opportunities

- Все Setup задачи помеченные [P] могут выполняться параллельно (T003, T004, T005)
- Foundational model задачи могут выполняться параллельно: T007-T010 (Project), T011-T014 (Stage), T015-T017 (Task), T018-T022 (Progress calculation) - разные файлы
- После завершения Foundational phase все user stories могут начаться параллельно (если позволяет команда)
- Разные user stories могут разрабатываться параллельно разными членами команды
- Polish phase задачи помеченные [P] могут выполняться параллельно

---

## Parallel Example: Foundational Phase (Phase 2)

```bash
# Запустить все определения моделей параллельно (разные файлы):
Task: "Определить interface модели Project в frontend/src/models/project.ts"
Task: "Определить interface модели Stage в frontend/src/models/stage.ts"
Task: "Определить interface модели Task в frontend/src/models/task.ts"

# Запустить все реализации валидации параллельно:
Task: "Добавить правила валидации Project в frontend/src/models/project.ts"
Task: "Добавить правила валидации Stage в frontend/src/models/stage.ts"

# Запустить реализацию расчёта прогресса:
Task: "Реализовать функцию расчёта прогресса в frontend/src/utils/progressCalculator.ts"
```

---

## Parallel Example: User Story 1

```bash
# Запустить реализации Supabase services параллельно:
Task: "Создать Supabase service для проектов: getProjects() в frontend/src/services/supabase/supabaseService.ts"
Task: "Создать Supabase service для этапов: getStages() в frontend/src/services/supabase/supabaseService.ts"

# Запустить реализации components параллельно (разные файлы):
Task: "Создать component ProjectList в frontend/src/components/projects/ProjectList.tsx"
Task: "Создать component ProjectCard в frontend/src/components/projects/ProjectCard.tsx"
Task: "Создать component ProgressBar в frontend/src/components/timeline/ProgressBar.tsx"
Task: "Создать component Timeline в frontend/src/components/timeline/Timeline.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Завершить Phase 1: Setup
2. Завершить Phase 2: Foundational - **Базовая модель данных** (КРИТИЧНО - блокирует все stories)
   - Модель Project (T007-T010)
   - Модель Stage (T011-T014)
   - Модель Task (T015-T017)
   - Расчёт прогресса (T018-T022)
3. Завершить Phase 3: User Story 1 (P1)
4. **ОСТАНОВИТЬСЯ и ПРОВЕРИТЬ**: Протестировать User Story 1 независимо
5. Deploy/demo если готово

### Incremental Delivery

1. Завершить Setup + Foundational → Основа готова (Phase 1 + Phase 2)
2. Добавить User Story 1 → Протестировать независимо → Deploy/Demo (MVP!)
3. Добавить User Story 2 → Протестировать независимо → Deploy/Demo
4. Добавить User Story 3 → Протестировать независимо → Deploy/Demo
5. Добавить User Story 4 → Протестировать независимо → Deploy/Demo
6. Добавить Polish → Финальный релиз
7. Каждая story добавляет ценность без нарушения предыдущих stories

### Parallel Team Strategy

С несколькими разработчиками:

1. Команда завершает Setup + Foundational вместе
2. После завершения Foundational:
   - Разработчик A: User Story 1 (P1)
   - Разработчик B: User Story 2 (P2)
   - Разработчик C: User Story 3 (P3)
3. Stories завершаются и интегрируются независимо

---

## Notes

- [P] задачи = разные файлы, нет зависимостей
- [Story] метка связывает задачу с конкретной user story для отслеживания
- Каждая user story должна быть независимо завершаема и тестируема
- Коммитить после каждой задачи или логической группы
- Останавливаться на любом checkpoint для независимой проверки story
- Phase 2 (Foundational) КРИТИЧНА - содержит базовую модель данных (Project, Stage, расчёт прогресса)
- Избегать: расплывчатых задач, конфликтов в одном файле, зависимостей между stories, нарушающих независимость

---

## Summary

**Всего задач**: 87
- **Phase 1 (Setup)**: 6 задач
- **Phase 2 (Foundational - Базовая модель данных)**: 16 задач (T007-T022)
  - Модель Project: 4 задачи
  - Модель Stage: 4 задачи
  - Модель Task: 3 задачи
  - Расчёт прогресса: 5 задач
- **Phase 3 (User Story 1)**: 14 задач
- **Phase 4 (User Story 2)**: 14 задач
- **Phase 5 (User Story 3)**: 16 задач
- **Phase 6 (User Story 4)**: 8 задач
- **Phase 7 (Polish)**: 13 задач (включая оптимизацию производительности)

**Возможности параллельного выполнения**: 
- Setup phase: 3 задачи могут выполняться параллельно
- Foundational phase: Несколько определений моделей могут выполняться параллельно
- User stories: Могут разрабатываться параллельно после завершения Foundational

**MVP Scope**: Phase 1 + Phase 2 + Phase 3 (User Story 1)

**Критерии независимого тестирования**:
- User Story 1: Создать тестовый проект вручную, проверить отображение прогресса
- User Story 2: Создать проект с привязкой к Kaiten, проверить синхронизацию
- User Story 3: Протестировать все операции управления независимо
- User Story 4: Протестировать функциональность паузы и архивации независимо
