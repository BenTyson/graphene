export function getContactModalHtml() {
  return `
    <div x-show="showAddContact" x-cloak
      x-transition:enter="transition ease-out duration-200"
      x-transition:enter-start="opacity-0"
      x-transition:enter-end="opacity-100"
      x-transition:leave="transition ease-in duration-150"
      x-transition:leave-start="opacity-100"
      x-transition:leave-end="opacity-0"
      @keydown.escape.window="showAddContact && closeContactForm()"
      class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50" @click="closeContactForm()"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-lg h-full md:h-auto max-h-screen md:max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h3 class="text-lg font-semibold text-gray-900" x-text="editingContact ? (contactForm.contactKind === 'COMPANY' ? 'Edit Company' : 'Edit Person') : (contactForm.contactKind === 'COMPANY' ? 'New Company' : 'New Person')"></h3>
            <button @click="closeContactForm()" class="text-gray-400 hover:text-gray-600">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form @submit.prevent="saveContact()" class="p-6 space-y-4">
            <!-- Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <span x-text="contactForm.contactKind === 'COMPANY' ? 'Company Name' : 'Full Name'"></span>
                <span class="text-red-500">*</span>
              </label>
              <input type="text" x-model="contactForm.name" required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
            </div>

            <!-- Pipeline Type (optional) -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select x-model="contactForm.contactType"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option value="">-- None --</option>
                <option value="INVESTOR">Investor</option>
                <option value="PARTNER">Partner</option>
                <option value="CLIENT">Client</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <!-- PERSON-specific fields -->
            <div x-show="contactForm.contactKind === 'PERSON'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
                <select x-model="contactForm.companyId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="">None</option>
                  <template x-for="co in getCompanyContacts()" :key="co.id">
                    <option :value="co.id" x-text="co.name"></option>
                  </template>
                </select>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
                <input type="text" x-model="contactForm.role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
            </div>

            <div x-show="contactForm.contactKind === 'PERSON'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" x-model="contactForm.email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" x-model="contactForm.phone"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
            </div>

            <div x-show="contactForm.contactKind === 'PERSON'">
              <label class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <input type="url" x-model="contactForm.linkedInUrl"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
            </div>

            <!-- COMPANY-specific fields -->
            <div x-show="contactForm.contactKind === 'COMPANY' && !editingContact">
              <label class="block text-sm font-medium text-gray-700 mb-1">Primary Contact Person</label>
              <select x-model="contactForm.linkPersonId"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                <option value="">None (add later)</option>
                <template x-for="person in getPersonContacts()" :key="person.id">
                  <option :value="person.id" x-text="person.name + (person.role ? ' - ' + person.role : '')"></option>
                </template>
              </select>
              <p class="text-xs text-gray-400 mt-1">Contact details (email, phone) live on the person, not the company.</p>
            </div>

            <div x-show="contactForm.contactKind === 'COMPANY'" class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">General Email</label>
                <input type="email" x-model="contactForm.email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <input type="url" x-model="contactForm.website"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
            </div>

            <!-- Person: Website (less prominent) -->
            <div x-show="contactForm.contactKind === 'PERSON'">
              <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <input type="url" x-model="contactForm.website"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
            </div>

            <!-- Source & Owner -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <input type="text" x-model="contactForm.source"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
                <select x-model="contactForm.ownerId"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
                  <option value="">Select owner</option>
                  <template x-for="owner in pipelineOwners" :key="owner.id">
                    <option :value="owner.id" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
                  </template>
                </select>
              </div>
            </div>

            <!-- Follow-up Date -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Next Follow-up</label>
              <input type="date" x-model="contactForm.nextFollowUpAt"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm">
            </div>

            <!-- Tags -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <div class="flex flex-wrap gap-1.5 mb-2">
                <template x-for="tag in contactForm.tags" :key="tag">
                  <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    <span x-text="tag"></span>
                    <button type="button" @click="contactForm.tags = contactForm.tags.filter(t => t !== tag)" class="text-gray-400 hover:text-gray-600">&times;</button>
                  </span>
                </template>
              </div>
              <div class="flex gap-2">
                <input type="text" x-model="pipelineTagInput" @keydown.enter.prevent="addPipelineTag()" placeholder="Add tag..."
                  class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                <button type="button" @click="addPipelineTag()"
                  class="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Add</button>
              </div>
            </div>

            <!-- Notes -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea x-model="contactForm.notes" rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black text-sm resize-none"></textarea>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <button type="button" @click="closeContactForm()"
                class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" :disabled="!contactForm.name.trim()"
                class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <span x-text="editingContact ? 'Save Changes' : 'Create Contact'"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}
