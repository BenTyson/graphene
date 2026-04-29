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
