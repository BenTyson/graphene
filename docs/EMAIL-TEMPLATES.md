# Email Templates

Sparrow → Listmonk → Postmark sends three transactional emails. The HTML
source-of-truth lives in [`shared/emailTemplates.js`](../shared/emailTemplates.js)
so the bodies are diffable in git, but the running templates live in **Listmonk
admin** and are referenced by integer `template_id` from `EmailSettings`.

## The three templates

| Key            | Subject (rendered example)                       | Triggered by                                    |
| -------------- | ------------------------------------------------ | ----------------------------------------------- |
| `weeklyDigest` | `Your week ahead — Week of 2026-04-27`           | `POST /api/email/cron/weekly-digest`            |
| `dueTomorrow`  | `Due tomorrow: <title>` or `N tasks due tomorrow`| `POST /api/email/cron/due-tomorrow`             |
| `overdue`      | `Overdue 3 days: <title>` or `N tasks overdue 3 days` | `POST /api/email/cron/overdue-alerts`      |

Cron endpoints require the `EMAIL_CRON_SECRET` header (see
`server/middleware/cronAuth.js`).

## Pasting into Listmonk admin

1. Listmonk admin → **Campaigns** → **Templates** → **+ New**
2. **Type: Transactional** (not Campaign, not Visual). This cannot be changed
   later via the admin UI — if you pick wrong, create a new one.
3. **Name**: use the `name` field from `emailTemplates.js` (e.g.
   `graphene-weekly-digest`).
4. **Subject**: paste the `subject` string. Variables like
   `{{ if eq .Tx.Data.count 1 }}…{{ end }}` are valid here.
5. **Body**: paste the `html` string verbatim. Do **not** wrap it with
   `{{ template "content" . }}` — that's campaign-template syntax and will
   error on tx sends.
6. Save. The URL bar shows `/admin/campaigns/templates/<id>` — note the integer.

## Wiring the IDs

Once all three templates exist, PUT the IDs to email settings (super-admin
auth):

```bash
curl -X PUT https://admin.hgraphene.com/api/email/settings \
  -H "Authorization: Bearer <jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "templateIdWeekly": 12,
    "templateIdDueTomorrow": 13,
    "templateIdOverdue": 14
  }'
```

The cron endpoints will 400 with `templateIdX not set` until this is done.

## Local preview

Render a template with real data from your local DB:

```bash
node scripts/preview-email.mjs --type weekly --user <userId> > /tmp/preview.html
open /tmp/preview.html
```

Or with a fixture (no DB needed) — useful for iterating on layout before
seeding test tasks:

```bash
node scripts/preview-email.mjs --type weekly --mock > /tmp/preview.html
node scripts/preview-email.mjs --type due-tomorrow --mock > /tmp/preview.html
node scripts/preview-email.mjs --type overdue --mock > /tmp/preview.html
```

The script implements a minimal subset of Go-template syntax (the same subset
the templates use): `{{ .path }}`, `{{ if … }}/{{ else }}/{{ end }}`,
`{{ range … }}/{{ end }}`, `{{ eq A B }}`, `{{ . }}` / `{{ .field }}` inside
ranges. If a template ever needs more than this, extend
`scripts/preview-email.mjs` rather than adding a real Go template engine.

## cron-job.org wiring

Create three jobs at [cron-job.org](https://cron-job.org) after staging is verified. Do **not** use
`migrate dev` or any schema changes — just add the three entries below.

### Job specs (copy-paste ready)

| Job | URL | Schedule | Timezone |
|-----|-----|----------|----------|
| Weekly digest | `POST https://admin.hgraphene.com/api/email/cron/weekly-digest` | `0 8 * * 1` (Mon 08:00) | America/Los_Angeles |
| Due tomorrow | `POST https://admin.hgraphene.com/api/email/cron/due-tomorrow` | `0 16 * * *` (Daily 16:00) | America/Los_Angeles |
| Overdue alerts | `POST https://admin.hgraphene.com/api/email/cron/overdue-alerts` | `0 9 * * *` (Daily 09:00) | America/Los_Angeles |

### Required header (all three jobs)

```
Authorization: Bearer <EMAIL_CRON_SECRET>
```

The value of `EMAIL_CRON_SECRET` lives in your Railway environment variables.
Copy it from the Railway dashboard → your service → Variables.

### cron-job.org settings per job

1. **URL**: as shown above (production URL)
2. **Request method**: `POST`
3. **Headers**: add `Authorization` → `Bearer <secret>`
4. **Body**: leave empty (no body required)
5. **Schedule**: use the cron expression above; set timezone to `America/Los_Angeles`
6. **Notifications**: enable "on failure" so you're alerted if the secret expires

### Staging equivalent

For the staging environment replace `admin.hgraphene.com` with your Railway
staging URL. The `EMAIL_CRON_SECRET` may differ between environments — check
Railway staging variables separately.

### Verification after wiring

```bash
# Fire manually to confirm the secret and URL work
curl -X POST https://admin.hgraphene.com/api/email/cron/weekly-digest \
  -H "Authorization: Bearer $EMAIL_CRON_SECRET"
# Expected: {"success":true,"sent":N,"skipped":M,"failed":0,"errors":[]}
```

The Email admin tab (super-admin only) shows `lastWeeklyRunAt`,
`lastDueTomorrowRunAt`, and `lastOverdueRunAt` timestamps so you can
confirm each job fired without checking logs.

---

## Testing the full send path

After IDs are wired, fire each cron endpoint against staging with the
`EMAIL_CRON_SECRET`:

```bash
curl -X POST https://<staging-host>/api/email/cron/weekly-digest \
  -H "x-cron-secret: $EMAIL_CRON_SECRET"
```

Response shape: `{ success, sent, skipped, failed, errors[] }`. Check
**Postmark Activity** dashboard for the actual delivery within ~30s. The
inbox is the final source of truth for layout (Gmail/Outlook strip aggressive
CSS).

## Iterating on a template

Edit the body in Listmonk admin → Save. Changes apply to the next send
immediately. Once the layout is right, copy the final HTML back into
`shared/emailTemplates.js` and commit so the source-of-truth stays in sync.

## Variables available

Every template can read:

- `{{ .Subscriber.Email }}` — the `to` address (Sparrow passes
  `subscriber_email`)
- `{{ .Subscriber.Name }}` — often empty; we don't push to Listmonk's
  subscriber name field
- `{{ .Tx.Data.<key> }}` — anything under `payload.data` from
  `server/services/emailDigest.js`. Keys per template are documented at the
  top of each block in `shared/emailTemplates.js`.

A `.Tx.Data.<key>` reference for a missing key renders as `<no value>` in
Listmonk's preview (and in this repo's preview script). Guard
optional fields with `{{ if .Tx.Data.x }}…{{ end }}`.
