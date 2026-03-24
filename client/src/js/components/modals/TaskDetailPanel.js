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
      @click="closeTaskDetail()"
      @keydown.escape.window="!showAddTask && showTaskDetail && closeTaskDetail()">
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
                <button x-show="selectedTask.status !== 'ARCHIVED'" @click="archiveTask(selectedTask.id)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Archive">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
                  </svg>
                </button>
                <button x-show="selectedTask.status === 'ARCHIVED'" @click="unarchiveTask(selectedTask.id)"
                  class="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Unarchive">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
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
                    <option value="ARCHIVED">Archived</option>
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
                    <input type="date" :value="sub.dueDate || ''" @change="updateSubtaskDueDate(sub.id, $event.target.value)"
                      class="text-[11px] text-gray-400 border border-transparent hover:border-gray-200 focus:border-gray-300 rounded px-1 py-0.5 w-24 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                      :class="sub.dueDate ? '!opacity-100' : ''"
                      title="Due date">
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

            <!-- Tags -->
            <div class="px-6 py-3 border-b border-gray-100">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags</label>
              <div class="flex flex-wrap gap-1.5 mb-1.5">
                <template x-for="sysTag in ['Fundraising','Shareholders','Patents','Legal','Decks & Graphics','Notes & Research','Production','Finances','Sales','Administrative Ops','Proforma','Web & Marketing']" :key="sysTag">
                  <button type="button" @click="toggleDetailTaskTag(sysTag)"
                    :class="(selectedTask.tags || []).includes(sysTag) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-2 py-0.5 rounded text-xs font-medium transition-colors" x-text="sysTag"></button>
                </template>
              </div>
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 mt-2">Institutions</label>
              <div class="flex flex-wrap gap-1.5 mb-1.5">
                <template x-for="instTag in ['Curia','NEI','SpectraPower','GoEco','Positron Magnetics','GEIC','Apollo','EAG']" :key="instTag">
                  <button type="button" @click="toggleDetailTaskTag(instTag)"
                    :class="(selectedTask.tags || []).includes(instTag) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                    class="px-2 py-0.5 rounded text-xs font-medium transition-colors" x-text="instTag"></button>
                </template>
              </div>
              <template x-if="(selectedTask.tags || []).filter(t => !['Fundraising','Shareholders','Patents','Legal','Decks & Graphics','Notes & Research','Production','Finances','Sales','Administrative Ops','Proforma','Web & Marketing','Curia','NEI','SpectraPower','GoEco','Positron Magnetics','GEIC','Apollo','EAG'].includes(t)).length">
                <div class="flex flex-wrap gap-1.5 mt-1.5">
                  <template x-for="tag in (selectedTask.tags || []).filter(t => !['Fundraising','Shareholders','Patents','Legal','Decks & Graphics','Notes & Research','Production','Finances','Sales','Administrative Ops','Proforma','Web & Marketing','Curia','NEI','SpectraPower','GoEco','Positron Magnetics','GEIC','Apollo','EAG'].includes(t))" :key="tag">
                    <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                      <span x-text="tag"></span>
                      <button type="button" @click="toggleDetailTaskTag(tag)" class="text-gray-400 hover:text-gray-600">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                      </button>
                    </span>
                  </template>
                </div>
              </template>
            </div>

            <!-- Attachments -->
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</h4>
                  <template x-if="selectedTask.attachments?.length">
                    <span class="text-[10px] text-gray-400" x-text="'(' + selectedTask.attachments.length + ')'"></span>
                  </template>
                </div>
                <label class="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer">
                  + Add
                  <input type="file" multiple class="hidden" @change="uploadTaskAttachments($event.target.files); $event.target.value = ''"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.docx,.xlsx,.xls,.doc,.txt,.csv">
                </label>
              </div>

              <template x-if="taskAttachmentUploading">
                <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <div class="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Uploading...
                </div>
              </template>

              <div class="space-y-1.5">
                <template x-for="att in selectedTask.attachments || []" :key="att.id">
                  <div class="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 group">
                    <div class="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      <span class="text-[9px] font-bold text-gray-400 uppercase"
                        x-text="att.fileName.split('.').pop()"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-700 truncate" x-text="att.fileName"></p>
                      <p class="text-[10px] text-gray-400">
                        <span x-text="(att.uploadedBy?.firstName || '') + ' ' + (att.uploadedBy?.lastName || att.uploadedBy?.username || '')"></span>
                        <span class="mx-1">&middot;</span>
                        <span x-text="new Date(att.createdAt).toLocaleDateString()"></span>
                        <span class="mx-1">&middot;</span>
                        <span x-text="att.fileSize < 1024*1024 ? Math.round(att.fileSize/1024) + ' KB' : (att.fileSize/(1024*1024)).toFixed(1) + ' MB'"></span>
                      </p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a :href="att.filePath.startsWith('https://') ? att.filePath : '/uploads/' + att.filePath"
                        target="_blank" @click.stop class="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="View">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                      <button @click.stop="deleteTaskAttachment(att.id, att.fileName)"
                        class="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50" title="Delete">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                </template>
                <template x-if="!selectedTask.attachments?.length && !taskAttachmentUploading">
                  <p class="text-xs text-gray-400 py-1">No attachments</p>
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
                        activity.action === 'attachment_added' ? ' attached ' + (activity.toValue || 'a file') :
                        activity.action === 'attachment_removed' ? ' removed ' + (activity.fromValue || 'an attachment') :
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
