export function getGoalsTabHtml() {
  return `
    <div x-show="activeTab === 'goals'" x-cloak>
      <!-- Header -->
      <div class="mb-3">
        <div class="flex items-center justify-end gap-2 mb-2">
          <button @click="openGoalForm()" class="px-4 py-1.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
            + New Goal
          </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <input type="text" x-model="goalSearch" @input.debounce.300ms="loadGoals()" placeholder="Search goals..."
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black w-48">
          <select x-model="goalFilters.status" @change="loadGoals()"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="ACHIEVED">Achieved</option>
            <option value="ABANDONED">Abandoned</option>
          </select>
          <select x-model="goalFilters.ownerId" @change="loadGoals()"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Champions</option>
            <template x-for="user in taskAssignees" :key="user.id">
              <option :value="user.id" x-text="(user.firstName || '') + ' ' + (user.lastName || user.username)"></option>
            </template>
          </select>
          <label class="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" x-model="showArchivedGoals" @change="loadGoals()"
              class="rounded border-gray-300 text-black focus:ring-black">
            Show archived
          </label>
          <template x-if="goalSearch || goalFilters.status || goalFilters.ownerId || showArchivedGoals">
            <button @click="goalSearch = ''; goalFilters = { status: '', ownerId: '' }; showArchivedGoals = false; loadGoals()"
              class="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 underline">
              Clear filters
            </button>
          </template>
        </div>
      </div>

      <!-- Loading -->
      <template x-if="goalLoading && !goals.length">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </template>

      <template x-if="!goalLoading && !goals.length">
        <div class="border border-dashed border-gray-200 rounded-lg p-12 text-center">
          <svg class="w-10 h-10 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z M12 17a5 5 0 100-10 5 5 0 000 10z M12 13a1 1 0 100-2 1 1 0 000 2z"/>
          </svg>
          <p class="text-sm text-gray-500 mb-1">No goals yet</p>
          <p class="text-xs text-gray-400 mb-4">Create a goal to group related tasks under a single outcome.</p>
          <button @click="openGoalForm()" class="px-3 py-1.5 bg-black text-white text-xs font-medium rounded hover:bg-gray-800">+ Create your first goal</button>
        </div>
      </template>

      <!-- Goal cards grid -->
      <div x-show="goals.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <template x-for="goal in goals" :key="goal.id">
          <div @click="openGoalDetail(goal.id)"
            class="bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
            :class="goal.archivedAt ? 'opacity-60' : ''">
            <!-- Top row: status + actions -->
            <div class="flex items-center justify-between mb-2">
              <span :class="getGoalStatusBadgeClass(goal.status)" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide"
                x-text="getGoalStatusLabel(goal.status)"></span>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                <button @click="openEditGoalForm(goal)" class="p-1 text-gray-400 hover:text-gray-700" title="Edit">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <template x-if="!goal.archivedAt">
                  <button @click="deleteGoal(goal.id)" class="p-1 text-gray-400 hover:text-red-600" title="Archive">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14l-1 12H6L5 8zM10 11v6M14 11v6M9 5h6l1 3H8l1-3z"/>
                    </svg>
                  </button>
                </template>
                <template x-if="goal.archivedAt">
                  <button @click="restoreGoal(goal.id)" class="p-1 text-gray-400 hover:text-blue-600" title="Restore">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v6h6M20 20v-6h-6M4 10a8 8 0 0114-3.5M20 14a8 8 0 01-14 3.5"/>
                    </svg>
                  </button>
                </template>
              </div>
            </div>

            <!-- Title + description -->
            <h3 class="text-base font-semibold text-gray-900 leading-snug mb-1" x-text="goal.title"></h3>
            <template x-if="goal.description">
              <p class="text-xs text-gray-500 mb-3 line-clamp-2" x-text="goal.description"></p>
            </template>

            <!-- Progress -->
            <div class="mb-3">
              <div class="flex items-center justify-between text-[11px] text-gray-500 mb-1">
                <span>
                  <span class="font-medium text-gray-700" x-text="goal.taskCounts.done + ' / ' + goal.taskCounts.total"></span>
                  tasks done
                </span>
                <span class="font-medium text-gray-700" x-text="goal.progress + '%'"></span>
              </div>
              <div class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div :class="getGoalProgressColor(goal)" class="h-full rounded-full transition-all"
                  :style="'width:' + goal.progress + '%'"></div>
              </div>
            </div>

            <!-- Status counts breakdown -->
            <div class="flex items-center gap-3 text-[11px] text-gray-500 mb-3">
              <template x-if="goal.taskCounts.todo">
                <span><span class="font-medium text-gray-700" x-text="goal.taskCounts.todo"></span> To Do</span>
              </template>
              <template x-if="goal.taskCounts.inProgress">
                <span><span class="font-medium text-blue-700" x-text="goal.taskCounts.inProgress"></span> In Progress</span>
              </template>
              <template x-if="goal.taskCounts.inReview">
                <span><span class="font-medium text-amber-700" x-text="goal.taskCounts.inReview"></span> In Review</span>
              </template>
              <template x-if="!goal.taskCounts.total">
                <span class="text-gray-300 italic">No tasks linked yet</span>
              </template>
            </div>

            <!-- Bottom row: champion, target date, tags -->
            <div class="flex items-center justify-between gap-2 pt-3 border-t border-gray-100">
              <div class="flex items-center gap-2 min-w-0">
                <template x-if="goal.owner">
                  <div class="flex items-center gap-1.5 min-w-0" :title="(goal.owner.firstName || '') + ' ' + (goal.owner.lastName || goal.owner.username)">
                    <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                      <span class="text-[9px] font-medium text-gray-600"
                        x-text="(goal.owner.firstName?.[0] || '') + (goal.owner.lastName?.[0] || goal.owner.username?.[0] || '')"></span>
                    </div>
                    <span class="text-[11px] text-gray-700 truncate" x-text="goal.owner.firstName || goal.owner.username"></span>
                  </div>
                </template>
                <template x-if="!goal.owner">
                  <span class="text-[11px] text-gray-300 italic">No champion</span>
                </template>
              </div>
              <template x-if="goal.targetDate">
                <span class="text-[11px] text-gray-500" x-text="getTaskDueLabel(goal.targetDate)"></span>
              </template>
            </div>

            <template x-if="goal.tags && goal.tags.length">
              <div class="flex flex-wrap gap-1 mt-2">
                <template x-for="tag in goal.tags.slice(0, 4)" :key="tag">
                  <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]" x-text="tag"></span>
                </template>
              </div>
            </template>
          </div>
        </template>
      </div>
    </div>
  `;
}
