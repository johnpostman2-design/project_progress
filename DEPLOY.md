# Деплой в веб с автозапуском из GitHub

Проект — SPA (Vite + React), бэкенд — Supabase. Достаточно залить фронтенд на хостинг и подключить репозиторий GitHub: каждый пуш в выбранную ветку будет автоматически собирать и выкатывать сайт.

## 1. Репозиторий на GitHub

1. Зайдите на [github.com](https://github.com) и создайте новый репозиторий (например `project-progress`).
2. В корне проекта выполните (подставьте свой URL репозитория):

```bash
git remote add origin https://github.com/ВАШ_ЛОГИН/project-progress.git
git branch -M main
git add .
git commit -m "Initial commit"
git push -u origin main
```

Дальше все обновления: `git add .` → `git commit -m "..."` → `git push` — и хостинг сам пересоберёт и задеплоит проект.

---

## 2. Хостинг с автодеплоем из GitHub

### Вариант A: Vercel (рекомендуется)

1. Зайдите на [vercel.com](https://vercel.com), войдите через GitHub.
2. **Add New** → **Project** → выберите репозиторий `project-progress`.
3. **Root Directory:** нажмите **Edit** и укажите `frontend` (так Vercel будет собирать именно фронтенд). Build Command и Output Directory подставятся автоматически (`npm run build`, `dist`).
4. **Environment Variables** добавьте:
   - `VITE_SUPABASE_URL` — URL проекта Supabase
   - `VITE_SUPABASE_ANON_KEY` — anon key из Supabase
5. **Deploy**. Дальше каждый `git push` в ветку по умолчанию будет запускать новый деплой.

После деплоя Vercel даст ссылку вида `https://project-progress-xxx.vercel.app`. Домен можно сменить в настройках проекта.

**Если сайт не открывается (404 или белый экран):**
- **Root Directory:** в настройках проекта (Settings → General) укажите `frontend` **или** оставьте корень репозитория — в корне добавлен `vercel.json`, который сам запускает сборку из папки `frontend`.
- **Environment Variables:** в Settings → Environment Variables добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` (без них приложение упадёт с ошибкой при загрузке). После добавления нажмите **Redeploy** в Deployments.

### Вариант B: Netlify

1. Зайдите на [netlify.com](https://netlify.com), войдите через GitHub.
2. **Add new site** → **Import an existing project** → выберите репозиторий.
3. В настройках сборки (если не подхватилось из `netlify.toml`):
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
4. **Environment variables** → **Add variables**:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. **Deploy site**. Дальше каждый пуш в основную ветку будет триггерить автодеплой.

---

## 3. Переменные окружения

На хостинге обязательно задайте (в разделе Environment Variables / Env):

| Переменная | Откуда взять |
|------------|----------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon public |

Без них приложение не подключится к Supabase в проде.

---

## 4. Итог

- Код хранится в GitHub.
- Хостинг (Vercel или Netlify) подключён к репозиторию и при каждом пуше в основную ветку сам запускает сборку и деплой.
- Секреты лежат только в настройках хостинга, не в репозитории (`.env` в `.gitignore`).

Если нужен свой домен — его можно привязать в настройках проекта на Vercel или Netlify.
