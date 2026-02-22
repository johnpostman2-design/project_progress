# Kaiten External Webhooks

При изменении статуса задачи (карточки) на доске Kaiten приложение получает обновления и автоматически пересинхронизирует задачи проекта.

## Как это устроено

1. **Kaiten** при событии (изменение карточки, смена статуса и т.п.) отправляет POST на ваш **URL вебхука**.
2. **Supabase Edge Function** `kaiten-webhook` принимает запрос и записывает событие в таблицу `kaiten_webhook_events` (поля: `board_id`, `event_type`, `payload`).
3. **Фронтенд** подписан на эту таблицу через **Supabase Realtime**. При новой записи находит проект по `kaiten_board_id` и запускает синхронизацию задач с Kaiten.

## Шаг 1: Таблица и Realtime в Supabase

В **SQL Editor** Supabase выполните скрипт из `frontend/supabase-schema.sql` (блок с `kaiten_webhook_events`). Затем включите Realtime для таблицы:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE kaiten_webhook_events;
```

(Если таблица уже в публикации, команда вернёт ошибку — это нормально.)

## Шаг 2: Деплой Edge Function

1. Установите [Supabase CLI](https://supabase.com/docs/guides/cli).
2. В корне проекта: `supabase link --project-ref <ваш-project-ref>` (ref смотрите в URL дашборда Supabase).
3. Задеплойте функцию:
   ```bash
   supabase functions deploy kaiten-webhook
   ```
4. URL вебхука будет: `https://<project-ref>.supabase.co/functions/v1/kaiten-webhook`

Опционально задайте секрет для проверки запросов (рекомендуется в проде):

```bash
supabase secrets set KAITEN_WEBHOOK_SECRET=ваш_секретный_ключ
```

Тогда в настройках вебхука в Kaiten добавьте заголовок: `X-Webhook-Secret: ваш_секретный_ключ`.

## Шаг 3: Настройка вебхука в Kaiten

В Kaiten нужно указать URL, на который Kaiten будет отправлять события:

- **URL**: `https://<project-ref>.supabase.co/functions/v1/kaiten-webhook`
- Если задали `KAITEN_WEBHOOK_SECRET` — в настройках вебхука добавьте заголовок `X-Webhook-Secret` с тем же значением.

Где именно в Kaiten создаётся вебхук, зависит от вашей версии и типа доски (настройки доски / пространства / интеграции). Документация: [developers.kaiten.ru](https://developers.kaiten.ru), раздел «API и вебхуки».

Если в вашей версии Kaiten нет UI для вебхуков, можно попробовать зарегистрировать его через API (если endpoint поддерживается) — приложение при необходимости вызовет `registerWebhook` при привязке доски.

## Формат тела запроса от Kaiten

Edge Function принимает JSON и извлекает `board_id` из тела. Поддерживаются варианты:

- `board_id` в корне (строка или число)
- `data.board_id`
- `card.board_id` при наличии объекта `card`

Тип события берётся из полей `event`, `event_type` или `type`; по умолчанию — `card.updated`.

## Проверка

1. После настройки измените статус задачи на доске проекта в Kaiten.
2. В приложении список задач по этому проекту должен обновиться без ручного нажатия «Обновить из Kaiten» (при открытой вкладке и подписке Realtime).

В режиме разработки в консоли браузера будут сообщения: `[useKaitenWebhook] Event received: <board_id>` и при подписке — `[useKaitenWebhook] Subscribed to kaiten_webhook_events`.
