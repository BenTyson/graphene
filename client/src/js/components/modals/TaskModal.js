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

            <!-- Due Date + Assignee Row -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input type="date" x-model="taskForm.dueDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                <select x-model="taskForm.assigneeId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="">Unassigned</option>
                  <template x-for="user in taskAssignees" :key="user.id">
                    <option :value="user.id" x-text="(user.firstName || '') + ' ' + (user.lastName || user.username)"></option>
                  </template>
                </select>
              </div>
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <template x-for="tag in taskForm.tags" :key="tag">
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
                  placeholder="Add a tag...">
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
