# Настройка Supabase

## 1. Создание проекта Supabase

1. Перейдите на [supabase.com](https://supabase.com)
2. Создайте новый проект
3. Запишите:
   - Project URL (например: `https://xxxxx.supabase.co`)
   - Anon/Public Key (API ключ)

## 2. Настройка базы данных

1. Откройте SQL Editor в Supabase Dashboard
2. Выполните SQL из файла `supabase-schema.sql`
3. Проверьте, что таблицы созданы:
   - `projects`
   - `stages`

## 3. Настройка переменных окружения

Создайте файл `.env` в папке `frontend/`:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 4. Настройка Row Level Security (RLS)

По умолчанию схема включает RLS с политикой "Allow all". Для продакшена настройте политики безопасности:

1. Откройте Authentication > Policies в Supabase Dashboard
2. Настройте политики для таблиц `projects` и `stages`
3. Или отключите RLS для разработки (не рекомендуется для продакшена)

## 5. Проверка работы

После настройки:
1. Запустите приложение: `npm run dev`
2. Попробуйте создать проект
3. Проверьте, что данные сохраняются в Supabase Dashboard > Table Editor

## Миграция данных из Firebase

Если у вас есть данные в Firebase, создайте скрипт миграции для переноса данных в Supabase.
