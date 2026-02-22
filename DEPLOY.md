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
3. **Root Directory:** в настройках сборки (при создании или в **Settings** → **Build and Deployment**) укажите `frontend`. Build Command и Output Directory подставятся из `frontend/vercel.json` (`npm run build`, `dist`).
4. **Environment Variables** добавьте:
   - `VITE_SUPABASE_URL` — URL проекта Supabase
   - `VITE_SUPABASE_ANON_KEY` — anon key из Supabase
5. **Deploy**. Дальше каждый `git push` в ветку по умолчанию будет запускать новый деплой.

После деплоя Vercel даст ссылку вида `https://project-progress-xxx.vercel.app`. Домен можно сменить в настройках проекта.

**Если сайт не открывается (404 NOT_FOUND или белый экран):**
1. **Root Directory:** в Vercel → проект → **Settings** → раздел **Build and Deployment** (или **Git**) — найдите **Root Directory**, укажите **`frontend`**. Тогда Vercel будет использовать `frontend/vercel.json`: сборка `npm run build`, выход в `dist`, rewrites для SPA. Сохраните и сделайте **Redeploy**.
2. Проверьте **Deployments** → последний деплой: статус должен быть **Ready** (Build успешен). Если Build с ошибкой — откройте лог и исправьте ошибку.
3. **Environment Variables:** в Settings → Environment Variables добавьте `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY`. После изменений — **Redeploy**.

**Если на проде ошибка «Не удалось выполнить запрос к … kaiten.ru» (CORS):**
- Убедитесь, что проект в Vercel подключён к **этому** репозиторию и ветке **main** (Settings → Git).
- **Root Directory** должен быть **`frontend`** — тогда деплоится и `frontend/api/kaiten` (прокси для Kaiten).
- После деплоя откройте сайт с **жёстким обновлением** (Ctrl+Shift+R) или в режиме инкогнито, чтобы подтянулся новый index.html.
- Проверьте в DevTools (Network): запросы к Kaiten должны идти на ваш домен `/api/kaiten/...`, а не на `kaiten.ru`.

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
