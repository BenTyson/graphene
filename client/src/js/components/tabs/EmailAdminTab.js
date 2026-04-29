/**
 * EmailAdminTab
 * Super-admin email management tab.
 * Three sections accessible via pill nav:
 *   settings — EmailSettings read/edit + Sparrow status + last-run timestamps
 *   test     — Test send form + last 5 results
 *   logs     — Paginated/filtered EmailLog table
 */

function getEmailAdminTabHtml() {
  return `
    <div x-show="activeTab === 'email-admin'" x-cloak>

      <!-- Section pill nav -->
      <div class="mb-6 flex items-center space-x-2">
        <button @click="emailAdminSection = 'settings'"
                :class="emailAdminSection === 'settings' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-1.5 text-sm font-medium rounded-full transition-colors">
          Settings
        </button>
        <button @click="emailAdminSection = 'test'"
                :class="emailAdminSection === 'test' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-1.5 text-sm font-medium rounded-full transition-colors">
          Test Send
        </button>
        <button @click="emailAdminSection = 'logs'; loadEmailLogs()"
                :class="emailAdminSection === 'logs' ? 'bg-black text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                class="px-4 py-1.5 text-sm font-medium rounded-full transition-colors">
          Logs
        </button>
      </div>

      <!-- ── SETTINGS ─────────────────────────────────────────────────────── -->
      <div x-show="emailAdminSection === 'settings'">
        <div x-show="emailSettingsLoading" class="text-sm text-gray-500 py-8 text-center">Loading…</div>
        <div x-show="!emailSettingsLoading && emailSettingsForm">

          <!-- Sparrow status banner -->
          <div class="mb-4 flex items-center space-x-2 text-sm">
            <span :class="emailSparrowConfigured ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'"
                  class="inline-flex items-center px-2.5 py-1 rounded-full font-medium text-xs">
              <span x-text="emailSparrowConfigured ? 'Sparrow configured' : 'Sparrow not configured'"></span>
            </span>
            <span x-show="emailSettings?.lastWeeklyRunAt" class="text-gray-500">
              Weekly last ran <span x-text="emailSettings?.lastWeeklyRunAt ? window.formatRelativeTime(emailSettings.lastWeeklyRunAt) : '—'"></span>
            </span>
            <span x-show="emailSettings?.lastDueTomorrowRunAt" class="text-gray-500 hidden sm:inline">
              · Due-tomorrow <span x-text="emailSettings?.lastDueTomorrowRunAt ? window.formatRelativeTime(emailSettings.lastDueTomorrowRunAt) : '—'"></span>
            </span>
            <span x-show="emailSettings?.lastOverdueRunAt" class="text-gray-500 hidden sm:inline">
              · Overdue <span x-text="emailSettings?.lastOverdueRunAt ? window.formatRelativeTime(emailSettings.lastOverdueRunAt) : '—'"></span>
            </span>
          </div>

          <form @submit.prevent="saveEmailSettings()" class="space-y-6">

            <!-- Enabled toggles -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Email types</h3>
              <div class="space-y-3">
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Weekly digest</span>
                  <input type="checkbox" x-model="emailSettingsForm.weeklyDigestEnabled"
                         class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Due tomorrow</span>
                  <input type="checkbox" x-model="emailSettingsForm.dueTomorrowEnabled"
                         class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                </label>
                <label class="flex items-center justify-between">
                  <span class="text-sm text-gray-700">Overdue alerts</span>
                  <input type="checkbox" x-model="emailSettingsForm.overdueAlertsEnabled"
                         class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                </label>
              </div>
            </div>

            <!-- Listmonk template IDs -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Listmonk template IDs</h3>
              <p class="text-xs text-gray-500 mb-3">
                Integer IDs from your Listmonk instance. Required before cron endpoints will send.
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Weekly digest</label>
                  <input type="number" x-model="emailSettingsForm.templateIdWeekly" min="1"
                         placeholder="e.g. 5"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Due tomorrow</label>
                  <input type="number" x-model="emailSettingsForm.templateIdDueTomorrow" min="1"
                         placeholder="e.g. 6"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Overdue alerts</label>
                  <input type="number" x-model="emailSettingsForm.templateIdOverdue" min="1"
                         placeholder="e.g. 7"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
            </div>

            <!-- From / Reply-To / Test recipient -->
            <div class="border border-gray-200 rounded-lg p-4">
              <h3 class="text-sm font-semibold text-gray-900 mb-3">Addresses</h3>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">From address</label>
                  <input type="email" x-model="emailSettingsForm.fromAddress"
                         placeholder="noreply@hgraphene.com"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Reply-To</label>
                  <input type="email" x-model="emailSettingsForm.replyTo"
                         placeholder="team@hgraphene.com"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-xs font-medium text-gray-700 mb-1">Test recipient</label>
                  <input type="email" x-model="emailSettingsForm.testRecipient"
                         placeholder="you@hgraphene.com"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
            </div>

            <div class="flex items-center space-x-3">
              <button type="submit"
                      :disabled="emailSettingsSaving"
                      class="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50">
                <span x-text="emailSettingsSaving ? 'Saving…' : 'Save settings'"></span>
              </button>
              <span x-show="emailSettingsSuccess" class="text-sm text-green-600">Saved.</span>
            </div>
          </form>
        </div>
      </div>

      <!-- ── TEST SEND ─────────────────────────────────────────────────────── -->
      <div x-show="emailAdminSection === 'test'">
        <form @submit.prevent="sendTestEmail()" class="space-y-4 max-w-2xl">

          <!-- Recipient -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Recipient <span class="text-gray-400 font-normal">(blank = testRecipient from settings)</span>
            </label>
            <input type="email" x-model="emailTestForm.to"
                   placeholder="someone@example.com"
                   class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
          </div>

          <!-- Kind -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Kind</label>
            <div class="flex items-center space-x-4">
              <label class="flex items-center space-x-2 text-sm cursor-pointer">
                <input type="radio" x-model="emailTestForm.kind" value="transactional"
                       class="text-black focus:ring-black">
                <span>Transactional (Listmonk template)</span>
              </label>
              <label class="flex items-center space-x-2 text-sm cursor-pointer">
                <input type="radio" x-model="emailTestForm.kind" value="raw"
                       class="text-black focus:ring-black">
                <span>Raw HTML</span>
              </label>
            </div>
          </div>

          <!-- Transactional fields -->
          <div x-show="emailTestForm.kind === 'transactional'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Template ID</label>
              <div class="flex items-center space-x-2">
                <input type="number" x-model="emailTestForm.templateId" min="1"
                       class="w-32 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                <div class="flex items-center space-x-1 text-xs text-gray-500">
                  <button type="button" @click="emailTestForm.templateId = emailSettings?.templateIdWeekly || ''"
                          class="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                    Weekly (<span x-text="emailSettings?.templateIdWeekly || '?'"></span>)
                  </button>
                  <button type="button" @click="emailTestForm.templateId = emailSettings?.templateIdDueTomorrow || ''"
                          class="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                    Due-tomorrow (<span x-text="emailSettings?.templateIdDueTomorrow || '?'"></span>)
                  </button>
                  <button type="button" @click="emailTestForm.templateId = emailSettings?.templateIdOverdue || ''"
                          class="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50">
                    Overdue (<span x-text="emailSettings?.templateIdOverdue || '?'"></span>)
                  </button>
                </div>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Data (JSON)</label>
              <textarea x-model="emailTestForm.data" rows="5"
                        placeholder="{}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
          </div>

          <!-- Raw fields -->
          <div x-show="emailTestForm.kind === 'raw'" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" x-model="emailTestForm.subject"
                     placeholder="Test subject"
                     class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">HTML body</label>
              <textarea x-model="emailTestForm.html" rows="6"
                        placeholder="<p>Test body</p>"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"></textarea>
            </div>
          </div>

          <button type="submit"
                  :disabled="emailTestSending"
                  class="px-4 py-2 bg-black text-white text-sm rounded hover:bg-gray-800 disabled:opacity-50">
            <span x-text="emailTestSending ? 'Sending…' : 'Send test'"></span>
          </button>
        </form>

        <!-- Last 5 results -->
        <div x-show="emailTestResults && emailTestResults.length > 0" class="mt-6">
          <h3 class="text-sm font-semibold text-gray-700 mb-2">Recent results</h3>
          <div class="space-y-2">
            <template x-for="(r, i) in emailTestResults" :key="i">
              <div :class="r.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'"
                   class="border rounded-md px-3 py-2 text-sm">
                <div class="flex items-center justify-between">
                  <span :class="r.success ? 'text-green-700 font-medium' : 'text-red-700 font-medium'"
                        x-text="r.success ? 'SENT' : 'FAILED'"></span>
                  <span class="text-xs text-gray-500" x-text="window.formatRelativeTime(r.at)"></span>
                </div>
                <div x-show="!r.success && r.result?.error"
                     class="mt-1 text-red-600 text-xs font-mono" x-text="r.result?.error"></div>
                <div x-show="r.success && r.result?.logId"
                     class="mt-1 text-gray-500 text-xs" x-text="'Log ID: ' + r.result?.logId"></div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ── LOGS ──────────────────────────────────────────────────────────── -->
      <div x-show="emailAdminSection === 'logs'">

        <!-- Filters -->
        <div class="mb-4 flex flex-wrap items-center gap-2">
          <select x-model="emailLogsFilter.type" @change="loadEmailLogs()"
                  class="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All types</option>
            <option value="WEEKLY_DIGEST">Weekly digest</option>
            <option value="DUE_TOMORROW">Due tomorrow</option>
            <option value="OVERDUE_3">Overdue 3d</option>
            <option value="OVERDUE_6">Overdue 6d</option>
            <option value="OVERDUE_9">Overdue 9d</option>
            <option value="TEST">Test</option>
          </select>
          <select x-model="emailLogsFilter.status" @change="loadEmailLogs()"
                  class="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All statuses</option>
            <option value="SENT">Sent</option>
            <option value="SKIPPED">Skipped</option>
            <option value="FAILED">Failed</option>
          </select>
          <button @click="loadEmailLogs()" class="px-3 py-1.5 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
            Refresh
          </button>
          <span x-show="emailLogsLoading" class="text-sm text-gray-400">Loading…</span>
          <span x-show="!emailLogsLoading && emailLogs" class="text-sm text-gray-400"
                x-text="(emailLogs?.length || 0) + ' entries'"></span>
        </div>

        <!-- Table -->
        <div class="overflow-x-auto border border-gray-200 rounded-lg">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Time</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Recipient</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Template</th>
                <th class="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Error</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <template x-for="log in emailLogs" :key="log.id">
                <tr>
                  <td @click="emailLogsExpanded === log.id ? emailLogsExpanded = null : emailLogsExpanded = log.id"
                      class="px-3 py-2 text-gray-500 whitespace-nowrap cursor-pointer hover:bg-gray-50 text-xs"
                      x-text="window.formatRelativeTime(log.createdAt)"></td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span class="px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
                          x-text="log.type"></span>
                  </td>
                  <td class="px-3 py-2 text-gray-700 text-xs max-w-[160px] truncate" x-text="log.recipient"></td>
                  <td class="px-3 py-2 whitespace-nowrap">
                    <span :class="{
                            'bg-green-100 text-green-800': log.status === 'SENT',
                            'bg-yellow-100 text-yellow-800': log.status === 'SKIPPED',
                            'bg-red-100 text-red-800': log.status === 'FAILED'
                          }"
                          class="px-1.5 py-0.5 rounded text-xs font-medium"
                          x-text="log.status"></span>
                  </td>
                  <td class="px-3 py-2 text-gray-500 text-xs" x-text="log.templateId || '—'"></td>
                  <td class="px-3 py-2 text-red-600 text-xs max-w-[200px] truncate"
                      x-text="log.errorMessage || ''"></td>
                </tr>
                <!-- Expanded detail row -->
                <tr x-show="emailLogsExpanded === log.id" class="bg-gray-50">
                  <td colspan="6" class="px-3 py-3">
                    <div class="text-xs space-y-1">
                      <div><span class="font-medium text-gray-600">ID:</span> <span class="font-mono" x-text="log.id"></span></div>
                      <div x-show="log.idempotencyKey"><span class="font-medium text-gray-600">Idempotency key:</span> <span class="font-mono" x-text="log.idempotencyKey"></span></div>
                      <div x-show="log.user"><span class="font-medium text-gray-600">User:</span> <span x-text="log.user ? (log.user.firstName + ' ' + log.user.lastName).trim() || log.user.username : '—'"></span></div>
                      <div x-show="log.taskIds && log.taskIds.length"><span class="font-medium text-gray-600">Task IDs:</span> <span class="font-mono" x-text="(log.taskIds || []).join(', ')"></span></div>
                      <div x-show="log.errorMessage" class="text-red-600"><span class="font-medium">Error:</span> <span x-text="log.errorMessage"></span></div>
                    </div>
                  </td>
                </tr>
              </template>
              <tr x-show="!emailLogsLoading && (!emailLogs || emailLogs.length === 0)">
                <td colspan="6" class="px-3 py-8 text-center text-gray-400 text-sm">No log entries found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

window.getEmailAdminTabHtml = getEmailAdminTabHtml;
export { getEmailAdminTabHtml };
