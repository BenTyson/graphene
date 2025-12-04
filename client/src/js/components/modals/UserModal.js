/**
 * User Add/Edit Modal Component
 *
 * Provides the user creation and editing interface including:
 * - Basic information (username, email, first name, last name)
 * - Security settings (password, confirm password)
 * - Role assignment (SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, INVESTOR, TEAM_MEMBER)
 * - Status management (active/inactive)
 *
 * Dependencies:
 * - Alpine.js data: userForm, editingUser, showAddUser
 * - Alpine.js methods: saveUser()
 * - Role-based access control and validation
 */

function getUserModalHtml() {
  return `
    <!-- User Add/Edit Modal -->
    <div x-show="showAddUser" x-cloak
         @click.away="showAddUser = false; editingUser = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-2xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingUser ? 'Edit User' : 'Add New User'"></h3>

          <form @submit.prevent="saveUser()" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input type="text" x-model="userForm.username" required
                         :disabled="!!editingUser"
                         :class="editingUser ? 'bg-gray-100 cursor-not-allowed' : ''"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <p x-show="editingUser" class="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" x-model="userForm.email" required
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" x-model="userForm.firstName"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" x-model="userForm.lastName"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
            </div>

            <!-- Password Section -->
            <div x-show="!editingUser || userForm.changePassword">
              <h4 class="text-sm font-medium text-gray-700 mb-3">
                <span x-show="!editingUser">Password</span>
                <span x-show="editingUser">Change Password</span>
              </h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Password <span x-show="!editingUser" class="text-red-500">*</span>
                  </label>
                  <input type="password" x-model="userForm.password"
                         :required="!editingUser"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span x-show="!editingUser" class="text-red-500">*</span>
                  </label>
                  <input type="password" x-model="userForm.confirmPassword"
                         :required="!editingUser"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
              </div>
              <div x-show="userForm.password !== userForm.confirmPassword && userForm.confirmPassword"
                   class="text-red-500 text-sm mt-2">
                Passwords do not match
              </div>
            </div>

            <!-- Change Password Toggle (Edit Mode Only) -->
            <div x-show="editingUser" class="border-t pt-4">
              <label class="flex items-center">
                <input type="checkbox" x-model="userForm.changePassword" class="mr-2">
                <span class="text-sm text-gray-700">Change password</span>
              </label>
            </div>

            <!-- Role & Status -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Role & Status</h4>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select x-model="userForm.role" required
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="">Select role...</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="SCIENCE_TEAM">Science Team</option>
                    <option value="EXECUTIVE_TEAM">Executive Team</option>
                    <option value="INVESTOR">Investor</option>
                    <option value="TEAM_MEMBER">Team Member</option>
                    <option value="THIRD_PARTY">Third Party (View Only)</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select x-model="userForm.isActive"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Role Description -->
            <div x-show="userForm.role" class="bg-gray-50 p-3 rounded-md">
              <h5 class="text-sm font-medium text-gray-700 mb-2">Role Permissions:</h5>
              <div class="text-sm text-gray-600">
                <div x-show="userForm.role === 'SUPER_ADMIN'" class="space-y-1">
                  <p>• Full system access including user management</p>
                  <p>• Can create, edit, and delete all data</p>
                  <p>• Access to all tabs and administrative functions</p>
                </div>
                <div x-show="userForm.role === 'SCIENCE_TEAM'" class="space-y-1">
                  <p>• Full access to research data and experiments</p>
                  <p>• Can create and edit biochar, graphene, and test data</p>
                  <p>• Access to reports and analytics</p>
                </div>
                <div x-show="userForm.role === 'EXECUTIVE_TEAM'" class="space-y-1">
                  <p>• Read access to all data and reports</p>
                  <p>• Can export data and generate reports</p>
                  <p>• Limited editing capabilities</p>
                </div>
                <div x-show="userForm.role === 'INVESTOR'" class="space-y-1">
                  <p>• Read-only access to summary data</p>
                  <p>• Can view reports and key metrics</p>
                  <p>• No editing or data entry capabilities</p>
                </div>
                <div x-show="userForm.role === 'TEAM_MEMBER'" class="space-y-1">
                  <p>• Basic access to assigned projects</p>
                  <p>• Can enter and edit own data</p>
                  <p>• Limited system access</p>
                </div>
              </div>
            </div>

            <div class="flex justify-end space-x-2 pt-4 border-t">
              <button type="button" @click="showAddUser = false; editingUser = null; userForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      :disabled="userForm.password !== userForm.confirmPassword"
                      :class="userForm.password !== userForm.confirmPassword ? 'opacity-50 cursor-not-allowed' : ''"
                      class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                <span x-text="editingUser ? 'Update User' : 'Create User'"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in the main application
export { getUserModalHtml };