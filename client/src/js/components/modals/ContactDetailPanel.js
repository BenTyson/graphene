export function getContactDetailPanelHtml() {
  return `
  <div x-show="showContactDetail" x-cloak class="fixed inset-0 z-50 flex justify-end">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/30" @click="closeContactDetail()"></div>

    <!-- Panel -->
    <div class="relative bg-white w-full max-w-xl shadow-xl overflow-y-auto"
         x-show="showContactDetail"
         x-transition:enter="transition ease-out duration-200"
         x-transition:enter-start="translate-x-full"
         x-transition:enter-end="translate-x-0"
         x-transition:leave="transition ease-in duration-150"
         x-transition:leave-start="translate-x-0"
         x-transition:leave-end="translate-x-full"
         @keydown.escape.window="closeContactDetail()">

      <template x-if="selectedContact">
        <div>
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div class="flex items-start justify-between">
              <div class="flex-1 min-w-0">
                <h3 class="text-lg font-semibold text-gray-900 truncate" x-text="selectedContact.name"></h3>
                <div class="flex items-center gap-2 mt-1">
                  <span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600" x-text="selectedContact.contactKind === 'COMPANY' ? 'Company' : 'Person'"></span>
                  <span x-show="selectedContact.contactType" class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getContactTypeBadgeClass(selectedContact.contactType)" x-text="getContactTypeLabel(selectedContact.contactType)"></span>
                  <span x-show="selectedContact.stage" class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getStageBadgeClass(selectedContact.stage)" x-text="getStageLabel(selectedContact.stage)"></span>
                </div>
              </div>
              <div class="flex items-center gap-1 ml-3">
                <button @click="openEditContactForm(selectedContact)" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Edit">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"/></svg>
                </button>
                <button @click="deleteContact(selectedContact.id)" class="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"/></svg>
                </button>
                <button @click="closeContactDetail()" class="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100" title="Close">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 space-y-6">
            <!-- Company link (for Person contacts) -->
            <div x-show="selectedContact.contactKind === 'PERSON' && selectedContact.companyContact" class="mb-2">
              <div @click="openContactDetail(selectedContact.companyContact?.id)" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer text-sm">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/></svg>
                <span class="text-gray-700 font-medium" x-text="selectedContact.companyContact?.name"></span>
              </div>
            </div>

            <!-- People (for Company contacts -- shown first, these ARE the contact details) -->
            <div x-show="selectedContact.contactKind === 'COMPANY'">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  People
                  <span x-show="selectedContact.people?.length" class="text-gray-400 font-normal" x-text="'(' + selectedContact.people.length + ')'"></span>
                </h4>
                <button @click="closeContactDetail(); openContactForm(); contactForm.companyId = selectedContact.id" class="text-xs text-gray-500 hover:text-gray-900 font-medium">+ Add Person</button>
              </div>
              <div class="space-y-1.5">
                <template x-for="person in (selectedContact.people || [])" :key="person.id">
                  <div @click="openContactDetail(person.id)" class="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <div>
                      <div class="text-sm font-medium text-gray-900" x-text="person.name"></div>
                      <div x-show="person.role" class="text-xs text-gray-500" x-text="person.role"></div>
                    </div>
                    <div x-show="person.email" class="text-xs text-gray-400" x-text="person.email"></div>
                  </div>
                </template>
                <div x-show="!selectedContact.people?.length" class="text-sm text-gray-400 py-2">No people linked yet</div>
              </div>
            </div>

            <!-- Contact Info / Company Info -->
            <div class="space-y-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider" x-text="selectedContact.contactKind === 'COMPANY' ? 'Company Info' : 'Contact Info'"></h4>
              <div class="grid grid-cols-2 gap-3 text-sm">
                <!-- Person fields -->
                <div x-show="selectedContact.contactKind === 'PERSON' && selectedContact.role">
                  <span class="text-gray-400 text-xs">Role</span>
                  <div class="text-gray-900" x-text="selectedContact.role"></div>
                </div>
                <div x-show="selectedContact.contactKind === 'PERSON' && selectedContact.email">
                  <span class="text-gray-400 text-xs">Email</span>
                  <div><a :href="'mailto:' + selectedContact.email" class="text-blue-600 hover:underline text-sm" x-text="selectedContact.email"></a></div>
                </div>
                <div x-show="selectedContact.contactKind === 'PERSON' && selectedContact.phone">
                  <span class="text-gray-400 text-xs">Phone</span>
                  <div><a :href="'tel:' + selectedContact.phone" class="text-blue-600 hover:underline text-sm" x-text="selectedContact.phone"></a></div>
                </div>

                <!-- Company backup fields -->
                <div x-show="selectedContact.contactKind === 'COMPANY' && selectedContact.email">
                  <span class="text-gray-400 text-xs">General Email</span>
                  <div><a :href="'mailto:' + selectedContact.email" class="text-blue-600 hover:underline text-sm" x-text="selectedContact.email"></a></div>
                </div>
                <div x-show="selectedContact.contactKind === 'COMPANY' && selectedContact.website">
                  <span class="text-gray-400 text-xs">Website</span>
                  <div><a :href="selectedContact.website" target="_blank" class="text-blue-600 hover:underline text-sm" x-text="selectedContact.website.replace(/^https?:\\/\\//, '')"></a></div>
                </div>

                <!-- Shared fields -->
                <div x-show="selectedContact.source">
                  <span class="text-gray-400 text-xs">Source</span>
                  <div class="text-gray-900" x-text="selectedContact.source"></div>
                </div>
                <div>
                  <span class="text-gray-400 text-xs">Owner</span>
                  <select @change="updateContactInline(selectedContact.id, 'ownerId', $event.target.value)" class="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900">
                    <option value="">Unassigned</option>
                    <template x-for="owner in pipelineOwners" :key="owner.id">
                      <option :value="owner.id" :selected="owner.id === selectedContact.ownerId" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
                    </template>
                  </select>
                </div>
                <div>
                  <span class="text-gray-400 text-xs">Follow-up</span>
                  <input type="date" :value="selectedContact.nextFollowUpAt || ''" @change="updateContactInline(selectedContact.id, 'nextFollowUpAt', $event.target.value)" class="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900">
                </div>
              </div>

              <!-- Links (Person only -- Company website shown above) -->
              <div x-show="selectedContact.contactKind === 'PERSON' && (selectedContact.linkedInUrl || selectedContact.website)" class="flex gap-3">
                <a x-show="selectedContact.linkedInUrl" :href="selectedContact.linkedInUrl" target="_blank" class="text-xs text-blue-600 hover:underline">LinkedIn</a>
                <a x-show="selectedContact.website" :href="selectedContact.website" target="_blank" class="text-xs text-blue-600 hover:underline">Website</a>
              </div>

              <!-- Tags -->
              <div x-show="selectedContact.tags?.length > 0" class="flex flex-wrap gap-1.5">
                <template x-for="tag in selectedContact.tags" :key="tag">
                  <span class="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full" x-text="tag"></span>
                </template>
              </div>

              <!-- Notes -->
              <div x-show="selectedContact.notes" class="bg-gray-50 rounded-lg p-3">
                <span class="text-xs font-medium text-gray-500">Notes</span>
                <p class="text-sm text-gray-700 mt-1 whitespace-pre-wrap" x-text="selectedContact.notes"></p>
              </div>
            </div>

            <!-- Pipeline Status -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pipeline</h4>
              </div>
              <!-- On pipeline -->
              <div x-show="selectedContact.stage" class="space-y-3">
                <div>
                  <span class="text-gray-400 text-xs">Card Title</span>
                  <input type="text" :value="selectedContact.pipelineTitle || ''" @keydown.enter="$event.target.blur()" @blur="if ($event.target.value !== (selectedContact.pipelineTitle || '')) updateContactInline(selectedContact.id, 'pipelineTitle', $event.target.value)" class="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900">
                </div>
                <div class="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span class="text-gray-400 text-xs">Stage</span>
                    <select @change="updateContactInline(selectedContact.id, 'stage', $event.target.value)" class="w-full mt-0.5 text-sm border border-gray-200 rounded px-2 py-1 focus:ring-1 focus:ring-gray-900">
                      <template x-for="stage in getPipelineStages(selectedContact.contactType)" :key="stage.key">
                        <option :value="stage.key" :selected="stage.key === selectedContact.stage" x-text="stage.label"></option>
                      </template>
                    </select>
                  </div>
                  <div>
                    <span class="text-gray-400 text-xs">Board</span>
                    <div class="mt-0.5 text-sm text-gray-900" x-text="getContactTypeLabel(selectedContact.contactType)"></div>
                  </div>
                </div>
                <div x-show="selectedContact.closedAt" class="text-xs text-gray-500">
                  Closed: <span x-text="new Date(selectedContact.closedAt).toLocaleDateString()"></span>
                </div>
                <button @click="removeFromPipeline(selectedContact.id)" class="text-xs text-red-600 hover:text-red-700 font-medium">Remove from Pipeline</button>
              </div>
              <!-- Not on pipeline -->
              <div x-show="!selectedContact.stage">
                <button @click="openAddToPipelineForContact(selectedContact.id)" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                  Add to Pipeline
                </button>
              </div>
            </div>

            <!-- Attachments -->
            <div>
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Attachments
                  <span x-show="selectedContact.attachments?.length" class="text-gray-400 font-normal" x-text="'(' + selectedContact.attachments.length + ')'"></span>
                </h4>
                <label class="text-xs text-gray-500 hover:text-gray-900 font-medium cursor-pointer">
                  + Upload
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.docx,.xlsx,.xls,.doc,.txt,.csv" @change="uploadContactAttachments($event.target.files)" class="hidden">
                </label>
              </div>
              <div x-show="contactAttachmentUploading" class="text-xs text-gray-500 py-2">Uploading...</div>
              <div class="space-y-1.5">
                <template x-for="att in (selectedContact.attachments || [])" :key="att.id">
                  <div class="flex items-center justify-between p-2 bg-gray-50 rounded-lg group">
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="px-1.5 py-0.5 text-[10px] font-bold uppercase bg-gray-200 text-gray-600 rounded" x-text="att.fileName.split('.').pop()"></span>
                      <div class="min-w-0">
                        <a :href="att.filePath" target="_blank" class="text-sm text-gray-900 hover:text-blue-600 truncate block" x-text="att.fileName"></a>
                        <div class="text-[10px] text-gray-400" x-text="(att.fileSize / 1024).toFixed(0) + ' KB'"></div>
                      </div>
                    </div>
                    <button @click.stop="deleteContactAttachment(att.id, att.fileName)" class="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </div>
                </template>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div>
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity</h4>

              <!-- Add Activity Form -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex gap-2 mb-2">
                  <select x-model="contactActivityForm.action" class="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:ring-1 focus:ring-gray-900">
                    <option value="note_added">Note</option>
                    <option value="call_logged">Call</option>
                    <option value="email_sent">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <textarea x-model="contactActivityForm.content" rows="2" placeholder="Log a note, call, email, or meeting..." class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900 resize-none"></textarea>
                  <button @click="addContactActivity()" :disabled="!contactActivityForm.content?.trim()" class="self-end px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50">Log</button>
                </div>
              </div>

              <!-- Timeline -->
              <div class="space-y-3">
                <template x-for="activity in (selectedContact.activities || [])" :key="activity.id">
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
                <div x-show="!selectedContact.activities?.length" class="text-sm text-gray-400 py-2">No activity yet</div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
  `;
}
