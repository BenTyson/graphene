export function getGoalDetailPanelHtml() {
  return `
    <div x-show="showGoalDetail" x-cloak
      x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      @keydown.escape.window="showGoalDetail && closeGoalDetail()"
      class="fixed inset-0 z-40">
      <div class="absolute inset-0 bg-black/30" @click="closeGoalDetail()"></div>
      <div x-show="showGoalDetail"
        x-transition:enter="transform transition ease-out duration-300"
        x-transition:enter-start="translate-x-full"
        x-transition:enter-end="translate-x-0"
        x-transition:leave="transform transition ease-in duration-200"
        x-transition:leave-start="translate-x-0"
        x-transition:leave-end="translate-x-full"
        class="absolute top-0 right-0 h-full w-full md:w-[640px] bg-white shadow-xl overflow-y-auto"
        @click.stop>

        <template x-if="selectedGoal">
          <div>
            <!-- Header -->
            <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
              <div class="flex items-start justify-between gap-3">
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 mb-1">
                    <span :class="getGoalStatusBadgeClass(selectedGoal.status)" class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium uppercase tracking-wide"
                      x-text="getGoalStatusLabel(selectedGoal.status)"></span>
                    <span class="text-[11px] text-gray-400">Goal</span>
                  </div>
                  <h2 class="text-lg font-semibold text-gray-900 leading-snug" x-text="selectedGoal.title"></h2>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button @click="openEditGoalForm(selectedGoal)" class="p-1.5 text-gray-400 hover:text-gray-700" title="Edit">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                    </svg>
                  </button>
                  <button @click="closeGoalDetail()" class="p-1.5 text-gray-400 hover:text-gray-600">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <!-- Body -->
            <div class="px-6 py-5 space-y-5">
              <!-- Description -->
              <template x-if="selectedGoal.description">
                <div>
                  <p class="text-sm text-gray-700 whitespace-pre-line" x-text="selectedGoal.description"></p>
                </div>
              </template>

              <!-- Progress -->
              <div>
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                  <span>Progress</span>
                  <span>
                    <span class="font-semibold text-gray-700" x-text="selectedGoal.taskCounts.done + ' / ' + selectedGoal.taskCounts.total"></span>
                    tasks done · <span class="font-semibold text-gray-700" x-text="selectedGoal.progress + '%'"></span>
                  </span>
                </div>
                <div class="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div :class="getGoalProgressColor(selectedGoal)" class="h-full rounded-full transition-all"
                    :style="'width:' + selectedGoal.progress + '%'"></div>
                </div>
              </div>

              <!-- Meta grid -->
              <div class="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <div>
                  <div class="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Champion</div>
                  <template x-if="selectedGoal.owner">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                        <span class="text-[10px] font-medium text-gray-600"
                          x-text="(selectedGoal.owner.firstName?.[0] || '') + (selectedGoal.owner.lastName?.[0] || selectedGoal.owner.username?.[0] || '')"></span>
                      </div>
                      <span class="text-gray-700"
                        x-text="(selectedGoal.owner.firstName || '') + ' ' + (selectedGoal.owner.lastName || selectedGoal.owner.username)"></span>
                    </div>
                  </template>
                  <template x-if="!selectedGoal.owner">
                    <span class="text-gray-300 italic">No champion</span>
                  </template>
                </div>
                <div>
                  <div class="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Target Date</div>
                  <template x-if="selectedGoal.targetDate">
                    <span :class="getTaskDueClass(selectedGoal.targetDate, selectedGoal.status === 'ACHIEVED' ? 'DONE' : selectedGoal.status)" class="text-gray-700"
                      x-text="getTaskDueLabel(selectedGoal.targetDate)"></span>
                  </template>
                  <template x-if="!selectedGoal.targetDate">
                    <span class="text-gray-300 italic">No target</span>
                  </template>
                </div>
                <div class="col-span-2">
                  <div class="text-[11px] uppercase tracking-wide text-gray-400 mb-1">Tags</div>
                  <template x-if="selectedGoal.tags && selectedGoal.tags.length">
                    <div class="flex flex-wrap gap-1">
                      <template x-for="tag in selectedGoal.tags" :key="tag">
                        <span class="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[11px]" x-text="tag"></span>
                      </template>
                    </div>
                  </template>
                  <template x-if="!selectedGoal.tags || !selectedGoal.tags.length">
                    <span class="text-gray-300 italic text-sm">No tags</span>
                  </template>
                </div>
              </div>

              <!-- Status quick-change -->
              <div>
                <div class="text-[11px] uppercase tracking-wide text-gray-400 mb-1.5">Change Status</div>
                <div class="flex flex-wrap gap-1.5">
                  <template x-for="s in ['ACTIVE','ON_HOLD','ACHIEVED','ABANDONED']" :key="s">
                    <button @click="updateGoalInline(selectedGoal.id, 'status', s)"
                      :class="selectedGoal.status === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
                      class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
                      x-text="getGoalStatusLabel(s)"></button>
                  </template>
                </div>
              </div>

              <!-- Tasks under this goal -->
              <div>
                <div class="flex items-center justify-between mb-2">
                  <div class="text-sm font-semibold text-gray-700">
                    Tasks
                    <span class="text-xs font-normal text-gray-400 ml-1" x-text="'(' + (selectedGoal.tasks?.length || 0) + ')'"></span>
                  </div>
                  <button @click="(() => { openTaskForm(); taskForm.goalId = selectedGoal.id; })()"
                    class="text-xs text-gray-500 hover:text-gray-900 underline">+ Add task to this goal</button>
                </div>

                <template x-if="!selectedGoal.tasks || !selectedGoal.tasks.length">
                  <div class="border border-dashed border-gray-200 rounded-md p-6 text-center">
                    <p class="text-xs text-gray-400 mb-1">No tasks linked yet</p>
                    <p class="text-[11px] text-gray-400">Create a task and assign it to this goal, or set the goal on existing tasks.</p>
                  </div>
                </template>

                <template x-if="selectedGoal.tasks && selectedGoal.tasks.length">
                  <div class="border border-gray-200 rounded-md divide-y divide-gray-100 overflow-hidden">
                    <template x-for="task in selectedGoal.tasks" :key="task.id">
                      <div @click="openTaskDetail(task.id)"
                        class="px-3 py-2.5 hover:bg-gray-50 cursor-pointer flex items-center gap-3">
                        <span :class="getStatusBadgeClass(task.status)" class="inline-flex shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium uppercase"
                          x-text="formatStatusLabel(task.status)"></span>
                        <div class="flex-1 min-w-0">
                          <div class="text-sm text-gray-900 font-medium truncate" x-text="task.title"></div>
                          <div class="flex items-center gap-2 text-[11px] text-gray-500 mt-0.5">
                            <span class="flex items-center gap-1">
                              <span :class="getPriorityDotClass(task.priority)" class="w-1.5 h-1.5 rounded-full"></span>
                              <span x-text="getPriorityLabel(task.priority)"></span>
                            </span>
                            <template x-if="task.dueDate">
                              <span class="flex items-center gap-1">
                                <span class="text-gray-300">·</span>
                                <span :class="getTaskDueClass(task.dueDate, task.status)" x-text="getTaskDueLabel(task.dueDate)"></span>
                              </span>
                            </template>
                            <template x-if="getTaskAssigneeUsers(task).length">
                              <span class="flex items-center gap-1">
                                <span class="text-gray-300">·</span>
                                <span x-text="getTaskPrimaryAssigneeShort(task) + (getTaskAssigneeUsers(task).length > 1 ? ' +' + (getTaskAssigneeUsers(task).length - 1) : '')"></span>
                              </span>
                            </template>
                          </div>
                        </div>
                        <button @click.stop="unlinkTaskFromGoal(selectedGoal.id, task.id)"
                          class="opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-red-600" title="Unlink from goal">
                          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101"/>
                          </svg>
                        </button>
                      </div>
                    </template>
                  </div>
                </template>
              </div>

              <!-- Created -->
              <div class="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                Created by <span x-text="(selectedGoal.createdBy?.firstName || '') + ' ' + (selectedGoal.createdBy?.lastName || selectedGoal.createdBy?.username || '')"></span>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  `;
}
