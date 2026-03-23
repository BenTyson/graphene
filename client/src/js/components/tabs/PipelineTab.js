export function getPipelineTabHtml() {
  return `
  <div x-show="activeTab === 'pipeline'" x-cloak class="space-y-2">
    <!-- Toolbar: actions + view toggle + search in one row -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <!-- View Toggle -->
        <div class="flex gap-1 p-1 bg-gray-100 rounded-lg">
          <button @click="switchPipelineView('kanban')" :class="pipelineViewMode === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'" class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors">
            Pipeline
          </button>
          <button @click="switchPipelineView('contacts')" :class="pipelineViewMode === 'contacts' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'" class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors">
            Contacts
          </button>
        </div>

        <!-- Search -->
        <div class="relative flex-1 max-w-xs">
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"/></svg>
          <input type="text" x-model="pipelineSearch" @input="pipelineSearchDebounced()" placeholder="Search..." class="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <button @click="openPersonForm()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4" stroke-linecap="round" stroke-linejoin="round"/><line x1="19" y1="8" x2="19" y2="14" stroke-linecap="round" stroke-linejoin="round"/><line x1="22" y1="11" x2="16" y2="11" stroke-linecap="round" stroke-linejoin="round"/></svg>
          New Person
        </button>
        <button @click="openCompanyForm()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/></svg>
          New Company
        </button>
        <button @click="openAddToPipeline()" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
          Add to Pipeline
        </button>
      </div>
    </div>

    <!-- Pipeline (Kanban) View -->
    <div x-show="pipelineViewMode === 'kanban'">
      <!-- Type Switcher (underline tabs) + Owner filter -->
      <div class="flex items-center justify-between border-b border-gray-200 mb-3">
        <div class="flex gap-4">
          <button @click="switchPipelineType('INVESTOR')" :class="pipelineType === 'INVESTOR' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="pb-2 text-sm font-medium border-b-2 transition-colors">
            Investors
          </button>
          <button @click="switchPipelineType('PARTNER')" :class="pipelineType === 'PARTNER' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="pb-2 text-sm font-medium border-b-2 transition-colors">
            Partners
          </button>
          <button @click="switchPipelineType('CLIENT')" :class="pipelineType === 'CLIENT' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="pb-2 text-sm font-medium border-b-2 transition-colors">
            Clients
          </button>
        </div>

        <select x-model="pipelineFilters.ownerId" @change="loadPipelineBoard()" class="text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-2 focus:ring-1 focus:ring-gray-900">
          <option value="">All owners</option>
          <template x-for="owner in pipelineOwners" :key="owner.id">
            <option :value="owner.id" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
          </template>
        </select>
      </div>

      <!-- Kanban Board -->
      <div x-show="!pipelineLoading" class="flex gap-3 overflow-x-auto pb-4" style="min-height: 400px;">
        <template x-for="stage in getPipelineStages()" :key="stage.key">
          <div class="flex-shrink-0 w-72">
            <!-- Column Header -->
            <div class="flex items-center justify-between mb-2 px-1">
              <div class="flex items-center gap-2">
                <span class="text-xs font-semibold text-gray-700 uppercase tracking-wider" x-text="stage.label"></span>
                <span class="text-xs text-gray-400 font-medium" x-text="getContactsByStage(stage.key).length"></span>
              </div>
              <button @click="openAddToPipeline(stage.key)" class="p-0.5 text-gray-400 hover:text-gray-600 rounded">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
              </button>
            </div>

            <!-- Column Body -->
            <div :id="'pipeline-col-' + stage.key" :data-stage="stage.key" class="space-y-2 min-h-[200px] p-1 bg-gray-50 rounded-lg">
              <template x-for="contact in getContactsByStage(stage.key)" :key="contact.id">
                <div :data-contact-id="contact.id" @click="openContactDetail(contact.id)" class="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-sm hover:border-gray-300 transition-all group">
                  <div class="flex items-start justify-between mb-1">
                    <h4 class="text-sm font-medium text-gray-900 line-clamp-2" x-text="contact.name"></h4>
                    <span x-show="contact.contactKind === 'COMPANY'" class="ml-1.5 flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded">Co</span>
                  </div>
                  <div x-show="contact.pipelineTitle" class="text-xs text-gray-500" x-text="contact.pipelineTitle"></div>
                  <div x-show="contact.contactKind === 'PERSON' && contact.companyContact?.name" class="text-xs text-gray-400" x-text="contact.companyContact?.name"></div>
                  <div class="flex items-center justify-between mt-2">
                    <div class="flex items-center gap-1.5">
                      <template x-for="tag in (contact.tags || []).slice(0, 2)" :key="tag">
                        <span class="px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded" x-text="tag"></span>
                      </template>
                    </div>
                    <div x-show="contact.owner" class="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-medium text-gray-600" :title="getOwnerName(contact)" x-text="getOwnerInitials(contact)"></div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- Loading State -->
      <div x-show="pipelineLoading" class="flex items-center justify-center py-12">
        <svg class="animate-spin h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
        <span class="ml-2 text-sm text-gray-500">Loading pipeline...</span>
      </div>
    </div>

    <!-- Contacts List View -->
    <div x-show="pipelineViewMode === 'contacts'">
      <!-- Filters bar -->
      <div class="flex items-center justify-between border-b border-gray-200 mb-3">
        <!-- People / Companies underline tabs -->
        <div class="flex gap-4">
          <button @click="pipelineContactKindFilter = ''" :class="pipelineContactKindFilter === '' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="pb-2 text-sm font-medium border-b-2 transition-colors">
            All
          </button>
          <button @click="pipelineContactKindFilter = 'PERSON'" :class="pipelineContactKindFilter === 'PERSON' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="pb-2 text-sm font-medium border-b-2 transition-colors">
            People
          </button>
          <button @click="pipelineContactKindFilter = 'COMPANY'" :class="pipelineContactKindFilter === 'COMPANY' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="pb-2 text-sm font-medium border-b-2 transition-colors">
            Companies
          </button>
        </div>

        <select x-model="pipelineFilters.ownerId" @change="loadPipelineContacts()" class="text-xs border border-gray-300 rounded-lg px-2 py-1.5 mb-2 focus:ring-1 focus:ring-gray-900">
          <option value="">All owners</option>
          <template x-for="owner in pipelineOwners" :key="owner.id">
            <option :value="owner.id" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
          </template>
        </select>
      </div>

      <!-- Desktop Table -->
      <div class="hidden md:block overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-200">
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Name</th>
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Company</th>
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Pipeline</th>
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Owner</th>
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Follow-up</th>
              <th class="text-left py-2 px-3 text-xs font-medium text-gray-500 uppercase">Last Contact</th>
              <th class="text-right py-2 px-3 text-xs font-medium text-gray-500 uppercase"></th>
            </tr>
          </thead>
          <tbody>
            <template x-for="contact in getFilteredContacts()" :key="contact.id">
              <tr @click="openContactDetail(contact.id)" class="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                <td class="py-2.5 px-3">
                  <div class="flex items-center gap-1.5">
                    <svg x-show="contact.contactKind === 'COMPANY'" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/></svg>
                    <svg x-show="contact.contactKind !== 'COMPANY'" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0"/></svg>
                    <div>
                      <div class="font-medium text-gray-900" x-text="contact.name"></div>
                      <div x-show="contact.email" class="text-xs text-gray-400" x-text="contact.email"></div>
                    </div>
                  </div>
                </td>
                <td class="py-2.5 px-3 text-gray-600">
                  <span x-show="contact.contactKind === 'PERSON'" x-text="contact.companyContact?.name || '-'"></span>
                  <span x-show="contact.contactKind === 'COMPANY'" class="text-xs text-gray-400" x-text="(contact._count?.people || 0) + ' people'"></span>
                </td>
                <td class="py-2.5 px-3">
                  <span x-show="contact.contactType" class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getContactTypeBadgeClass(contact.contactType)" x-text="getContactTypeLabel(contact.contactType)"></span>
                  <span x-show="!contact.contactType" class="text-xs text-gray-400">-</span>
                </td>
                <td class="py-2.5 px-3">
                  <span x-show="contact.stage" class="px-2 py-0.5 text-xs font-medium rounded-full" :class="getStageBadgeClass(contact.stage)" x-text="getStageLabel(contact.stage)"></span>
                  <span x-show="!contact.stage" class="text-xs text-gray-400">-</span>
                </td>
                <td class="py-2.5 px-3 text-gray-600" x-text="getOwnerName(contact)"></td>
                <td class="py-2.5 px-3">
                  <span :class="getFollowUpClass(contact.nextFollowUpAt)" x-text="getFollowUpLabel(contact.nextFollowUpAt) || '-'"></span>
                </td>
                <td class="py-2.5 px-3 text-gray-500 text-xs" x-text="contact.lastContactedAt ? new Date(contact.lastContactedAt).toLocaleDateString() : 'Never'"></td>
                <td class="py-2.5 px-3 text-right">
                  <button x-show="!contact.stage" @click.stop="openAddToPipelineForContact(contact.id)" class="text-xs text-gray-500 hover:text-gray-900 font-medium whitespace-nowrap">+ Add to Pipeline</button>
                </td>
              </tr>
            </template>
            <tr x-show="getFilteredContacts().length === 0">
              <td colspan="8" class="py-8 text-center text-sm text-gray-400">No contacts found</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div class="md:hidden space-y-2">
        <template x-for="contact in getFilteredContacts()" :key="contact.id">
          <div @click="openContactDetail(contact.id)" class="bg-white border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-sm">
            <div class="flex items-start justify-between mb-1">
              <div>
                <div class="flex items-center gap-1.5">
                  <svg x-show="contact.contactKind === 'COMPANY'" class="w-3.5 h-3.5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.5"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3H21"/></svg>
                  <div class="font-medium text-sm text-gray-900" x-text="contact.name"></div>
                </div>
                <div x-show="contact.contactKind === 'PERSON' && contact.companyContact" class="text-xs text-gray-500 mt-0.5" x-text="contact.companyContact?.name"></div>
              </div>
              <div class="flex items-center gap-1.5">
                <span x-show="contact.stage" class="px-1.5 py-0.5 text-[10px] font-medium rounded-full" :class="getStageBadgeClass(contact.stage)" x-text="getStageLabel(contact.stage)"></span>
                <span x-show="contact.contactType" class="px-1.5 py-0.5 text-[10px] font-medium rounded-full" :class="getContactTypeBadgeClass(contact.contactType)" x-text="getContactTypeLabel(contact.contactType)"></span>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-2 text-xs text-gray-400">
              <span x-text="getOwnerName(contact)"></span>
              <span :class="getFollowUpClass(contact.nextFollowUpAt)" x-text="getFollowUpLabel(contact.nextFollowUpAt)"></span>
            </div>
          </div>
        </template>
        <div x-show="getFilteredContacts().length === 0" class="py-8 text-center text-sm text-gray-400">No contacts found</div>
      </div>
    </div>
  </div>
  `;
}
