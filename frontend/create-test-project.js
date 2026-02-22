// Скрипт для создания тестового проекта
// Запустить в консоли браузера на странице Dashboard

(async function createTestProject() {
  try {
    console.log('🚀 Начинаем создание тестового проекта...')
    
    // Импортируем необходимые функции
    // В консоли браузера нужно использовать глобальные объекты
    // Для этого скрипт должен быть запущен после загрузки приложения
    
    // Получаем конфигурацию Kaiten из localStorage или запрашиваем у пользователя
    let kaitenConfig = null
    try {
      const stored = localStorage.getItem('kaitenConfig')
      if (stored) {
        kaitenConfig = JSON.parse(stored)
        console.log('✅ Найдена сохраненная конфигурация Kaiten')
      }
    } catch (e) {
      console.warn('⚠️ Не удалось загрузить конфигурацию из localStorage')
    }
    
    if (!kaitenConfig) {
      const domain = prompt('Введите домен Kaiten (например: onyagency):')
      const apiKey = prompt('Введите API ключ Kaiten:')
      
      if (!domain || !apiKey) {
        console.error('❌ Не указаны domain или apiKey')
        return
      }
      
      kaitenConfig = {
        domain,
        apiKey,
        baseUrl: `/api/kaiten`
      }
      
      localStorage.setItem('kaitenConfig', JSON.stringify(kaitenConfig))
      console.log('✅ Конфигурация сохранена')
    }
    
    const boardId = 1618291
    
    console.log(`📋 Получаем группы из доски ${boardId}...`)
    
    // Получаем группы из доски
    const groupsResponse = await fetch(`/api/kaiten/boards/${boardId}/groups`, {
      headers: {
        'Authorization': `Bearer ${kaitenConfig.apiKey}`,
        'X-Kaiten-Domain': kaitenConfig.domain
      }
    })
    
    if (!groupsResponse.ok) {
      throw new Error(`Ошибка получения групп: ${groupsResponse.status} ${groupsResponse.statusText}`)
    }
    
    const groups = await groupsResponse.json()
    console.log(`✅ Получено групп: ${groups.length}`, groups)
    
    if (groups.length === 0) {
      console.error('❌ На доске нет групп (этапов)')
      return
    }
    
    // Генерируем даты для этапов (начиная с сегодня, каждый этап по 7 дней)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const dates = {}
    let currentDate = new Date(today)
    
    for (const group of groups) {
      const startDate = new Date(currentDate)
      const endDate = new Date(currentDate)
      endDate.setDate(endDate.getDate() + 7) // Каждый этап длится 7 дней
      
      dates[group.id] = {
        start: startDate,
        end: endDate
      }
      
      // Следующий этап начинается через день после окончания предыдущего
      currentDate = new Date(endDate)
      currentDate.setDate(currentDate.getDate() + 1)
      
      console.log(`📅 ${group.name}: ${startDate.toLocaleDateString('ru-RU')} - ${endDate.toLocaleDateString('ru-RU')}`)
    }
    
    // Создаем проект через API Supabase
    const projectName = `Тестовый проект ${new Date().toLocaleDateString('ru-RU')}`
    
    console.log(`📦 Создаем проект "${projectName}"...`)
    
    // Импортируем функции из приложения
    // В реальном приложении нужно использовать существующие функции
    // Для этого скрипт должен быть частью приложения или использовать window объекты
    
    console.log('📝 Данные для создания проекта:')
    console.log({
      projectName,
      boardId,
      groups: groups.map(g => ({ id: g.id, name: g.name })),
      dates: Object.entries(dates).map(([id, d]) => ({
        groupId: parseInt(id),
        start: d.start.toISOString().split('T')[0],
        end: d.end.toISOString().split('T')[0]
      }))
    })
    
    console.log('\n✅ Скрипт готов. Теперь нужно:')
    console.log('1. Открыть модальное окно создания проекта в UI')
    console.log('2. Выбрать доску 1618291')
    console.log('3. Установить даты для этапов (скопировать из консоли выше)')
    console.log('4. Нажать "Создать"')
    
    // Альтернатива: можно вызвать handleCreateProject напрямую, если он доступен
    // Но это требует доступа к React компонентам, что сложно из консоли
    
    // Сохраняем данные в localStorage для использования в UI
    const projectData = {
      projectName,
      boardId,
      groups,
      dates: Object.entries(dates).reduce((acc, [id, d]) => {
        acc[parseInt(id)] = {
          start: d.start.toISOString(),
          end: d.end.toISOString()
        }
        return acc
      }, {})
    }
    
    localStorage.setItem('testProjectData', JSON.stringify(projectData))
    console.log('\n💾 Данные сохранены в localStorage как "testProjectData"')
    console.log('Можно использовать в коде приложения для автоматического создания проекта')
    
  } catch (error) {
    console.error('❌ Ошибка:', error)
    alert(`Ошибка создания тестового проекта: ${error.message}`)
  }
})()
