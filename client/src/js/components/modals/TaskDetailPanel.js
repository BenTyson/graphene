export function getTaskDetailPanelHtml() {
  return `
    <!-- Backdrop -->
    <div x-show="showTaskDetail" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      class="fixed inset-0 bg-black/30 z-50"
      @click="closeTaskDetail()">
    </div>

    <!-- Panel -->
    <div x-show="showTaskDetail" x-cloak
      x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="translate-x-full"
      x-transition:enter-end="translate-x-0"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="translate-x-0"
      x-transition:leave-end="translate-x-full"
      class="fixed right-0 top-0 h-full w-full md:w-[480px] lg:w-[560px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
      @click.stop>

      <template x-if="selectedTask">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="shrink-0 border-b border-gray-200 px-6 py-4">
            <div class="flex items-start justify-between gap-3">
              <h2 class="text-lg font-semibold text-gray-900 flex-1" x-text="selectedTask.title"></h2>
              <div class="flex items-center gap-1 shrink-0">
                <button @click="openEditTaskForm(selectedTask)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button @click="deleteTask(selectedTask.id)"
                  class="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
                <button @click="closeTaskDetail()"
                  class="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Close">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Scrollable Content -->
          <div class="flex-1 overflow-y-auto">
            <!-- Metadata -->
            <div class="px-6 py-4 border-b border-gray-100 space-y-3">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Status</label>
                  <select :value="selectedTask.status"
                    @change="updateTaskInline(selectedTask.id, 'status', $event.target.value)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="IN_REVIEW">In Review</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Priority</label>
                  <select :value="selectedTask.priority"
                    @change="updateTaskInline(selectedTask.id, 'priority', $event.target.value)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Assignee</label>
                  <select :value="selectedTask.assigneeId || ''"
                    @change="updateTaskInline(selectedTask.id, 'assigneeId', $event.target.value || null)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                    <option value="">Unassigned</option>
                    <template x-for="user in taskAssignees" :key="user.id">
                      <option :value="user.id" x-text="(user.firstName || '') + ' ' + (user.lastName || user.username)"></option>
                    </template>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Due Date</label>
                  <input type="date" :value="selectedTask.dueDate || ''"
                    @change="updateTaskInline(selectedTask.id, 'dueDate', $event.target.value || null)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
              </div>

              <!-- Created by / date -->
              <div class="flex items-center gap-4 text-[11px] text-gray-400 pt-1">
                <span>Created by <span class="text-gray-600" x-text="selectedTask.creator ? ((selectedTask.creator.firstName || '') + ' ' + (selectedTask.creator.lastName || selectedTask.creator.username)) : 'Unknown'"></span></span>
                <span x-text="selectedTask.createdAt ? new Date(selectedTask.createdAt).toLocaleDateString() : ''"></span>
              </div>
            </div>

            <!-- Description -->
            <template x-if="selectedTask.description">
              <div class="px-6 py-4 border-b border-gray-100">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Description</h4>
                <p class="text-sm text-gray-700 whitespace-pre-wrap" x-text="selectedTask.description"></p>
              </div>
            </template>

            <!-- Tags -->
            <template x-if="selectedTask.tags && selectedTask.tags.length">
              <div class="px-6 py-3 border-b border-gray-100">
                <div class="flex flex-wrap gap-1.5">
                  <template x-for="tag in selectedTask.tags" :key="tag">
                    <span class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs" x-text="tag"></span>
                  </template>
                </div>
              </div>
            </template>

            <!-- Subtasks -->
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Subtasks</h4>
                  <template x-if="selectedTask.subtasks?.length">
                    <span class="text-[10px] text-gray-400"
                      x-text="selectedTask.subtasks.filter(s => s.status === 'DONE').length + '/' + selectedTask.subtasks.length"></span>
                  </template>
                </div>
                <button @click="addSubtask(selectedTask.id)"
                  class="text-xs text-gray-500 hover:text-gray-700 font-medium">+ Add</button>
              </div>

              <!-- Progress bar -->
              <template x-if="selectedTask.subtasks?.length">
                <div class="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div class="h-full bg-green-500 rounded-full transition-all"
                    :style="'width:' + Math.round((selectedTask.subtasks.filter(s => s.status === 'DONE').length / selectedTask.subtasks.length) * 100) + '%'"></div>
                </div>
              </template>

              <div class="space-y-1">
                <template x-for="sub in selectedTask.subtasks || []" :key="sub.id">
                  <div class="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 group">
                    <button @click="toggleSubtaskDone(sub)"
                      :class="sub.status === 'DONE' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-gray-400'"
                      class="w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors">
                      <template x-if="sub.status === 'DONE'">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
                        </svg>
                      </template>
                    </button>
                    <span :class="sub.status === 'DONE' ? 'line-through text-gray-400' : 'text-gray-700'"
                      class="text-sm flex-1" x-text="sub.title"></span>
                    <template x-if="sub.assignee">
                      <div class="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-[8px] font-medium text-gray-500"
                          x-text="(sub.assignee.firstName?.[0] || '') + (sub.assignee.lastName?.[0] || '')"></span>
                      </div>
                    </template>
                  </div>
                </template>
                <template x-if="!selectedTask.subtasks?.length">
                  <p class="text-xs text-gray-400 py-2">No subtasks yet</p>
                </template>
              </div>
            </div>

            <!-- Comments -->
            <div class="px-6 py-4 border-b border-gray-100">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Comments
                <template x-if="selectedTask.comments?.length">
                  <span class="text-gray-400 font-normal" x-text="'(' + selectedTask.comments.length + ')'"></span>
                </template>
              </h4>

              <div class="space-y-3 mb-4">
                <template x-for="comment in selectedTask.comments || []" :key="comment.id">
                  <div class="group">
                    <div class="flex items-start gap-2">
                      <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center shrink-0 mt-0.5">
                        <span class="text-[9px] font-medium text-gray-600"
                          x-text="(comment.author?.firstName?.[0] || '') + (comment.author?.lastName?.[0] || '')"></span>
                      </div>
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2 mb-0.5">
                          <span class="text-xs font-medium text-gray-700"
                            x-text="(comment.author?.firstName || '') + ' ' + (comment.author?.lastName || comment.author?.username || '')"></span>
                          <span class="text-[10px] text-gray-400" x-text="new Date(comment.createdAt).toLocaleDateString()"></span>
                          <button @click="deleteTaskComment(comment.id)"
                            class="text-[10px] text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                            delete
                          </button>
                        </div>
                        <p class="text-sm text-gray-600 whitespace-pre-wrap" x-text="comment.content"></p>
                      </div>
                    </div>
                  </div>
                </template>
                <template x-if="!selectedTask.comments?.length">
                  <p class="text-xs text-gray-400">No comments yet</p>
                </template>
              </div>

              <!-- Add comment -->
              <div class="flex gap-2">
                <input type="text" x-model="taskCommentForm.content"
                  @keydown.enter.prevent="addTaskComment()"
                  class="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Write a comment...">
                <button @click="addTaskComment()" :disabled="!taskCommentForm.content.trim()"
                  class="px-3 py-2 text-sm bg-black text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  Send
                </button>
              </div>
            </div>

            <!-- Activity Log -->
            <div class="px-6 py-4">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Activity</h4>
              <div class="space-y-2">
                <template x-for="activity in selectedTask.activities || []" :key="activity.id">
                  <div class="flex items-start gap-2 text-xs text-gray-500">
                    <div class="w-1.5 h-1.5 rounded-full bg-gray-300 mt-1.5 shrink-0"></div>
                    <div class="flex-1">
                      <span class="font-medium text-gray-600"
                        x-text="(activity.user?.firstName || '') + ' ' + (activity.user?.lastName || activity.user?.username || '')"></span>
                      <span x-text="
                        activity.action === 'created' ? ' created this task' :
                        activity.action === 'status_changed' ? ' changed status to ' + (activity.toValue || '') :
                        activity.action === 'assigned' ? ' assigned this task' :
                        activity.action === 'priority_changed' ? ' changed priority to ' + (activity.toValue || '') :
                        activity.action === 'due_date_changed' ? ' changed due date' :
                        activity.action === 'comment_added' ? ' added a comment' :
                        activity.action === 'edited' ? ' edited the title' :
                        ' ' + activity.action
                      "></span>
                      <span class="text-gray-400 ml-1" x-text="new Date(activity.createdAt).toLocaleDateString()"></span>
                    </div>
                  </div>
                </template>
                <template x-if="!selectedTask.activities?.length">
                  <p class="text-xs text-gray-400">No activity yet</p>
                </template>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  `;
}
