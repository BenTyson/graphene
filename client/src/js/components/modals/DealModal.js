export function getDealModalHtml() {
  return `
  <div x-show="showAddDeal" x-cloak class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/50" @click="closeDealForm()"></div>

    <!-- Modal -->
    <div class="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto" @keydown.escape.window="closeDealForm()">
      <!-- Header -->
      <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
        <h3 class="text-lg font-semibold text-gray-900" x-text="editingDeal ? 'Edit Lead' : 'New Lead'"></h3>
      </div>

      <!-- Body -->
      <div class="px-6 py-4 space-y-4">
        <!-- Title -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Title <span class="text-red-500">*</span></label>
          <input type="text" x-model="dealForm.title" placeholder="e.g. Acme Corp - 500kg Q3 order" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
        </div>

        <!-- Contact -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Contact <span class="text-red-500">*</span></label>
          <select x-model="dealForm.contactId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <option value="">Select a contact</option>
            <template x-for="contact in pipelineContacts" :key="contact.id">
              <option :value="contact.id" x-text="contact.name + (contact.company ? ' (' + contact.company + ')' : '')"></option>
            </template>
          </select>
          <p x-show="pipelineContacts.length === 0" class="mt-1 text-xs text-gray-400">No contacts yet. Create a contact first.</p>
        </div>

        <!-- Stage -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Stage</label>
          <select x-model="dealForm.stage" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <template x-for="stage in getPipelineStages()" :key="stage.key">
              <option :value="stage.key" x-text="stage.label"></option>
            </template>
          </select>
        </div>

        <!-- Owner -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Owner</label>
          <select x-model="dealForm.ownerId" class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <option value="">Select owner</option>
            <template x-for="owner in pipelineOwners" :key="owner.id">
              <option :value="owner.id" x-text="[owner.firstName, owner.lastName].filter(Boolean).join(' ') || owner.username"></option>
            </template>
          </select>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea x-model="dealForm.description" rows="3" placeholder="Lead details, context..." class="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900"></textarea>
        </div>

        <!-- Tags -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div class="flex flex-wrap gap-1.5 mb-2">
            <template x-for="tag in dealForm.tags" :key="tag">
              <span class="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                <span x-text="tag"></span>
                <button @click="dealForm.tags = dealForm.tags.filter(t => t !== tag)" class="text-gray-400 hover:text-gray-600">&times;</button>
              </span>
            </template>
          </div>
          <div class="flex gap-2">
            <input type="text" x-model="pipelineTagInput" @keydown.enter.prevent="addPipelineTag()" placeholder="Add tag..." class="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-gray-900 focus:border-gray-900">
            <button @click="addPipelineTag()" class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Add</button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-end gap-2 rounded-b-xl">
        <button @click="closeDealForm()" class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
        <button @click="saveDeal()" :disabled="!dealForm.title.trim() || !dealForm.contactId" class="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed">
          <span x-text="editingDeal ? 'Save Changes' : 'Create Lead'"></span>
        </button>
      </div>
    </div>
  </div>
  `;
}
