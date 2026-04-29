/**
 * EmailPreferencesModal
 * Per-user email notification preferences panel.
 * Hidden for INVESTOR and THIRD_PARTY roles (no task access).
 * Opened via openEmailPrefs() from the sidebar settings button.
 */

function getEmailPreferencesModalHtml() {
  return `
    <div x-show="showEmailPrefs && !isThirdParty() && currentUser?.role !== 'INVESTOR'" x-cloak
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black/50" @click="closeEmailPrefs()"></div>
        <div class="relative bg-white rounded-lg w-full max-w-lg shadow-xl">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <h3 class="text-base font-semibold text-gray-900">Email notifications</h3>
            <button @click="closeEmailPrefs()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Loading state -->
          <div x-show="emailPrefsLoading" class="px-5 py-10 text-center text-sm text-gray-400">
            Loading preferences…
          </div>

          <div x-show="!emailPrefsLoading && emailPrefsForm">

            <!-- Paused banner -->
            <div x-show="emailPrefsForm?.unsubscribedAt"
                 class="mx-5 mt-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-red-800">All emails paused</p>
                <p class="text-xs text-red-600 mt-0.5">You won't receive any email notifications until you resume.</p>
              </div>
              <button @click="resumeEmails()" type="button"
                      class="ml-4 px-3 py-1.5 text-xs font-medium bg-red-700 text-white rounded hover:bg-red-800 whitespace-nowrap">
                Resume
              </button>
            </div>

            <form @submit.prevent="saveEmailPreferences()" class="px-5 py-4 space-y-5">

              <!-- Digest toggles -->
              <div>
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">What to receive</h4>
                <div class="space-y-2.5">

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Weekly digest</span>
                      <p class="text-xs text-gray-400">Overview of tasks due this week — sent Mondays</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.weeklyDigest"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Due tomorrow</span>
                      <p class="text-xs text-gray-400">Reminder for tasks due the next day — sent afternoons</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.dueTomorrow"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Overdue at 3 days</span>
                      <p class="text-xs text-gray-400">Alert when a task is 3 days past due</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.overdue3Day"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Overdue at 6 days</span>
                      <p class="text-xs text-gray-400">Alert when a task is 6 days past due</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.overdue6Day"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Overdue at 9 days</span>
                      <p class="text-xs text-gray-400">Alert when a task is 9 days past due</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.overdue9Day"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                </div>
              </div>

              <!-- Task scope -->
              <div>
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Which tasks</h4>
                <div class="space-y-2.5">

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Only my tasks</span>
                      <p class="text-xs text-gray-400">Limit digests to tasks assigned to you</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.onlyMyTasks"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                  <label class="flex items-center justify-between cursor-pointer">
                    <div>
                      <span class="text-sm text-gray-800">Include unassigned</span>
                      <p class="text-xs text-gray-400">Also include tasks with no assignee</p>
                    </div>
                    <input type="checkbox" x-model="emailPrefsForm.includeUnassigned"
                           class="w-4 h-4 rounded border-gray-300 text-black focus:ring-black">
                  </label>

                </div>
              </div>

              <!-- Timezone -->
              <div>
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Timezone</h4>
                <select x-model="emailPrefsForm.timezone"
                        class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black">
                  <template x-for="tz in emailTimezones" :key="tz">
                    <option :value="tz" x-text="tz"></option>
                  </template>
                </select>
                <p class="mt-1 text-xs text-gray-400">Used to schedule when you receive digests relative to your local time.</p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-between pt-2 border-t border-gray-100">
                <!-- Pause -->
                <button x-show="!emailPrefsForm?.unsubscribedAt"
                        @click.prevent="pauseEmails()" type="button"
                        class="text-xs text-gray-500 hover:text-red-600 underline">
                  Pause all emails
                </button>
                <div x-show="emailPrefsForm?.unsubscribedAt"></div>

                <!-- Save -->
                <div class="flex items-center space-x-3">
                  <span x-show="emailPrefsSuccess" class="text-sm text-green-600">Saved.</span>
                  <button type="button" @click="closeEmailPrefs()"
                          class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" :disabled="emailPrefsSaving"
                          class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50">
                    <span x-text="emailPrefsSaving ? 'Saving…' : 'Save'"></span>
                  </button>
                </div>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  `;
}

window.getEmailPreferencesModalHtml = getEmailPreferencesModalHtml;
export { getEmailPreferencesModalHtml };
