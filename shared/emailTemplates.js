/**
 * Source-of-truth HTML for the three Listmonk transactional templates Sparrow
 * dispatches against. These strings are NOT loaded by the running server —
 * they live here so the bodies are diffable in git. The actual rendering
 * happens inside Listmonk after Ben pastes them into the admin UI; the
 * resulting integer template IDs go into EmailSettings.{templateIdWeekly,
 * templateIdDueTomorrow, templateIdOverdue} via PUT /api/email/settings.
 *
 * Constraints (see /Users/bentyson/sparrow/.claude/skills/sparrow/templates.md):
 *   - type=tx (transactional), NOT campaign
 *   - non-empty subject required
 *   - never include {{ template "content" . }} — that's campaign-only
 *   - inline CSS only; max-width 560px; tables for layout
 *   - avoid `{{ if eq .Tx.Data.numField N }}` — Listmonk deserializes JSON
 *     numbers as float64 and Go's `eq` rejects float64-vs-int. Use truthy
 *     checks on string fields (e.g. `{{ if .Tx.Data.title }}`) instead, with
 *     the digest pre-computing a sentinel field for the count==1 branch.
 *
 * Variables available in subject + body:
 *   {{ .Subscriber.Email }} {{ .Subscriber.Name }}
 *   {{ .Tx.Data.<key> }}    (anything in the digest payload's `data` object)
 *
 * Payload shapes are defined in server/services/emailDigest.js — keep them
 * in sync.
 */

const LOGO_URL = 'https://admin.hgraphene.com/images/HGraphene_Logo_Iso.png';

// ---- weekly-digest ---------------------------------------------------------
//
// Payload keys: user_name, week_label,
//   overdue[], overdue_count,
//   due_this_week[], due_this_week_count,
//   recently_done[], recently_done_count,
//   goal_progress[], goal_progress_count,
//   upcoming_due_soon_count, total_count.

const weeklyDigestSubject = `Your week ahead — {{ .Tx.Data.week_label }}`;

const weeklyDigestHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your week ahead</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    {{ .Tx.Data.overdue_count }} overdue · {{ .Tx.Data.due_this_week_count }} due this week · {{ .Tx.Data.recently_done_count }} done.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;border-radius:14px 14px 0 0;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <img src="${LOGO_URL}" width="120" height="39" alt="HGraphene" style="display:block;border:0;outline:none;text-decoration:none;height:39px;width:120px;" />
              </td>
              <td valign="middle" align="right" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;font-weight:600;">
                Weekly digest
              </td>
            </tr>
          </table>
          <div style="margin:20px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.15;letter-spacing:-0.01em;">Your week ahead</div>
          <div style="margin-top:6px;font-size:13px;color:#a3a3a3;">{{ .Tx.Data.week_label }}</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:28px 36px 8px;">
          <p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:#404040;">
            Hi {{ .Tx.Data.user_name }} — here's where things stand.
          </p>

          <!-- Metric strip -->
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;border-collapse:separate;border-spacing:8px 0;">
            <tr>
              <td width="33%" style="background:#fafafa;border:1px solid #ececec;border-radius:8px;padding:14px 10px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#B91C1C;line-height:1;letter-spacing:-0.02em;">{{ .Tx.Data.overdue_count }}</div>
                <div style="margin-top:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373;">Overdue</div>
              </td>
              <td width="33%" style="background:#fafafa;border:1px solid #ececec;border-radius:8px;padding:14px 10px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#0a0a0a;line-height:1;letter-spacing:-0.02em;">{{ .Tx.Data.due_this_week_count }}</div>
                <div style="margin-top:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373;">Due</div>
              </td>
              <td width="33%" style="background:#fafafa;border:1px solid #ececec;border-radius:8px;padding:14px 10px;text-align:center;">
                <div style="font-size:24px;font-weight:700;color:#15803D;line-height:1;letter-spacing:-0.02em;">{{ .Tx.Data.recently_done_count }}</div>
                <div style="margin-top:6px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#737373;">Done</div>
              </td>
            </tr>
          </table>

          {{ if .Tx.Data.overdue }}
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
            <tr><td style="border-left:3px solid #B91C1C;padding:0 0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0a0a0a;">Overdue</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
          {{ range .Tx.Data.overdue }}
            <tr><td style="padding:12px 0;border-bottom:1px solid #f1f1f1;">
              <div style="font-size:14px;font-weight:600;color:#0a0a0a;line-height:1.4;">{{ .title }}</div>
              <div style="margin-top:5px;font-size:12px;color:#737373;line-height:1.4;">
                <span style="color:#B91C1C;font-weight:700;">{{ .days_overdue }}d overdue</span><span style="color:#d4d4d4;"> · </span><span style="text-transform:uppercase;font-size:10px;letter-spacing:0.08em;font-weight:700;color:#525252;">{{ .priority }}</span>{{ if .goal }}<span style="color:#d4d4d4;"> · </span>{{ .goal.title }}{{ end }}
              </div>
            </td></tr>
          {{ end }}
          </table>
          {{ end }}

          {{ if .Tx.Data.due_this_week }}
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
            <tr><td style="border-left:3px solid #B87333;padding:0 0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0a0a0a;">Due this week</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
          {{ range .Tx.Data.due_this_week }}
            <tr><td style="padding:12px 0;border-bottom:1px solid #f1f1f1;">
              <div style="font-size:14px;font-weight:600;color:#0a0a0a;line-height:1.4;">{{ .title }}</div>
              <div style="margin-top:5px;font-size:12px;color:#737373;line-height:1.4;">
                {{ if .due_date }}<span>due {{ .due_date }}</span><span style="color:#d4d4d4;"> · </span>{{ end }}<span style="text-transform:uppercase;font-size:10px;letter-spacing:0.08em;font-weight:700;color:#525252;">{{ .priority }}</span>{{ if .goal }}<span style="color:#d4d4d4;"> · </span>{{ .goal.title }}{{ end }}
              </div>
            </td></tr>
          {{ end }}
          </table>
          {{ end }}

          {{ if .Tx.Data.recently_done }}
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
            <tr><td style="border-left:3px solid #15803D;padding:0 0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0a0a0a;">Recently completed</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
          {{ range .Tx.Data.recently_done }}
            <tr><td style="padding:10px 0;border-bottom:1px solid #f1f1f1;">
              <div style="font-size:14px;color:#525252;line-height:1.4;">
                <span style="color:#15803D;margin-right:6px;font-weight:700;">&#10003;</span>{{ .title }}
              </div>
            </td></tr>
          {{ end }}
          </table>
          {{ end }}

          {{ if .Tx.Data.goal_progress }}
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
            <tr><td style="border-left:3px solid #0a0a0a;padding:0 0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0a0a0a;">Goal progress</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
          {{ range .Tx.Data.goal_progress }}
            <tr><td style="padding:14px 0;border-bottom:1px solid #f1f1f1;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="font-size:14px;font-weight:600;color:#0a0a0a;line-height:1.4;">{{ .title }}</td>
                  <td align="right" style="font-size:12px;font-weight:700;color:#525252;white-space:nowrap;padding-left:10px;">{{ .pct }}%</td>
                </tr>
              </table>
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;border-collapse:collapse;">
                <tr><td style="background:#f1f1f1;border-radius:999px;height:6px;line-height:6px;font-size:0;">
                  <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;width:{{ .pct }}%;">
                    <tr><td style="background:#B87333;border-radius:999px;height:6px;line-height:6px;font-size:0;">&nbsp;</td></tr>
                  </table>
                </td></tr>
              </table>
              <div style="margin-top:6px;font-size:11px;color:#a3a3a3;">{{ .done }} of {{ .total }} tasks complete</div>
            </td></tr>
          {{ end }}
          </table>
          {{ end }}

          {{ if .Tx.Data.upcoming_due_soon_count }}
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
            <tr><td style="background:#fafaf7;border:1px solid #f0e8dc;border-left:3px solid #B87333;border-radius:6px;padding:12px 14px;font-size:13px;color:#525252;line-height:1.5;">
              <strong style="color:#0a0a0a;">{{ .Tx.Data.upcoming_due_soon_count }}</strong> more task(s) come due in the two weeks after this one.
            </td></tr>
          </table>
          {{ end }}

          <!-- CTA -->
          <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
            <tr><td style="background:#0a0a0a;border-radius:6px;">
              <a href="https://admin.hgraphene.com/#tasks" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:-0.005em;">Open Tasks &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#ffffff;border-radius:0 0 14px 14px;padding:20px 36px 28px;border-top:1px solid #f1f1f1;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:11px;color:#a3a3a3;line-height:1.6;">
                Sent to {{ .Subscriber.Email }}
              </td>
              <td align="right" style="font-size:11px;color:#a3a3a3;">
                <a href="https://admin.hgraphene.com/#tasks" style="color:#B87333;text-decoration:none;font-weight:600;">Manage notifications</a>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ---- due-tomorrow ----------------------------------------------------------
//
// Payload keys: user_name, tasks[], count, title (only set when count==1),
// due_date_label.

const dueTomorrowSubject = `{{ if .Tx.Data.title }}Due tomorrow: {{ .Tx.Data.title }}{{ else }}{{ .Tx.Data.count }} tasks due tomorrow{{ end }}`;

const dueTomorrowHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Due tomorrow</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    {{ .Tx.Data.count }} task(s) due {{ .Tx.Data.due_date_label }}.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <tr><td style="background:#0a0a0a;border-radius:14px 14px 0 0;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <img src="${LOGO_URL}" width="120" height="39" alt="HGraphene" style="display:block;border:0;outline:none;text-decoration:none;height:39px;width:120px;" />
              </td>
              <td valign="middle" align="right" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#a3a3a3;font-weight:600;">
                Reminder
              </td>
            </tr>
          </table>
          <div style="margin:20px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.15;letter-spacing:-0.01em;">Due tomorrow</div>
          <div style="margin-top:6px;font-size:13px;color:#a3a3a3;">{{ .Tx.Data.due_date_label }}</div>
        </td></tr>

        <tr><td style="background:#ffffff;padding:28px 36px 8px;">
          <p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:#404040;">
            Hi {{ .Tx.Data.user_name }} — {{ if .Tx.Data.title }}you have one task due tomorrow.{{ else }}you have {{ .Tx.Data.count }} tasks due tomorrow.{{ end }}
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
            <tr><td style="border-left:3px solid #B87333;padding:0 0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0a0a0a;">Tasks</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
          {{ range .Tx.Data.tasks }}
            <tr><td style="padding:14px 0;border-bottom:1px solid #f1f1f1;">
              <div style="font-size:14px;font-weight:600;color:#0a0a0a;line-height:1.4;">{{ .title }}</div>
              <div style="margin-top:6px;font-size:12px;color:#737373;line-height:1.4;">
                <span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;border-radius:4px;background:#0a0a0a;color:#ffffff;text-transform:uppercase;letter-spacing:0.08em;vertical-align:middle;">{{ .priority }}</span>{{ if .goal }}<span style="margin-left:8px;vertical-align:middle;">{{ .goal.title }}</span>{{ end }}
              </div>
            </td></tr>
          {{ end }}
          </table>

          <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
            <tr><td style="background:#0a0a0a;border-radius:6px;">
              <a href="https://admin.hgraphene.com/#tasks" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:-0.005em;">Open Tasks &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#ffffff;border-radius:0 0 14px 14px;padding:20px 36px 28px;border-top:1px solid #f1f1f1;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:11px;color:#a3a3a3;line-height:1.6;">
                Sent to {{ .Subscriber.Email }}
              </td>
              <td align="right" style="font-size:11px;color:#a3a3a3;">
                <a href="https://admin.hgraphene.com/#tasks" style="color:#B87333;text-decoration:none;font-weight:600;">Manage notifications</a>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

// ---- overdue ---------------------------------------------------------------
//
// Payload keys: user_name, days, tasks[], count, title (only set when count==1).

const overdueSubject = `{{ if .Tx.Data.title }}Overdue {{ .Tx.Data.days }} days: {{ .Tx.Data.title }}{{ else }}{{ .Tx.Data.count }} tasks overdue {{ .Tx.Data.days }} days{{ end }}`;

const overdueHtml = `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Overdue tasks</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0a0a0a;-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;color:#f4f4f5;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    {{ .Tx.Data.count }} task(s) overdue by {{ .Tx.Data.days }} days.
  </div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

        <tr><td style="background:#0a0a0a;border-radius:14px 14px 0 0;padding:28px 36px;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td valign="middle">
                <img src="${LOGO_URL}" width="120" height="39" alt="HGraphene" style="display:block;border:0;outline:none;text-decoration:none;height:39px;width:120px;" />
              </td>
              <td valign="middle" align="right" style="font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#FCA5A5;font-weight:600;">
                Alert
              </td>
            </tr>
          </table>
          <div style="margin:20px 0 0;font-size:24px;font-weight:700;color:#ffffff;line-height:1.15;letter-spacing:-0.01em;">Overdue tasks</div>
          <div style="margin-top:6px;font-size:13px;color:#a3a3a3;">{{ .Tx.Data.days }} days past due</div>
        </td></tr>

        <tr><td style="background:#FEF2F2;border-left:4px solid #DC2626;padding:14px 36px;">
          <div style="font-size:13px;font-weight:600;color:#7F1D1D;line-height:1.5;">
            {{ if .Tx.Data.title }}One task is overdue by {{ .Tx.Data.days }} days. Update or close it out.{{ else }}{{ .Tx.Data.count }} tasks are overdue by {{ .Tx.Data.days }} days. Update or close them out.{{ end }}
          </div>
        </td></tr>

        <tr><td style="background:#ffffff;padding:28px 36px 8px;">
          <p style="margin:0 0 22px;font-size:15px;line-height:1.55;color:#404040;">
            Hi {{ .Tx.Data.user_name }} — these have slipped past their due date.
          </p>

          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;">
            <tr><td style="border-left:3px solid #DC2626;padding:0 0 0 12px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.12em;color:#0a0a0a;">Overdue tasks</td></tr>
          </table>
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;border-collapse:collapse;">
          {{ range .Tx.Data.tasks }}
            <tr><td style="padding:14px 0;border-bottom:1px solid #f1f1f1;">
              <div style="font-size:14px;font-weight:600;color:#0a0a0a;line-height:1.4;">{{ .title }}</div>
              <div style="margin-top:6px;font-size:12px;color:#737373;line-height:1.4;">
                <span style="display:inline-block;padding:2px 8px;font-size:10px;font-weight:700;border-radius:4px;background:#DC2626;color:#ffffff;text-transform:uppercase;letter-spacing:0.08em;vertical-align:middle;">{{ .priority }}</span>{{ if .due_date }}<span style="margin-left:8px;vertical-align:middle;">due {{ .due_date }}</span>{{ end }}{{ if .goal }}<span style="margin-left:8px;vertical-align:middle;color:#a3a3a3;">·</span><span style="margin-left:8px;vertical-align:middle;">{{ .goal.title }}</span>{{ end }}
              </div>
            </td></tr>
          {{ end }}
          </table>

          <table cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
            <tr><td style="background:#0a0a0a;border-radius:6px;">
              <a href="https://admin.hgraphene.com/#tasks" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;letter-spacing:-0.005em;">Open Tasks &rarr;</a>
            </td></tr>
          </table>
        </td></tr>

        <tr><td style="background:#ffffff;border-radius:0 0 14px 14px;padding:20px 36px 28px;border-top:1px solid #f1f1f1;">
          <table width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="font-size:11px;color:#a3a3a3;line-height:1.6;">
                Sent to {{ .Subscriber.Email }}
              </td>
              <td align="right" style="font-size:11px;color:#a3a3a3;">
                <a href="https://admin.hgraphene.com/#tasks" style="color:#B87333;text-decoration:none;font-weight:600;">Manage notifications</a>
              </td>
            </tr>
          </table>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

export const emailTemplates = {
  weeklyDigest: { name: 'graphene-weekly-digest', subject: weeklyDigestSubject, html: weeklyDigestHtml },
  dueTomorrow: { name: 'graphene-due-tomorrow', subject: dueTomorrowSubject, html: dueTomorrowHtml },
  overdue: { name: 'graphene-overdue', subject: overdueSubject, html: overdueHtml },
};

export default emailTemplates;
