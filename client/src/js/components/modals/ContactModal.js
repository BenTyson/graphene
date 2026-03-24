export function getContactModalHtml() {
  return `
  <div x-show="showAddContact" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="closeContactForm()"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" @keydown.escape.window="closeContactForm()">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
        <h3 class="text-lg font-semibold text-gray-900" x-text="editingContact ? (contactForm.contactKind === 'COMPANY' ? 'Edit Company' : 'Edit Person') : (contactForm.contactKind === 'COMPANY' ? 'New Company' : 'New Person')"></h3>
      </div>

      <!-- Body -->
      <div class="px-6 py-4 space-y-4">
        <!-- Name -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            <span x-text="contactForm.contactKind === 'COMPANY' ? 'Company Name' : 'Full Name'"></span>
            <span class="text-red-500">*</span>
          </label>
          <input type="text" x-model="contactForm.name" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>

        <!-- Pipeline Type (optional) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select x-model="contactForm.contactType" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <option value="">-- None --</option>
            <option value="INVESTOR">Investor</option>
            <option value="PARTNER">Partner</option>
            <option value="CLIENT">Client</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <!-- ═══ PERSON-specific fields ═══ -->

        <!-- Company link & Role -->
        <div x-show="contactForm.contactKind === 'PERSON'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select x-model="contactForm.companyId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
              <option value="">None</option>
              <template x-for="co in getCompanyContacts()" :key="co.id">
                <option :value="co.id" x-text="co.name"></option>
              </template>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Role / Title</label>
            <input type="text" x-model="contactForm.role" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
        </div>

        <!-- Person: Email & Phone -->
        <div x-show="contactForm.contactKind === 'PERSON'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" x-model="contactForm.email" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" x-model="contactForm.phone" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
        </div>

        <!-- Person: LinkedIn -->
        <div x-show="contactForm.contactKind === 'PERSON'">
          <label class="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
          <input type="url" x-model="contactForm.linkedInUrl" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>

        <!-- ═══ COMPANY-specific fields ═══ -->

        <!-- Link existing person -->
        <div x-show="contactForm.contactKind === 'COMPANY' && !editingContact">
          <label class="block text-sm font-medium text-gray-700 mb-1">Primary Contact Person</label>
          <select x-model="contactForm.linkPersonId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <option value="">None (add later)</option>
            <template x-for="person in getPersonContacts()" :key="person.id">
              <option :value="person.id" x-text="person.name + (person.role ? ' - ' + person.role : '')"></option>
            </template>
          </select>
          <p class="text-xs text-gray-400 mt-1">Contact details (email, phone) live on the person, not the company.</p>
        </div>

        <!-- Company: General Email & Website (backup contact info) -->
        <div x-show="contactForm.contactKind === 'COMPANY'" class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">General Email</label>
            <input type="email" x-model="contactForm.email" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
            <input type="url" x-model="contactForm.website"  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
        </div>

        <!-- ═══ Shared fields ═══ -->

        <!-- Person: Website (less prominent) -->
        <div x-show="contactForm.contactKind === 'PERSON'">
          <label class="block text-sm font-medium text-gray-700 mb-1">Website</label>
          <input type="url" x-model="contactForm.website"  class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>

        <!-- Source & Owner -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Source</label>
            <input type="text" x-model="contactForm.source" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
            <select x-model="contactForm.ownerId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
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
          <input type="date" x-model="contactForm.nextFollowUpAt" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <template x-for="tag in contactForm.tags" :key="tag">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                <span x-text="tag"></span>
                <button @click="contactForm.tags = contactForm.tags.filter(t => t !== tag)" class="text-gray-400 hover:text-gray-600">&times;</button>
              </span>
            </template>
          </div>
          <div class="flex gap-2">
            <input type="text" x-model="pipelineTagInput" @keydown.enter.prevent="addPipelineTag()" placeholder="Add tag..." class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <button @click="addPipelineTag()" class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Add</button>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea x-model="contactForm.notes" rows="3" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"></textarea>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end gap-2 rounded-b-xl">
        <button @click="closeContactForm()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button @click="saveContact()" :disabled="!contactForm.name.trim()" class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
          <span x-text="editingContact ? 'Save Changes' : 'Create Contact'"></span>
        </button>
      </div>
    </div>
  </div>
  `;
}
