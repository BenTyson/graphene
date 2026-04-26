import { TASK_CATEGORY_TAGS, TASK_INSTITUTION_TAGS } from '../../utils/constants.js';

export function getTasksTabHtml() {
  const categoryOptions = TASK_CATEGORY_TAGS.map(t => `<option value="${t}">${t}</option>`).join('');
  const institutionOptions = TASK_INSTITUTION_TAGS.map(t => `<option value="${t}">${t}</option>`).join('');
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
          <select x-model="taskFilters.tag"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Tags</option>
            ${categoryOptions}
          </select>
          <select x-model="taskFilters.institution"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Institutions</option>
            ${institutionOptions}
          </select>
          <select x-model="taskFilters.goalId" @change="loadTasks()"
            class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            <option value="">All Goals</option>
            <option value="none">No Goal</option>
            <template x-for="g in getActiveGoals()" :key="g.id">
              <option :value="g.id" x-text="g.title"></option>
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
          <template x-if="taskSearch || taskFilters.priority || taskFilters.assigneeId || taskFilters.overdue || taskFilters.tag || taskFilters.institution || taskFilters.goalId || showArchivedTasks">
            <button @click="taskSearch = ''; taskFilters = { status: '', priority: '', assigneeId: '', overdue: false, tag: '', institution: '', goalId: '' }; showArchivedTasks = false; loadTasks()"
              class="px-2 py-1.5 text-xs text-gray-500 hover:text-gray-700 underline">
              Clear filters
            </button>
          </template>
          <template x-if="taskViewMode === 'list'">
            <div class="flex items-center gap-1.5 ml-auto">
              <span class="text-xs text-gray-500">Group by</span>
              <select :value="taskListGroupBy" @change="setTaskListGroupBy($event.target.value)"
                class="px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <option value="none">None</option>
                <option value="status">Status</option>
                <option value="priority">Priority</option>
                <option value="assignee">Assignee</option>
                <option value="goal">Goal</option>
                <option value="tag">Tag</option>
                <option value="institution">Institution</option>
              </select>
            </div>
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
                      <!-- Title -->
                      <p class="text-sm font-semibold text-gray-900 leading-snug break-words mb-2" x-text="task.title"></p>

                      <!-- Meta line: assignee · priority · due date -->
                      <div class="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500 mb-2">
                        <template x-if="getTaskAssigneeUsers(task).length">
                          <div class="flex items-center gap-1.5" :title="getTaskAssigneeNames(task)">
                            <div class="flex -space-x-1.5">
                              <template x-for="u in getTaskAssigneeUsers(task).slice(0, 3)" :key="u.id">
                                <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white">
                                  <span class="text-[9px] font-medium text-gray-600"
                                    x-text="(u.firstName?.[0] || '') + (u.lastName?.[0] || u.username?.[0] || '')"></span>
                                </div>
                              </template>
                            </div>
                            <span class="text-gray-700 font-medium" x-text="getTaskAssigneeUsers(task).length === 1 ? getTaskPrimaryAssigneeShort(task) : getTaskPrimaryAssigneeShort(task) + ' +' + (getTaskAssigneeUsers(task).length - 1)"></span>
                          </div>
                        </template>
                        <template x-if="!getTaskAssigneeUsers(task).length">
                          <span class="text-gray-400 italic">Unassigned</span>
                        </template>
                        <span class="text-gray-300">·</span>
                        <span class="flex items-center gap-1" :title="getPriorityLabel(task.priority) + ' priority'">
                          <span :class="getPriorityDotClass(task.priority)" class="w-1.5 h-1.5 rounded-full"></span>
                          <span x-text="getPriorityLabel(task.priority)"></span>
                        </span>
                        <template x-if="task.dueDate">
                          <span class="flex items-center gap-1">
                            <span class="text-gray-300">·</span>
                            <span :class="getTaskDueClass(task.dueDate, task.status)"
                              x-text="getTaskDueLabel(task.dueDate)"></span>
                          </span>
                        </template>
                      </div>

                      <!-- Goal pill -->
                      <template x-if="task.goal">
                        <div class="mb-2">
                          <button @click.stop="openGoalDetail(task.goal.id)"
                            class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium max-w-full">
                            <svg class="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z M12 13a1 1 0 100-2 1 1 0 000 2z"/>
                            </svg>
                            <span class="truncate" x-text="task.goal.title"></span>
                          </button>
                        </div>
                      </template>

                      <!-- Tags -->
                      <template x-if="task.tags && task.tags.length">
                        <div class="flex flex-wrap gap-1 mb-2">
                          <template x-for="tag in task.tags.slice(0, 3)" :key="tag">
                            <span class="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[10px]" x-text="tag"></span>
                          </template>
                          <template x-if="task.tags.length > 3">
                            <span class="px-1.5 py-0.5 text-gray-400 text-[10px]" x-text="'+' + (task.tags.length - 3)"></span>
                          </template>
                        </div>
                      </template>

                      <!-- Bottom indicators: subtasks, attachments, blockers -->
                      <template x-if="getSubtaskProgress(task) || task._count?.attachments || task.blockerCount > 0 || getOverdueSubtaskCount(task)">
                        <div class="flex items-center gap-3 text-[11px] text-gray-400 pt-1">
                          <template x-if="getSubtaskProgress(task)">
                            <span class="flex items-center gap-1" :title="'Subtasks: ' + getSubtaskProgress(task).done + ' of ' + getSubtaskProgress(task).total + ' done'">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                              </svg>
                              <span x-text="getSubtaskProgress(task).done + '/' + getSubtaskProgress(task).total"></span>
                            </span>
                          </template>
                          <template x-if="getOverdueSubtaskCount(task)">
                            <span class="text-red-500 font-medium" :title="getOverdueSubtaskCount(task) + ' overdue subtask(s)'"
                              x-text="getOverdueSubtaskCount(task) + ' overdue'"></span>
                          </template>
                          <template x-if="task._count?.attachments">
                            <span class="flex items-center gap-1" :title="task._count.attachments + ' attachment(s)'">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                              </svg>
                              <span x-text="task._count.attachments"></span>
                            </span>
                          </template>
                          <template x-if="task.blockerCount > 0">
                            <span class="flex items-center gap-1 font-medium"
                              :class="task.incompleteBlockerCount > 0 ? 'text-red-600' : 'text-gray-400'"
                              :title="task.incompleteBlockerCount > 0 ? task.incompleteBlockerCount + ' incomplete blocker(s)' : 'Blocked by ' + task.blockerCount + ' task(s) (all done)'">
                              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                              </svg>
                              <span x-text="task.blockerCount"></span>
                            </span>
                          </template>
                        </div>
                      </template>

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
                    <p class="text-sm font-semibold text-gray-900 leading-snug break-words mb-2" x-text="task.title"></p>
                    <div class="flex items-center flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500 mb-2">
                      <template x-if="getTaskAssigneeUsers(task).length">
                        <div class="flex items-center gap-1.5" :title="getTaskAssigneeNames(task)">
                          <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                            <span class="text-[9px] font-medium text-gray-600"
                              x-text="(getTaskAssigneeUsers(task)[0]?.firstName?.[0] || '') + (getTaskAssigneeUsers(task)[0]?.lastName?.[0] || getTaskAssigneeUsers(task)[0]?.username?.[0] || '')"></span>
                          </div>
                          <span class="text-gray-700 font-medium" x-text="getTaskPrimaryAssigneeShort(task)"></span>
                        </div>
                      </template>
                      <span class="text-gray-300">·</span>
                      <span class="flex items-center gap-1">
                        <span :class="getPriorityDotClass(task.priority)" class="w-1.5 h-1.5 rounded-full"></span>
                        <span x-text="getPriorityLabel(task.priority)"></span>
                      </span>
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
            <div class="hidden md:block border border-gray-200 rounded-lg overflow-hidden">
              <table class="min-w-full">
                <thead class="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th class="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">Status</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">Priority</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-40">Assignee</th>
                    <th class="px-4 py-2.5 text-left text-[11px] font-medium text-gray-500 uppercase tracking-wider w-28">Due</th>
                  </tr>
                </thead>
                <tbody>
                  <template x-for="row in getTaskListRows()" :key="row.rowKey">
                    <tr :class="row.type === 'header' ? 'bg-gray-50/70 border-y border-gray-200 cursor-pointer hover:bg-gray-100/70' : 'hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100'"
                      @click="row.type === 'header' ? toggleTaskGroup(row.group.key) : openTaskDetail(row.task.id)">
                      <template x-if="row.type === 'header'">
                        <td colspan="5" class="px-4 py-2">
                          <div class="flex items-center gap-2">
                            <svg class="w-3 h-3 text-gray-400 transition-transform"
                              :class="taskCollapsedGroups[row.group.key] ? '-rotate-90' : ''"
                              fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                            <span class="text-xs font-semibold text-gray-700 uppercase tracking-wide" x-text="row.group.label"></span>
                            <span class="text-[11px] text-gray-400" x-text="row.group.tasks.length"></span>
                          </div>
                        </td>
                      </template>
                      <template x-if="row.type === 'task'">
                        <td class="px-4 py-2.5">
                          <div class="flex flex-col gap-0.5 min-w-0">
                            <div class="flex items-center gap-2 min-w-0 flex-wrap">
                              <span class="text-sm text-gray-900 font-medium" x-text="row.task.title"></span>
                              <template x-if="getSubtaskProgress(row.task)">
                                <span class="inline-flex items-center gap-1 text-[10px] text-gray-400" :title="'Subtasks: ' + getSubtaskProgress(row.task).done + ' of ' + getSubtaskProgress(row.task).total">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                                  </svg>
                                  <span x-text="getSubtaskProgress(row.task).done + '/' + getSubtaskProgress(row.task).total"></span>
                                </span>
                              </template>
                              <template x-if="row.task._count?.attachments">
                                <span class="inline-flex items-center gap-0.5 text-[10px] text-gray-400" :title="row.task._count.attachments + ' attachment(s)'">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                                  </svg>
                                  <span x-text="row.task._count.attachments"></span>
                                </span>
                              </template>
                              <template x-if="row.task.blockerCount > 0">
                                <span class="inline-flex items-center gap-0.5 text-[10px] font-medium"
                                  :class="row.task.incompleteBlockerCount > 0 ? 'text-red-600' : 'text-gray-400'"
                                  :title="row.task.incompleteBlockerCount > 0 ? row.task.incompleteBlockerCount + ' incomplete blocker(s)' : 'Blocked by ' + row.task.blockerCount + ' task(s) (all done)'">
                                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                                  </svg>
                                  <span x-text="row.task.blockerCount"></span>
                                </span>
                              </template>
                              <template x-if="row.task._count?.comments">
                                <span class="text-[10px] text-gray-400" :title="row.task._count.comments + ' comment(s)'" x-text="row.task._count.comments + ' c'"></span>
                              </template>
                            </div>
                            <div class="flex items-center gap-2 min-w-0">
                              <template x-if="row.task.goal">
                                <button @click.stop="openGoalDetail(row.task.goal.id)"
                                  class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[10px] font-medium max-w-full shrink-0">
                                  <svg class="w-2.5 h-2.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z M12 13a1 1 0 100-2 1 1 0 000 2z"/>
                                  </svg>
                                  <span class="truncate" x-text="row.task.goal.title"></span>
                                </button>
                              </template>
                              <template x-if="row.task.tags && row.task.tags.length">
                                <div class="text-[11px] text-gray-400 truncate" x-text="row.task.tags.join(' · ')"></div>
                              </template>
                            </div>
                          </div>
                        </td>
                      </template>
                      <template x-if="row.type === 'task'">
                        <td class="px-4 py-2.5 w-28">
                          <span :class="getStatusBadgeClass(row.task.status)"
                            class="inline-flex px-2 py-0.5 rounded text-[11px] font-medium"
                            x-text="formatStatusLabel(row.task.status)"></span>
                        </td>
                      </template>
                      <template x-if="row.type === 'task'">
                        <td class="px-4 py-2.5 w-28">
                          <span class="inline-flex items-center gap-1.5 text-xs text-gray-700">
                            <span :class="getPriorityDotClass(row.task.priority)" class="w-1.5 h-1.5 rounded-full"></span>
                            <span x-text="getPriorityLabel(row.task.priority)"></span>
                          </span>
                        </td>
                      </template>
                      <template x-if="row.type === 'task'">
                        <td class="px-4 py-2.5 w-40">
                          <template x-if="getTaskAssigneeUsers(row.task).length">
                            <div class="flex items-center gap-2 min-w-0" :title="getTaskAssigneeNames(row.task)">
                              <div class="flex -space-x-1.5 shrink-0">
                                <template x-for="u in getTaskAssigneeUsers(row.task).slice(0, 3)" :key="u.id">
                                  <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center ring-2 ring-white shrink-0">
                                    <span class="text-[9px] font-medium text-gray-600"
                                      x-text="(u.firstName?.[0] || '') + (u.lastName?.[0] || u.username?.[0] || '')"></span>
                                  </div>
                                </template>
                              </div>
                              <span class="text-xs text-gray-700 truncate"
                                x-text="getTaskAssigneeUsers(row.task).length === 1 ? getTaskPrimaryAssigneeShort(row.task) : getTaskPrimaryAssigneeShort(row.task) + ' +' + (getTaskAssigneeUsers(row.task).length - 1)"></span>
                            </div>
                          </template>
                          <template x-if="!getTaskAssigneeUsers(row.task).length">
                            <span class="text-xs text-gray-300 italic">Unassigned</span>
                          </template>
                        </td>
                      </template>
                      <template x-if="row.type === 'task'">
                        <td class="px-4 py-2.5 w-28">
                          <template x-if="row.task.dueDate">
                            <span :class="getTaskDueClass(row.task.dueDate, row.task.status)" class="text-xs"
                              x-text="getTaskDueLabel(row.task.dueDate)"></span>
                          </template>
                        </td>
                      </template>
                    </tr>
                  </template>
                  <template x-if="getFilteredTasks().length === 0">
                    <tr>
                      <td colspan="5" class="px-4 py-12 text-center text-sm text-gray-400">
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
                    <span x-text="getTaskAssigneeNames(task)"></span>
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
