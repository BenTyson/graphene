export function getAddToPipelineModalHtml() {
  return `
    <div x-show="showAddToPipeline" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      @keydown.escape.window="showAddToPipeline && closeAddToPipeline()"
      class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeAddToPipeline()"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-md h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between z-10">
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Add to Pipeline</h3>
              <p class="text-sm text-gray-500 mt-0.5">Select a contact and choose which pipeline board.</p>
            </div>
            <button @click="closeAddToPipeline()" class="text-gray-400 hover:text-gray-600 ml-3 shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="px-6 py-4 space-y-4">
            <!-- Contact Search & Select -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contact <span class="text-red-500">*</span></label>
              <input type="text" x-model="addToPipelineSearch" placeholder="Search contacts..."
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black mb-2">
              <div class="max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                <template x-for="contact in getAvailableContactsForPipeline()" :key="contact.id">
                  <div @click="addToPipelineForm.contactId = contact.id"
                       :class="addToPipelineForm.contactId === contact.id ? 'bg-gray-100 border-l-2 border-gray-900' : 'hover:bg-gray-50'"
                       class="px-3 py-2 cursor-pointer border-b border-gray-100 last:border-b-0">
                    <div class="flex items-center gap-2">
                      <svg x-show="contact.contactKind === 'COMPANY'" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/></svg>
                      <svg x-show="contact.contactKind !== 'COMPANY'" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
                      <div>
                        <div class="text-sm font-medium text-gray-900" x-text="contact.name"></div>
                        <div x-show="contact.companyContact?.name" class="text-xs text-gray-500" x-text="contact.companyContact?.name"></div>
                      </div>
                    </div>
                  </div>
                </template>
                <div x-show="getAvailableContactsForPipeline().length === 0" class="px-3 py-4 text-center text-sm text-gray-400">
                  No available contacts found
                </div>
              </div>
            </div>

            <!-- Pipeline Type -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Pipeline Board <span class="text-red-500">*</span></label>
              <div class="flex gap-2">
                <button @click="addToPipelineForm.pipelineType = 'INVESTOR'" :class="addToPipelineForm.pipelineType === 'INVESTOR' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors">
                  Potential Investor
                </button>
                <button @click="addToPipelineForm.pipelineType = 'PARTNER'" :class="addToPipelineForm.pipelineType === 'PARTNER' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors">
                  Partner
                </button>
                <button @click="addToPipelineForm.pipelineType = 'CLIENT'" :class="addToPipelineForm.pipelineType === 'CLIENT' ? 'bg-gray-900 text-white' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'" class="flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors">
                  Client
                </button>
              </div>
            </div>

            <!-- Title (optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-xs text-gray-400 font-normal">(optional)</span></label>
              <input type="text" x-model="addToPipelineForm.pipelineTitle"
                class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button type="button" @click="closeAddToPipeline()"
                class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" @click="addToPipeline()" :disabled="!addToPipelineForm.contactId || !addToPipelineForm.pipelineType"
                class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                Add to Pipeline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}
