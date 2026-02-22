// Утилита для создания тестового проекта
// Можно использовать в консоли браузера или в коде

import { KaitenConfig, KaitenGroup } from '../services/kaiten/kaitenTypes'
import { getBoardGroups } from '../services/kaiten/kaitenApi'
import { createProject, createStage, updateProject, getProject } from '../services/supabase/supabaseService'
import { dateToTimestamp } from '../utils/dateUtils'
import { syncProjectTasks } from '../services/sync/syncService'

export interface TestProjectOptions {
  projectName?: string
  boardId: number
  kaitenConfig: KaitenConfig
  daysPerStage?: number // Количество дней на этап
  startDate?: Date // Дата начала первого этапа
}

export async function createTestProject(options: TestProjectOptions): Promise<string> {
  const {
    projectName = `Тестовый проект ${new Date().toLocaleDateString('ru-RU')}`,
    boardId,
    kaitenConfig,
    daysPerStage = 7,
    startDate = new Date(),
  } = options

  console.log('🚀 Создание тестового проекта...', { projectName, boardId })

  // Получаем группы из доски
  console.log('📋 Получение групп из доски...')
  const groups = await getBoardGroups(boardId, kaitenConfig)
  console.log(`✅ Получено групп: ${groups.length}`)

  if (groups.length === 0) {
    throw new Error('На доске нет групп (этапов)')
  }

  // Генерируем даты для этапов. Второй этап делаем с пересечением с первым — для проверки таймлайна.
  const dates: Record<number, { start: Date; end: Date }> = {}
  const MS_PER_DAY = 24 * 60 * 60 * 1000
  let currentDate = new Date(startDate)
  currentDate.setHours(0, 0, 0, 0)
  let prevEnd: Date | null = null

  for (let i = 0; i < groups.length; i++) {
    const group = groups[i]
    let start: Date
    let end: Date

    if (i === 1 && prevEnd) {
      // Второй этап: частичное пересечение с первым (начинается за 3 дня до конца первого)
      const overlapDays = Math.min(3, daysPerStage - 1)
      start = new Date(prevEnd.getTime() - overlapDays * MS_PER_DAY)
      end = new Date(start.getTime() + daysPerStage * MS_PER_DAY)
      currentDate = new Date(end.getTime() + MS_PER_DAY)
      console.log(`📅 ${group.name} (пересечение с предыдущим): ${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`)
    } else {
      start = new Date(currentDate)
      end = new Date(currentDate.getTime() + daysPerStage * MS_PER_DAY)
      currentDate = new Date(end.getTime() + MS_PER_DAY)
      console.log(`📅 ${group.name}: ${start.toLocaleDateString('ru-RU')} - ${end.toLocaleDateString('ru-RU')}`)
    }

    prevEnd = new Date(end)
    dates[group.id] = { start, end }
  }

  // Создаем проект
  console.log('📦 Создание проекта...')
  const project = await createProject({
    name: projectName,
    kaitenBoardId: String(boardId),
    status: 'active',
  })
  console.log(`✅ Проект создан: ${project.id}`)

  // Создаем этапы
  console.log('📝 Создание этапов...')
  const stageDates: Date[] = []

  for (const group of groups) {
    const groupDates = dates[group.id]
    if (!groupDates) continue

    stageDates.push(groupDates.start, groupDates.end)

    await createStage(project.id, {
      name: group.name,
      startDate: dateToTimestamp(groupDates.start),
      endDate: dateToTimestamp(groupDates.end),
      kaitenGroupId: String(group.id),
      status: 'active',
    })
    console.log(`✅ Этап создан: ${group.name}`)
  }

  // Обновляем даты проекта
  if (stageDates.length > 0) {
    const projectStartDate = new Date(Math.min(...stageDates.map((d) => d.getTime())))
    const projectEndDate = new Date(Math.max(...stageDates.map((d) => d.getTime())))

    await updateProject(project.id, {
      startDate: dateToTimestamp(projectStartDate),
      endDate: dateToTimestamp(projectEndDate),
    })
    console.log(`✅ Даты проекта обновлены: ${projectStartDate.toLocaleDateString('ru-RU')} - ${projectEndDate.toLocaleDateString('ru-RU')}`)
  }

  // Синхронизируем задачи
  console.log('🔄 Синхронизация задач...')
  const updatedProject = await getProject(project.id)
  if (!updatedProject) throw new Error('Проект не найден после создания')
  const tasks = await syncProjectTasks(updatedProject, kaitenConfig)
  console.log(`✅ Задачи синхронизированы: ${tasks.length} задач`)

  console.log(`✅ Тестовый проект создан: ${project.id}`)
  return project.id
}

// Функция для использования в консоли браузера
export function createTestProjectFromConsole(boardId: number = 1618291) {
  // Получаем конфигурацию из localStorage
  const stored = localStorage.getItem('kaitenConfig')
  if (!stored) {
    throw new Error('Конфигурация Kaiten не найдена. Сначала подключите Kaiten в приложении.')
  }

  const kaitenConfig: KaitenConfig = JSON.parse(stored)

  return createTestProject({
    boardId,
    kaitenConfig,
  })
}

// Делаем функцию доступной в window для использования в консоли
if (typeof window !== 'undefined') {
  ;(window as any).createTestProject = createTestProjectFromConsole
  console.log('💡 Функция createTestProject(1618291) доступна в консоли')
}
