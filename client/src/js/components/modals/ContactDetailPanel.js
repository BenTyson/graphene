export function getContactDetailPanelHtml() {
  return `
    <!-- Backdrop -->
    <div x-show="showContactDetail" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      class="fixed inset-0 bg-black/30 z-50"
      @click="closeContactDetail()"
      @keydown.escape.window="!showAddContact && showContactDetail && closeContactDetail()">
    </div>

    <!-- Panel -->
    <div x-show="showContactDetail" x-cloak
      x-transition:enter="transition ease-out duration-300"
      x-transition:enter-start="translate-x-full"
      x-transition:enter-end="translate-x-0"
      x-transition:leave="transition ease-in duration-200"
      x-transition:leave-start="translate-x-0"
      x-transition:leave-end="translate-x-full"
      class="fixed right-0 top-0 h-full w-full md:w-[480px] lg:w-[560px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
      @click.stop>

      <template x-if="selectedContact">
        <div class="flex flex-col h-full">
          <!-- Header -->
          <div class="shrink-0 border-b border-gray-200 px-6 py-4">
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <input type="text" :value="selectedContact.name"
                  @blur="$event.target.value.trim() && $event.target.value.trim() !== selectedContact.name ? updateContactInline(selectedContact.id, 'name', $event.target.value.trim()) : ($event.target.value = selectedContact.name)"
                  @keydown.enter.prevent="$event.target.blur()"
                  class="w-full text-lg font-semibold text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-black rounded-md px-2 py-1 -mx-2 -my-1 truncate">
                <div class="flex items-center gap-2 mt-2 ml-0">
                  <span class="px-1.5 py-0.5 text-[10px] font-medium rounded-full bg-gray-100 text-gray-600" x-text="selectedContact.contactKind === 'COMPANY' ? 'Company' : 'Person'"></span>
                  <span x-show="selectedContact.contactType" class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getContactTypeBadgeClass(selectedContact.contactType)" x-text="getContactTypeLabel(selectedContact.contactType)"></span>
                  <span x-show="selectedContact.stage" class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getStageBadgeClass(selectedContact.stage)" x-text="getStageLabel(selectedContact.stage)"></span>
                </div>
              </div>
              <div class="flex items-center gap-1 shrink-0">
                <button @click="deleteContact(selectedContact.id)"
                  class="p-1.5 text-gray-400 hover:text-red-600 rounded hover:bg-red-50" title="Delete">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
                <button @click="closeContactDetail()"
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
            <!-- Company link (for Person contacts) -->
            <div x-show="selectedContact.contactKind === 'PERSON' && selectedContact.companyContact" class="px-6 pt-4">
              <div @click="openContactDetail(selectedContact.companyContact?.id)" class="flex items-center gap-2 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer text-sm">
                <svg class="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/></svg>
                <span class="text-gray-700 font-medium" x-text="selectedContact.companyContact?.name"></span>
              </div>
            </div>

            <!-- People (for Company contacts) -->
            <div x-show="selectedContact.contactKind === 'COMPANY'" class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between mb-2">
                <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  People
                  <span x-show="selectedContact.people?.length" class="text-gray-400 font-normal" x-text="'(' + selectedContact.people.length + ')'"></span>
                </h4>
                <button @click="openContactForm(); contactForm.companyId = selectedContact.id" class="text-xs text-gray-500 hover:text-gray-900 font-medium">+ Add Person</button>
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

            <!-- Metadata: Type, Owner, Follow-up -->
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Type</label>
                  <select :value="selectedContact.contactType || ''"
                    @change="updateContactInline(selectedContact.id, 'contactType', $event.target.value || null)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                    <option value="">None</option>
                    <option value="INVESTOR">Investor</option>
                    <option value="PARTNER">Partner</option>
                    <option value="CLIENT">Client</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Owner</label>
                  <select :value="selectedContact.ownerId || ''"
                    @change="updateContactInline(selectedContact.id, 'ownerId', $event.target.value || null)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                    <option value="">Unassigned</option>
                    <template x-for="owner in pipelineOwners" :key="owner.id">
                      <option :value="owner.id" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
                    </template>
                  </select>
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Follow-up</label>
                  <input type="date" :value="selectedContact.nextFollowUpAt || ''"
                    @change="($event.target.value || null) !== (selectedContact.nextFollowUpAt || null) && updateContactInline(selectedContact.id, 'nextFollowUpAt', $event.target.value || null)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Source</label>
                  <input type="text" :value="selectedContact.source || ''"
                    @blur="$event.target.value !== (selectedContact.source || '') && updateContactInline(selectedContact.id, 'source', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
              </div>
            </div>

            <!-- Contact details (Person) -->
            <div x-show="selectedContact.contactKind === 'PERSON'" class="px-6 py-4 border-b border-gray-100 space-y-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Contact Info</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Role</label>
                  <input type="text" :value="selectedContact.role || ''"
                    @blur="$event.target.value !== (selectedContact.role || '') && updateContactInline(selectedContact.id, 'role', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Phone</label>
                  <input type="tel" :value="selectedContact.phone || ''"
                    @blur="$event.target.value !== (selectedContact.phone || '') && updateContactInline(selectedContact.id, 'phone', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div class="col-span-2">
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Email</label>
                  <input type="email" :value="selectedContact.email || ''"
                    @blur="$event.target.value !== (selectedContact.email || '') && updateContactInline(selectedContact.id, 'email', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">LinkedIn</label>
                  <input type="url" :value="selectedContact.linkedInUrl || ''"
                    @blur="$event.target.value !== (selectedContact.linkedInUrl || '') && updateContactInline(selectedContact.id, 'linkedInUrl', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Website</label>
                  <input type="url" :value="selectedContact.website || ''"
                    @blur="$event.target.value !== (selectedContact.website || '') && updateContactInline(selectedContact.id, 'website', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
              </div>
            </div>

            <!-- Contact details (Company) -->
            <div x-show="selectedContact.contactKind === 'COMPANY'" class="px-6 py-4 border-b border-gray-100 space-y-3">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Info</h4>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">General Email</label>
                  <input type="email" :value="selectedContact.email || ''"
                    @blur="$event.target.value !== (selectedContact.email || '') && updateContactInline(selectedContact.id, 'email', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Website</label>
                  <input type="url" :value="selectedContact.website || ''"
                    @blur="$event.target.value !== (selectedContact.website || '') && updateContactInline(selectedContact.id, 'website', $event.target.value || null)"
                    @keydown.enter.prevent="$event.target.blur()"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="px-6 py-4 border-b border-gray-100">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Notes</h4>
              <textarea :value="selectedContact.notes || ''"
                @blur="$event.target.value !== (selectedContact.notes || '') && updateContactInline(selectedContact.id, 'notes', $event.target.value || null)"
                placeholder="Add notes..."
                rows="3"
                class="w-full text-sm text-gray-700 bg-transparent border border-transparent hover:border-gray-200 focus:border-gray-300 focus:outline-none focus:ring-1 focus:ring-black rounded-md p-2 resize-y"></textarea>
            </div>

            <!-- Tags -->
            <div class="px-6 py-3 border-b border-gray-100">
              <label class="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Tags</label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <template x-for="tag in (selectedContact.tags || [])" :key="tag">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs">
                    <span x-text="tag"></span>
                    <button type="button" @click="updateContactInline(selectedContact.id, 'tags', (selectedContact.tags || []).filter(t => t !== tag))" class="text-gray-400 hover:text-gray-600">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                    </button>
                  </span>
                </template>
                <template x-if="!(selectedContact.tags || []).length">
                  <span class="text-xs text-gray-400">No tags</span>
                </template>
              </div>
              <div class="flex gap-2">
                <input type="text" x-model="contactDetailTagInput"
                  @keydown.enter.prevent="contactDetailTagInput?.trim() && !((selectedContact.tags || []).includes(contactDetailTagInput.trim())) && (updateContactInline(selectedContact.id, 'tags', [...(selectedContact.tags || []), contactDetailTagInput.trim()]), contactDetailTagInput = '')"
                  placeholder="Add tag..."
                  class="flex-1 px-3 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <button type="button"
                  @click="contactDetailTagInput?.trim() && !((selectedContact.tags || []).includes(contactDetailTagInput.trim())) && (updateContactInline(selectedContact.id, 'tags', [...(selectedContact.tags || []), contactDetailTagInput.trim()]), contactDetailTagInput = '')"
                  class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Add</button>
              </div>
            </div>

            <!-- Pipeline Status -->
            <div class="px-6 py-4 border-b border-gray-100">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pipeline</h4>
              <!-- On pipeline -->
              <div x-show="selectedContact.stage" class="space-y-3">
                <div>
                  <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Card Title</label>
                  <input type="text" :value="selectedContact.pipelineTitle || ''"
                    @keydown.enter.prevent="$event.target.blur()"
                    @blur="$event.target.value !== (selectedContact.pipelineTitle || '') && updateContactInline(selectedContact.id, 'pipelineTitle', $event.target.value || null)"
                    class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Stage</label>
                    <select :value="selectedContact.stage"
                      @change="updateContactInline(selectedContact.id, 'stage', $event.target.value)"
                      class="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-black bg-white">
                      <template x-for="stage in getPipelineStages(selectedContact.contactType)" :key="stage.key">
                        <option :value="stage.key" x-text="stage.label"></option>
                      </template>
                    </select>
                  </div>
                  <div>
                    <label class="block text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">Board</label>
                    <div class="px-2 py-1.5 text-sm text-gray-900" x-text="getContactTypeLabel(selectedContact.contactType)"></div>
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
            <div class="px-6 py-4 border-b border-gray-100">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                  <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wide">Attachments</h4>
                  <template x-if="selectedContact.attachments?.length">
                    <span class="text-[10px] text-gray-400" x-text="'(' + selectedContact.attachments.length + ')'"></span>
                  </template>
                </div>
                <label class="text-xs text-gray-500 hover:text-gray-700 font-medium cursor-pointer">
                  + Add
                  <input type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.gif,.docx,.xlsx,.xls,.doc,.txt,.csv" @change="uploadContactAttachments($event.target.files); $event.target.value = ''" class="hidden">
                </label>
              </div>

              <template x-if="contactAttachmentUploading">
                <div class="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <div class="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                  Uploading...
                </div>
              </template>

              <div class="space-y-1.5">
                <template x-for="att in (selectedContact.attachments || [])" :key="att.id">
                  <div class="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-gray-50 group">
                    <div class="w-7 h-7 rounded bg-gray-100 flex items-center justify-center shrink-0">
                      <span class="text-[9px] font-bold text-gray-400 uppercase" x-text="att.fileName.split('.').pop()"></span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm text-gray-700 truncate" x-text="att.fileName"></p>
                      <p class="text-[10px] text-gray-400" x-text="(att.fileSize / 1024).toFixed(0) + ' KB'"></p>
                    </div>
                    <div class="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <a :href="att.filePath" target="_blank" @click.stop class="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="View">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                        </svg>
                      </a>
                      <button @click.stop="deleteContactAttachment(att.id, att.fileName)" class="p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50" title="Delete">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                </template>
                <template x-if="!(selectedContact.attachments || []).length && !contactAttachmentUploading">
                  <p class="text-xs text-gray-400 py-1">No attachments</p>
                </template>
              </div>
            </div>

            <!-- Activity Timeline -->
            <div class="px-6 py-4">
              <h4 class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Activity</h4>

              <!-- Add Activity Form -->
              <div class="mb-4 p-3 bg-gray-50 rounded-lg">
                <div class="flex gap-2 mb-2">
                  <select x-model="contactActivityForm.action" class="text-xs border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="note_added">Note</option>
                    <option value="call_logged">Call</option>
                    <option value="email_sent">Email</option>
                    <option value="meeting">Meeting</option>
                  </select>
                </div>
                <div class="flex gap-2">
                  <textarea x-model="contactActivityForm.content" rows="2" placeholder="Log a note, call, email, or meeting..." class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black resize-none"></textarea>
                  <button @click="addContactActivity()" :disabled="!contactActivityForm.content?.trim()" class="self-end px-3 py-1.5 text-xs font-medium text-white bg-black rounded-md hover:bg-gray-800 disabled:opacity-50">Log</button>
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
  `;
}
