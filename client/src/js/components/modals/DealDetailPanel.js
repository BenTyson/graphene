export function getDealDetailPanelHtml() {
  return `
  <div x-show="showDealDetail" x-cloak class="fixed inset-0 z-50 flex justify-end">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/30" @click="closeDealDetail()"></div>

    <!-- Panel -->
    <div class="relative bg-white w-full max-w-xl shadow-xl overflow-y-auto"
         x-show="showDealDetail"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="translate-x-full"
         x-transition:enter-end="translate-x-0"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="translate-x-0"
         x-transition:leave-end="translate-x-full"
         @keydown.escape.window="closeDealDetail()">

      <template x-if="selectedDeal">
        <div>
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 truncate" x-text="selectedDeal.title"></h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getStageBadgeClass(selectedDeal.stage)" x-text="getStageLabel(selectedDeal.stage)"></span>
                </div>
              </div>
              <div class="flex items-center gap-1 ml-3">
                <button @click="openEditDealForm(selectedDeal)" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                </button>
                <button @click="deleteDeal(selectedDeal.id)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
                <button @click="closeDealDetail()" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Close">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 space-y-6">
            <!-- Lead Info -->
            <div class="space-y-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lead Info</h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span class="text-gray-400 text-xs">Stage</span>
                  <select @change="updateDealInline(selectedDeal.id, 'stage', $event.target.value)" class="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900">
                    <template x-for="stage in getPipelineStages()" :key="stage.key">
                      <option :value="stage.key" :selected="stage.key === selectedDeal.stage" x-text="stage.label"></option>
                    </template>
                  </select>
                </div>
                <div>
                  <span class="text-gray-400 text-xs">Owner</span>
                  <select @change="updateDealInline(selectedDeal.id, 'ownerId', $event.target.value)" class="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900">
                    <option value="">Unassigned</option>
                    <template x-for="owner in pipelineOwners" :key="owner.id">
                      <option :value="owner.id" :selected="owner.id === selectedDeal.ownerId" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
                    </template>
                  </select>
                </div>
              </div>

              <!-- Lost Reason -->
              <div x-show="selectedDeal.stage === 'LOST' || selectedDeal.stage === 'PASSED'">
                <span class="text-gray-400 text-xs">Reason</span>
                <div x-show="selectedDeal.lostReason" class="text-sm text-gray-700 mt-0.5" x-text="selectedDeal.lostReason"></div>
                <div x-show="!selectedDeal.lostReason" class="text-sm text-gray-400 mt-0.5">No reason provided</div>
              </div>

              <!-- Description -->
              <div x-show="selectedDeal.description">
                <span class="text-gray-400 text-xs">Description</span>
                <p class="text-sm text-gray-700 mt-0.5 whitespace-pre-wrap" x-text="selectedDeal.description"></p>
              </div>

              <!-- Tags -->
              <div x-show="selectedDeal.tags?.length > 0" class="flex flex-wrap gap-1.5">
                <template x-for="tag in selectedDeal.tags" :key="tag">
                  <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full" x-text="tag"></span>
                </template>
              </div>

              <!-- Timestamps -->
              <div class="text-xs text-gray-400 space-y-0.5">
                <div>Created <span x-text="new Date(selectedDeal.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })"></span></div>
                <div x-show="selectedDeal.closedAt">Closed <span x-text="new Date(selectedDeal.closedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })"></span></div>
              </div>
            </div>

            <!-- Linked Contact -->
            <div x-show="selectedDeal.contact">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Contact</h4>
              <div @click="openContactDetail(selectedDeal.contact?.id)" class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <div class="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600" x-text="selectedDeal.contact?.name?.[0]?.toUpperCase() || '?'"></div>
                <div>
                  <div class="text-sm font-medium text-gray-900" x-text="selectedDeal.contact?.name"></div>
                  <div class="text-xs text-gray-500">
                    <span x-text="selectedDeal.contact?.companyContact?.name || ''"></span>
                    <span x-show="selectedDeal.contact?.email"> &middot; <span x-text="selectedDeal.contact?.email"></span></span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div>
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity</h4>

              <!-- Add Activity Form -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex gap-2 mb-2">
                  <select x-model="dealActivityForm.action" class="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-gray-900">
                    <option value="note_added">Note</option>
                    <option value="call_logged">Call</option>
                    <option value="email_sent">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <textarea x-model="dealActivityForm.content" rows="2" placeholder="Log activity..." class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"></textarea>
                  <button @click="addDealActivity()" :disabled="!dealActivityForm.content?.trim()" class="self-end px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50">Log</button>
                </div>
              </div>

              <!-- Timeline -->
              <div class="space-y-3">
                <template x-for="activity in (selectedDeal.activities || [])" :key="activity.id">
                  <div class="flex gap-3">
                    <div class="flex-shrink-0 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                      <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5">
                        <path stroke-linecap="round" stroke-linejoin="round" :d="getActivityIcon(activity.action)"/>
                      </svg>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="text-xs font-medium text-gray-700" x-text="formatActivityAction(activity.action)"></span>
                        <span class="text-[10px] text-gray-400" x-text="activity.user ? ([activity.user.firstName, activity.user.lastName].filter(Boolean).join(' ') || activity.user.username) : ''"></span>
                        <span class="text-[10px] text-gray-400" x-text="new Date(activity.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })"></span>
                      </div>
                      <div x-show="activity.content" class="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap" x-text="activity.content"></div>
                      <div x-show="activity.fromValue && activity.toValue" class="text-xs text-gray-400 mt-0.5">
                        <span x-text="activity.fromValue"></span> &rarr; <span x-text="activity.toValue"></span>
                      </div>
                    </div>
                  </div>
                </template>
                <div x-show="!selectedDeal.activities?.length" class="text-sm text-gray-400 py-2">No activity yet</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  `;
}
