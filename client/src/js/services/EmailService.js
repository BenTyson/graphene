/**
 * EmailService
 * Email settings, preferences, test sends, and log management.
 * Methods receive appContext (Alpine instance) and mutate it directly.
 */

import API from './api.js';

const DEFAULT_PREFS = {
  weeklyDigest: true,
  dueTomorrow: true,
  overdue3Day: true,
  overdue6Day: true,
  overdue9Day: true,
  onlyMyTasks: true,
  includeUnassigned: false,
  timezone: 'America/Los_Angeles',
};

// Americas-focused timezone list drawn from Intl.supportedValuesOf
const TZ_LIST = (() => {
  try {
    return Intl.supportedValuesOf('timeZone').filter(
      (tz) => tz.startsWith('America/') || tz.startsWith('US/') || tz.startsWith('Canada/')
        || tz === 'UTC' || tz === 'Europe/London' || tz === 'Europe/Berlin'
        || tz === 'Europe/Paris' || tz === 'Asia/Tokyo' || tz === 'Asia/Singapore'
        || tz === 'Australia/Sydney'
    );
  } catch {
    return [
      'America/Los_Angeles', 'America/Denver', 'America/Chicago', 'America/New_York',
      'America/Anchorage', 'Pacific/Honolulu', 'America/Vancouver', 'America/Toronto',
      'UTC',
    ];
  }
})();

class EmailService {

  // ── Settings (super-admin) ──────────────────────────────────────────────────

  async loadEmailSettings(ctx) {
    ctx.emailSettingsLoading = true;
    try {
      const res = await API.email.getSettings();
      ctx.emailSettings = res.data.settings;
      ctx.emailSparrowConfigured = res.data.sparrowConfigured;
      ctx.emailSettingsForm = {
        weeklyDigestEnabled: res.data.settings.weeklyDigestEnabled,
        dueTomorrowEnabled: res.data.settings.dueTomorrowEnabled,
        overdueAlertsEnabled: res.data.settings.overdueAlertsEnabled,
        fromAddress: res.data.settings.fromAddress || '',
        replyTo: res.data.settings.replyTo || '',
        testRecipient: res.data.settings.testRecipient || '',
        templateIdWeekly: res.data.settings.templateIdWeekly || '',
        templateIdDueTomorrow: res.data.settings.templateIdDueTomorrow || '',
        templateIdOverdue: res.data.settings.templateIdOverdue || '',
      };
    } catch (err) {
      console.error('[EmailService] loadEmailSettings:', err);
    } finally {
      ctx.emailSettingsLoading = false;
    }
  }

  async saveEmailSettings(ctx) {
    ctx.emailSettingsSaving = true;
    ctx.emailSettingsSuccess = false;
    try {
      const data = { ...ctx.emailSettingsForm };
      // Coerce template IDs to integers if set
      ['templateIdWeekly', 'templateIdDueTomorrow', 'templateIdOverdue'].forEach((k) => {
        if (data[k] !== '' && data[k] !== null && data[k] !== undefined) {
          data[k] = parseInt(data[k], 10) || null;
        } else {
          data[k] = null;
        }
      });
      const res = await API.email.updateSettings(data);
      ctx.emailSettings = res.data.settings;
      ctx.emailSettingsSuccess = true;
      setTimeout(() => { ctx.emailSettingsSuccess = false; }, 3000);
    } catch (err) {
      console.error('[EmailService] saveEmailSettings:', err);
      alert('Failed to save settings: ' + err.message);
    } finally {
      ctx.emailSettingsSaving = false;
    }
  }

  // ── Test send ───────────────────────────────────────────────────────────────

  async sendTestEmail(ctx) {
    ctx.emailTestSending = true;
    try {
      const form = ctx.emailTestForm;
      const body = { to: form.to || undefined, kind: form.kind };
      if (form.kind === 'transactional') {
        body.templateId = parseInt(form.templateId, 10) || undefined;
        try { body.data = JSON.parse(form.data || '{}'); } catch { body.data = {}; }
      } else {
        body.subject = form.subject;
        body.html = form.html;
      }
      const res = await API.email.sendTest(body);
      ctx.emailTestResults = [
        { at: new Date().toISOString(), success: res.success, result: res.result },
        ...(ctx.emailTestResults || []),
      ].slice(0, 5);
    } catch (err) {
      console.error('[EmailService] sendTestEmail:', err);
      ctx.emailTestResults = [
        { at: new Date().toISOString(), success: false, result: { error: err.message } },
        ...(ctx.emailTestResults || []),
      ].slice(0, 5);
    } finally {
      ctx.emailTestSending = false;
    }
  }

  // ── Logs ────────────────────────────────────────────────────────────────────

  async loadEmailLogs(ctx) {
    ctx.emailLogsLoading = true;
    try {
      const { type, status, userId } = ctx.emailLogsFilter || {};
      const res = await API.email.getLogs({ type: type || undefined, status: status || undefined, userId: userId || undefined, limit: 100 });
      ctx.emailLogs = res.data.logs;
    } catch (err) {
      console.error('[EmailService] loadEmailLogs:', err);
      ctx.emailLogs = [];
    } finally {
      ctx.emailLogsLoading = false;
    }
  }

  async subscribeUser(_ctx, userId) {
    try {
      await API.email.subscribeUser(userId);
      alert('User subscribed to Listmonk successfully.');
    } catch (err) {
      console.error('[EmailService] subscribeUser:', err);
      alert('Subscribe failed: ' + err.message);
    }
  }

  // ── Preferences (per-user) ──────────────────────────────────────────────────

  async loadEmailPreferences(ctx) {
    ctx.emailPrefsLoading = true;
    try {
      const res = await API.email.getPreferences();
      const prefs = { ...DEFAULT_PREFS, ...res.data.preferences };
      ctx.emailPrefs = prefs;
      ctx.emailPrefsForm = {
        weeklyDigest: prefs.weeklyDigest,
        dueTomorrow: prefs.dueTomorrow,
        overdue3Day: prefs.overdue3Day,
        overdue6Day: prefs.overdue6Day,
        overdue9Day: prefs.overdue9Day,
        onlyMyTasks: prefs.onlyMyTasks,
        includeUnassigned: prefs.includeUnassigned,
        timezone: prefs.timezone || 'America/Los_Angeles',
        unsubscribedAt: prefs.unsubscribedAt || null,
      };
    } catch (err) {
      console.error('[EmailService] loadEmailPreferences:', err);
    } finally {
      ctx.emailPrefsLoading = false;
    }
  }

  async saveEmailPreferences(ctx) {
    ctx.emailPrefsSaving = true;
    ctx.emailPrefsSuccess = false;
    try {
      const body = { ...ctx.emailPrefsForm };
      delete body.unsubscribedAt; // managed via pause/resume, not the form
      const res = await API.email.updatePreferences(body);
      ctx.emailPrefs = res.data.preferences;
      ctx.emailPrefsSuccess = true;
      setTimeout(() => { ctx.emailPrefsSuccess = false; }, 3000);
    } catch (err) {
      console.error('[EmailService] saveEmailPreferences:', err);
      alert('Failed to save preferences: ' + err.message);
    } finally {
      ctx.emailPrefsSaving = false;
    }
  }

  async pauseEmails(ctx) {
    try {
      const res = await API.email.updatePreferences({ unsubscribedAt: new Date().toISOString() });
      ctx.emailPrefs = res.data.preferences;
      if (ctx.emailPrefsForm) ctx.emailPrefsForm.unsubscribedAt = res.data.preferences.unsubscribedAt;
    } catch (err) {
      console.error('[EmailService] pauseEmails:', err);
      alert('Failed to pause emails: ' + err.message);
    }
  }

  async resumeEmails(ctx) {
    try {
      const res = await API.email.updatePreferences({ unsubscribedAt: null });
      ctx.emailPrefs = res.data.preferences;
      if (ctx.emailPrefsForm) ctx.emailPrefsForm.unsubscribedAt = null;
    } catch (err) {
      console.error('[EmailService] resumeEmails:', err);
      alert('Failed to resume emails: ' + err.message);
    }
  }

  openEmailPrefs(ctx) {
    ctx.showEmailPrefs = true;
    this.loadEmailPreferences(ctx);
  }

  closeEmailPrefs(ctx) {
    ctx.showEmailPrefs = false;
    ctx.emailPrefsSuccess = false;
  }

  getTimezoneList() {
    return TZ_LIST;
  }
}

export default new EmailService();
