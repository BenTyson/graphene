export function getGoalModalHtml() {
  return `
    <div x-show="showGoalForm" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      @keydown.escape.window="showGoalForm && closeGoalForm()"
      class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeGoalForm()"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-lg h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-y-auto">
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg font-semibold text-gray-900" x-text="editingGoal ? 'Edit Goal' : 'New Goal'"></h3>
            <button @click="closeGoalForm()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <form @submit.prevent="saveGoal()" class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
              <input type="text" x-model="goalForm.title" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea x-model="goalForm.description" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm resize-none"></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select x-model="goalForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="ACTIVE">Active</option>
                  <option value="ON_HOLD">On Hold</option>
                  <option value="ACHIEVED">Achieved</option>
                  <option value="ABANDONED">Abandoned</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                <input type="date" x-model="goalForm.targetDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Champion / Owner</label>
              <select x-model="goalForm.ownerId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option value="">No champion</option>
                <template x-for="user in taskAssignees" :key="user.id">
                  <option :value="user.id" x-text="(user.firstName || '') + ' ' + (user.lastName || user.username)"></option>
                </template>
              </select>
              <p class="text-[11px] text-gray-400 mt-1">The champion is accountable for the outcome — not the day-to-day work.</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div class="flex flex-wrap gap-1.5">
                <template x-for="sysTag in ['Fundraising','Production','Science','R&D','Sales','Patents','Legal','Web & Marketing','Proforma','Administrative Ops']" :key="sysTag">
                  <button type="button" @click="goalForm.tags.includes(sysTag) ? (goalForm.tags = goalForm.tags.filter(t => t !== sysTag)) : (goalForm.tags.push(sysTag))"
                    :class="goalForm.tags.includes(sysTag) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-2 py-0.5 rounded text-xs font-medium transition-colors" x-text="sysTag"></button>
                </template>
              </div>
            </div>

            <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button type="button" @click="closeGoalForm()"
                class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="!goalForm.title.trim()"
                class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span x-text="editingGoal ? 'Save Changes' : 'Create Goal'"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
