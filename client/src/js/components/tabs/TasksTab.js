export function getTasksTabHtml() {
  return `
    <div x-show="activeTab === 'tasks'" x-cloak>
      <!-- Header -->
      <div class="mb-3">
        <div class="flex items-center justify-end gap-2 mb-2">
            <!-- View Toggle -->
            <div class="flex rounded-md border border-gray-300 overflow-hidden">
              <button @click="taskViewMode = 'kanban'; $nextTick(() => initKanbanDragDrop())"
                :class="taskViewMode === 'kanban' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-3 py-1.5 text-xs font-medium transition-colors">
                Board
              </button>
              <button @click="taskViewMode = 'list'"
                :class="taskViewMode === 'list' ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'"
                class="px-3 py-1.5 text-xs font-medium transition-colors border-l border-gray-300">
                List
              </button>
            </div>
            <button @click="openTaskForm()" class="px-4 py-1.5 bg-black text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors">
              + New Task
            </button>
        </div>

        <!-- Filters -->
        <div class="flex flex-wrap items-center gap-2">
          <input type="text" x-model="taskSearch" @input.debounce.300ms="loadTasks()" placeholder="Search tasks..."
            class="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black w-48">
          <select x-model="taskFilters.priority" @change="loadTasks()"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <select x-model="taskFilters.assigneeId" @change="loadTasks()"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Assignees</option>
            <template x-for="user in taskAssignees" :key="user.id">
              <option :value="user.id" x-text="(user.firstName || '') + ' ' + (user.lastName || user.username)"></option>
            </template>
          </select>
          <label class="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" x-model="taskFilters.overdue" @change="loadTasks()"
              class="rounded border-gray-300 text-black focus:ring-black">
            Overdue only
          </label>
          <label class="flex items-center gap-1.5 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" x-model="showArchivedTasks"
              class="rounded border-gray-300 text-black focus:ring-black">
            Show archived
          </label>
          <template x-if="taskSearch || taskFilters.priority || taskFilters.assigneeId || taskFilters.overdue || showArchivedTasks">
            <button @click="taskSearch = ''; taskFilters = { status: '', priority: '', assigneeId: '', overdue: false }; showArchivedTasks = false; loadTasks()"
              class="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 underline">
              Clear filters
            </button>
          </template>
        </div>
      </div>

      <!-- Loading -->
      <template x-if="taskLoading && !tasks.length">
        <div class="flex items-center justify-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      </template>

      <!-- Kanban Board View -->
      <template x-if="!taskLoading || tasks.length">
        <div>
          <div x-show="taskViewMode === 'kanban'" class="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-2" :class="showArchivedTasks ? 'xl:grid-cols-5' : 'xl:grid-cols-4'" x-bind:class="showArchivedTasks ? 'xl:grid-cols-5' : 'xl:grid-cols-4'" style="scroll-snap-type: x mandatory;">
            ${['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(status => `
              <div class="flex flex-col min-h-[200px] min-w-[280px] snap-start md:min-w-0">
                <!-- Column Header -->
                <div class="flex items-center justify-between mb-3 px-1">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full ${
                      status === 'TODO' ? 'bg-gray-400' :
                      status === 'IN_PROGRESS' ? 'bg-blue-500' :
                      status === 'IN_REVIEW' ? 'bg-amber-500' : 'bg-green-500'
                    }"></div>
                    <h3 class="text-sm font-semibold text-gray-700">${
                      status === 'TODO' ? 'To Do' :
                      status === 'IN_PROGRESS' ? 'In Progress' :
                      status === 'IN_REVIEW' ? 'In Review' : 'Done'
                    }</h3>
                    <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600"
                      x-text="getTasksByStatus('${status}').length"></span>
                  </div>
                </div>

                <!-- Column Body (SortableJS container) -->
                <div id="kanban-col-${status}" data-status="${status}"
                  class="flex-1 space-y-2 p-2 rounded-lg min-h-[100px] ${
                  status === 'TODO' ? 'bg-gray-50' :
                  status === 'IN_PROGRESS' ? 'bg-blue-50/50' :
                  status === 'IN_REVIEW' ? 'bg-amber-50/50' : 'bg-green-50/50'
                }">
                  <template x-for="task in getTasksByStatus('${status}')" :key="task.id">
                    <div @click="openTaskDetail(task.id)"
                      :data-task-id="task.id"
                      :class="task.incompleteBlockerCount > 0 ? 'ring-1 ring-red-200 bg-red-50/40' : 'bg-white'"
                      class="rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group">
                      <!-- Priority + Title -->
                      <div class="flex items-start gap-2 mb-2">
                        <span :class="getPriorityBadgeClass(task.priority)"
                          class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 mt-0.5"
                          x-text="task.priority"></span>
                        <p class="text-sm font-medium text-gray-900 line-clamp-2 leading-snug" x-text="task.title"></p>
                      </div>

                      <!-- Tags -->
                      <template x-if="task.tags && task.tags.length">
                        <div class="flex flex-wrap gap-1 mb-2">
                          <template x-for="tag in task.tags.slice(0, 3)" :key="tag">
                            <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]" x-text="tag"></span>
                          </template>
                        </div>
                      </template>

                      <!-- Bottom row: due date, subtasks, assignee -->
                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-2">
                          <template x-if="task.dueDate">
                            <span :class="getTaskDueClass(task.dueDate, task.status)" class="text-[11px]"
                              x-text="getTaskDueLabel(task.dueDate)"></span>
                          </template>
                          <template x-if="getSubtaskProgress(task)">
                            <span class="text-[11px] text-gray-400"
                              x-text="getSubtaskProgress(task).done + '/' + getSubtaskProgress(task).total"></span>
                          </template>
                          <template x-if="getOverdueSubtaskCount(task)">
                            <span class="text-[11px] text-red-500 font-medium" :title="getOverdueSubtaskCount(task) + ' overdue subtask(s)'"
                              x-text="getOverdueSubtaskCount(task) + ' overdue'"></span>
                          </template>
                          <template x-if="task._count?.attachments">
                            <span class="flex items-center gap-0.5 text-[11px] text-gray-400" :title="task._count.attachments + ' attachment(s)'">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                              </svg>
                              <span x-text="task._count.attachments"></span>
                            </span>
                          </template>
                          <template x-if="task.blockerCount > 0">
                            <span class="flex items-center gap-0.5 text-[11px] font-medium"
                              :class="task.incompleteBlockerCount > 0 ? 'text-red-600' : 'text-gray-400'"
                              :title="task.incompleteBlockerCount > 0 ? task.incompleteBlockerCount + ' incomplete blocker(s)' : 'Blocked by ' + task.blockerCount + ' task(s) (all done)'">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                              </svg>
                              <span x-text="task.blockerCount"></span>
                            </span>
                          </template>
                        </div>
                        <template x-if="task.assignee">
                          <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center"
                            :title="getAssigneeName(task)">
                            <span class="text-[10px] font-medium text-gray-600" x-text="getAssigneeInitials(task)"></span>
                          </div>
                        </template>
                      </div>

                      <!-- Status change dropdown (visible on hover) -->
                      <div class="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity"
                        @click.stop>
                        <select @change="updateTaskStatus(task.id, $event.target.value); $event.target.value = task.status"
                          :value="task.status"
                          class="w-full text-xs py-1 px-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black">
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="IN_REVIEW">In Review</option>
                          <option value="DONE">Done</option>
                          <option value="ARCHIVED">Archived</option>
                        </select>
                      </div>
                    </div>
                  </template>

                  <!-- Empty state -->
                  <template x-if="getTasksByStatus('${status}').length === 0">
                    <div class="text-center py-8 text-gray-400 text-xs">No tasks</div>
                  </template>
                </div>

                <!-- Quick-add button -->
                <button @click="openTaskFormWithStatus('${status}')"
                  class="mt-2 w-full py-2 text-xs text-gray-400 hover:text-gray-600 hover:bg-white rounded border border-dashed border-gray-200 hover:border-gray-300 transition-colors">
                  + Add task
                </button>
              </div>
            `).join('')}

            <!-- Archived Column (conditional) -->
            <div x-show="showArchivedTasks" class="flex flex-col min-h-[200px] min-w-[280px] snap-start md:min-w-0">
              <div class="flex items-center justify-between mb-3 px-1">
                <div class="flex items-center gap-2">
                  <div class="w-2 h-2 rounded-full bg-gray-300"></div>
                  <h3 class="text-sm font-semibold text-gray-700">Archived</h3>
                  <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-200 text-[10px] font-semibold text-gray-600"
                    x-text="getTasksByStatus('ARCHIVED').length"></span>
                </div>
              </div>
              <div id="kanban-col-ARCHIVED" data-status="ARCHIVED" class="flex-1 space-y-2 p-2 rounded-lg min-h-[100px] bg-gray-50/50">
                <template x-for="task in getTasksByStatus('ARCHIVED')" :key="task.id">
                  <div @click="openTaskDetail(task.id)"
                    :data-task-id="task.id"
                    class="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group opacity-60">
                    <div class="flex items-start gap-2 mb-2">
                      <span :class="getPriorityBadgeClass(task.priority)"
                        class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wide shrink-0 mt-0.5"
                        x-text="task.priority"></span>
                      <p class="text-sm font-medium text-gray-900 line-clamp-2 leading-snug" x-text="task.title"></p>
                    </div>
                    <div class="mt-2 pt-2 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
                      <select @change="updateTaskStatus(task.id, $event.target.value); $event.target.value = task.status"
                        :value="task.status"
                        class="w-full text-xs py-1 px-2 border border-gray-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-black">
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="DONE">Done</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>
                </template>
                <template x-if="getTasksByStatus('ARCHIVED').length === 0">
                  <div class="text-center py-8 text-gray-400 text-xs">No archived tasks</div>
                </template>
              </div>
            </div>
          </div>

          <!-- List View -->
          <div x-show="taskViewMode === 'list'">
            <!-- Desktop Table -->
            <div class="hidden md:block overflow-x-auto border border-gray-200 rounded-lg">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Status</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Priority</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-36">Assignee</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">Due Date</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Subtasks</th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Blockers</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <template x-for="task in getFilteredTasks()" :key="task.id">
                    <tr @click="openTaskDetail(task.id)" class="hover:bg-gray-50 cursor-pointer transition-colors">
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <template x-if="task.tags && task.tags.length">
                            <template x-for="tag in task.tags.slice(0, 2)" :key="tag">
                              <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px] shrink-0" x-text="tag"></span>
                            </template>
                          </template>
                          <span class="text-sm text-gray-900 font-medium" x-text="task.title"></span>
                          <template x-if="task._count?.comments">
                            <span class="text-[10px] text-gray-400" x-text="task._count.comments + ' comments'"></span>
                          </template>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <span :class="getStatusBadgeClass(task.status)"
                          class="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                          x-text="formatStatusLabel(task.status)"></span>
                      </td>
                      <td class="px-4 py-3">
                        <span :class="getPriorityBadgeClass(task.priority)"
                          class="inline-flex px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase"
                          x-text="task.priority"></span>
                      </td>
                      <td class="px-4 py-3">
                        <div class="flex items-center gap-2">
                          <template x-if="task.assignee">
                            <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                              <span class="text-[9px] font-medium text-gray-600" x-text="getAssigneeInitials(task)"></span>
                            </div>
                          </template>
                          <span class="text-sm text-gray-600 truncate" x-text="getAssigneeName(task)"></span>
                        </div>
                      </td>
                      <td class="px-4 py-3">
                        <span :class="getTaskDueClass(task.dueDate, task.status)" class="text-xs"
                          x-text="getTaskDueLabel(task.dueDate) || '-'"></span>
                      </td>
                      <td class="px-4 py-3">
                        <template x-if="getSubtaskProgress(task)">
                          <div class="flex items-center gap-1.5">
                            <div class="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div class="h-full bg-green-500 rounded-full transition-all"
                                :style="'width:' + getSubtaskProgress(task).percent + '%'"></div>
                            </div>
                            <span class="text-[10px] text-gray-500" x-text="getSubtaskProgress(task).done + '/' + getSubtaskProgress(task).total"></span>
                          </div>
                        </template>
                        <template x-if="!getSubtaskProgress(task)">
                          <span class="text-xs text-gray-300">-</span>
                        </template>
                      </td>
                      <td class="px-4 py-3">
                        <template x-if="task.blockerCount > 0">
                          <span class="inline-flex items-center gap-1 text-xs font-medium"
                            :class="task.incompleteBlockerCount > 0 ? 'text-red-600' : 'text-gray-400'"
                            :title="task.incompleteBlockerCount > 0 ? task.incompleteBlockerCount + ' incomplete blocker(s)' : 'Blocked by ' + task.blockerCount + ' task(s) (all done)'">
                            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                            </svg>
                            <span x-text="task.blockerCount"></span>
                          </span>
                        </template>
                        <template x-if="!task.blockerCount">
                          <span class="text-xs text-gray-300">-</span>
                        </template>
                      </td>
                    </tr>
                  </template>
                  <template x-if="getFilteredTasks().length === 0">
                    <tr>
                      <td colspan="7" class="px-4 py-12 text-center text-sm text-gray-400">
                        No tasks found. Create one to get started.
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>

            <!-- Mobile Cards -->
            <div class="md:hidden space-y-3">
              <template x-for="task in getFilteredTasks()" :key="task.id">
                <div @click="openTaskDetail(task.id)"
                  :class="task.incompleteBlockerCount > 0 ? 'ring-1 ring-red-200 bg-red-50/40' : 'bg-white'"
                  class="border border-gray-200 rounded-lg p-4 cursor-pointer hover:shadow-sm transition-shadow">
                  <div class="flex items-start justify-between mb-2">
                    <p class="text-sm font-medium text-gray-900 flex-1 mr-2" x-text="task.title"></p>
                    <span :class="getPriorityBadgeClass(task.priority)"
                      class="px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase shrink-0"
                      x-text="task.priority"></span>
                  </div>
                  <div class="flex items-center gap-3 text-xs text-gray-500">
                    <span :class="getStatusBadgeClass(task.status)" class="px-2 py-0.5 rounded font-medium"
                      x-text="formatStatusLabel(task.status)"></span>
                    <span x-text="getAssigneeName(task)"></span>
                    <template x-if="task.dueDate">
                      <span :class="getTaskDueClass(task.dueDate, task.status)" x-text="getTaskDueLabel(task.dueDate)"></span>
                    </template>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>
    </div>
  `;
}
