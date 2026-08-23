export function getTaskModalHtml() {
  return `
    <div x-show="showAddTask" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      @keydown.escape.window="showAddTask && closeTaskForm()"
      class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeTaskForm()"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-lg h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg font-semibold text-gray-900" x-text="editingTask ? 'Edit Task' : 'New Task'"></h3>
            <button @click="closeTaskForm()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="saveTask()" class="p-6 space-y-4">
            <!-- Title -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
              <input type="text" x-model="taskForm.title" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                placeholder="What needs to be done?">
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea x-model="taskForm.description" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm resize-none"
                placeholder="Add details..."></textarea>
            </div>

            <!-- Status + Priority Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select x-model="taskForm.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="DONE">Done</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select x-model="taskForm.priority"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>

            <!-- Start Date + Due Date Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input type="date" x-model="taskForm.startDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <p class="text-[11px] text-gray-400 mt-1"
                  x-text="taskForm.startDate ? 'When work on this begins.' : 'Empty = the date this task was created.'"></p>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" x-model="taskForm.dueDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <p class="text-[11px] text-amber-600 mt-1"
                  x-show="isStartAfterDue(taskForm.startDate, taskForm.dueDate)" x-cloak>
                  Starts after it is due.
                </p>
              </div>
            </div>

            <!-- Cost -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Cost</label>
                <div class="flex items-stretch gap-2">
                  <div class="relative flex-1">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">$</span>
                    <input type="number" min="0" step="0.01" x-model="taskForm.cost"
                      @input="if (!taskForm.cost) taskForm.costPaid = false"
                      class="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                      placeholder="0.00">
                  </div>
                  <label class="inline-flex items-center gap-1.5 px-2 text-xs text-gray-600 select-none whitespace-nowrap"
                    :class="!taskForm.cost ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'">
                    <input type="checkbox" x-model="taskForm.costPaid" :disabled="!taskForm.cost"
                      class="rounded border-gray-300 text-black focus:ring-black">
                    Paid
                  </label>
                </div>
                <p class="text-[11px] text-gray-400 mt-1">Optional. Mark Paid when settled.</p>
              </div>
            </div>

            <!-- Goal (only on top-level tasks) -->
            <template x-if="!taskForm.parentId">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Goal</label>
                <select x-model="taskForm.goalId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="">No goal</option>
                  <template x-for="g in getActiveGoals()" :key="g.id">
                    <option :value="g.id" x-text="g.title"></option>
                  </template>
                </select>
                <p class="text-[11px] text-gray-400 mt-1">Group this task under a higher-level outcome.</p>
              </div>
            </template>

            <!-- Assignees -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Assignees</label>
              <div class="flex flex-wrap gap-1.5">
                <template x-for="user in taskAssignees" :key="user.id">
                  <button type="button" @click="toggleTaskFormAssignee(user.id)"
                    :class="taskForm.assigneeIds.includes(user.id) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-2 py-0.5 rounded text-xs font-medium transition-colors"
                    x-text="(user.firstName || '') + ' ' + (user.lastName || user.username)"></button>
                </template>
              </div>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div class="flex flex-wrap gap-1.5 mb-2 items-center">
                <template x-for="sysTag in systemCategoryTags" :key="sysTag">
                  <button type="button" @click="taskForm.tags.includes(sysTag) ? removeTaskTag(sysTag) : (taskForm.tags.push(sysTag))"
                    :class="taskForm.tags.includes(sysTag) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-2 py-0.5 rounded text-xs font-medium transition-colors" x-text="sysTag"></button>
                </template>
                <template x-if="addingTagKind !== 'CATEGORY'">
                  <button type="button" @click="showAddTagInput('CATEGORY')"
                    class="px-2 py-0.5 rounded text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400">+ Add tag</button>
                </template>
                <template x-if="addingTagKind === 'CATEGORY'">
                  <span class="inline-flex items-center gap-1">
                    <input type="text" x-model="newTagInput" data-add-tag-input
                      @keydown.enter.prevent="submitAddTag('taskForm')"
                      @keydown.escape.prevent="cancelAddTag()"
                      @blur="submitAddTag('taskForm')"
                      class="px-2 py-0.5 rounded text-xs border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black w-32"
                      placeholder="New tag name">
                  </span>
                </template>
              </div>

              <label class="block text-sm font-medium text-gray-700 mb-1">Institutions</label>
              <div class="flex flex-wrap gap-1.5 mb-2 items-center">
                <template x-for="instTag in systemInstitutionTags" :key="instTag">
                  <button type="button" @click="taskForm.tags.includes(instTag) ? removeTaskTag(instTag) : (taskForm.tags.push(instTag))"
                    :class="taskForm.tags.includes(instTag) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-2 py-0.5 rounded text-xs font-medium transition-colors" x-text="instTag"></button>
                </template>
                <template x-if="addingTagKind !== 'INSTITUTION'">
                  <button type="button" @click="showAddTagInput('INSTITUTION')"
                    class="px-2 py-0.5 rounded text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:border-gray-400">+ Add institution</button>
                </template>
                <template x-if="addingTagKind === 'INSTITUTION'">
                  <span class="inline-flex items-center gap-1">
                    <input type="text" x-model="newTagInput" data-add-tag-input
                      @keydown.enter.prevent="submitAddTag('taskForm')"
                      @keydown.escape.prevent="cancelAddTag()"
                      @blur="submitAddTag('taskForm')"
                      class="px-2 py-0.5 rounded text-xs border border-gray-300 focus:outline-none focus:ring-1 focus:ring-black w-36"
                      placeholder="New institution">
                  </span>
                </template>
              </div>

              <div class="flex flex-wrap gap-1.5 mb-2">
                <template x-for="tag in taskForm.tags.filter(t => !isSystemTag(t))" :key="tag">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    <span x-text="tag"></span>
                    <button type="button" @click="removeTaskTag(tag)" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                      </svg>
                    </button>
                  </span>
                </template>
              </div>
              <div class="flex gap-2">
                <input type="text" x-model="taskTagInput" @keydown.enter.prevent="addTaskTag()"
                  class="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm"
                  placeholder="One-off custom tag (this task only)...">
                <button type="button" @click="addTaskTag()"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Add</button>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button type="button" @click="closeTaskForm()"
                class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="!taskForm.title.trim()"
                class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span x-text="editingTask ? 'Save Changes' : 'Create Task'"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
