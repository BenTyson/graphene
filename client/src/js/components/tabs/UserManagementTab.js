/**
 * User Management Tab Component
 *
 * Provides the user management interface including:
 * - Header with title and action buttons (Super Admin only)
 * - Search functionality for users
 * - Data table with user information and role management
 * - User status management (active/inactive)
 * - Edit/Delete actions with confirmation
 * - Role-based visibility and permissions
 *
 * Dependencies:
 * - Alpine.js data: users, userSearch, editingUser, showAddUser
 * - Alpine.js methods: exportData, openUserForm, searchUsers, editUser, deleteUser, toggleUserStatus
 * - Global styling: Standard table and button classes
 * - AuthService: Role-based access control
 */

/**
 * Returns the complete HTML for the User Management tab component
 * @returns {string} HTML string for the User Management tab
 */
function getUserManagementTabHtml() {
  return `
    <!-- User Management Tab -->
    <div x-show="activeTab === 'user-management'" x-cloak>
      <div class="mb-6 flex justify-between items-center">
        <h2 class="text-xl font-semibold">User Management</h2>
        <div class="flex space-x-2">
          <button @click="exportData('users')" class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 touch-target">
            Export CSV
          </button>
          <button @click="openUserForm()" class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800 touch-target">
            Add User
          </button>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="mb-4">
        <input
          type="text"
          x-model="userSearch"
          @input="searchUsers()"
          placeholder="Search users, emails, roles..."
          class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black"
        >
      </div>

      <!-- Users Table -->
      <div class="overflow-x-auto border border-gray-200 rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-100">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Username
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Full Name
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Last Login
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Created
              </th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template x-for="user in users" :key="user.id">
              <tr class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-mono">
                  <span x-text="user.username" class="font-medium"></span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span x-text="user.email"></span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span x-text="(user.firstName && user.lastName) ? user.firstName + ' ' + user.lastName : '-'"></span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="getRoleClass(user.role)"
                        x-text="getRoleLabel(user.role)">
                  </span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                        :class="user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
                        x-text="user.isActive ? 'Active' : 'Inactive'">
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  <span x-text="user.lastLogin ? window.formatDateSafe(user.lastLogin) : 'Never'"></span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-600">
                  <span x-text="window.formatDateSafe(user.createdAt)"></span>
                </td>
                <td class="px-4 py-3 text-sm">
                  <div class="flex space-x-2">
                    <button @click="editUser(user)"
                            class="text-blue-600 hover:text-blue-800 text-xs font-medium"
                            title="Edit User">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button @click="toggleUserStatus(user)"
                            :class="user.isActive ? 'text-orange-600 hover:text-orange-800' : 'text-green-600 hover:text-green-800'"
                            class="text-xs font-medium"
                            :title="user.isActive ? 'Deactivate User' : 'Activate User'">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path x-show="user.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L5.636 5.636"></path>
                        <path x-show="!user.isActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </button>
                    <button @click="deleteUser(user)"
                            class="text-red-600 hover:text-red-800 text-xs font-medium"
                            title="Delete User"
                            :disabled="user.id === getCurrentUserId()"
                            :class="{'opacity-50 cursor-not-allowed': user.id === getCurrentUserId()}">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </template>

            <!-- Empty State -->
            <tr x-show="users.length === 0">
              <td colspan="8" class="px-4 py-8 text-center text-gray-500">
                <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"></path>
                </svg>
                <p class="text-lg font-medium">No users found</p>
                <p class="text-sm">Add your first user to get started</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination (if needed) -->
      <div x-show="users.length > 0" class="mt-4 flex justify-between items-center">
        <div class="text-sm text-gray-700">
          Showing <span x-text="users.length"></span> users
        </div>
      </div>
    </div>
  `;
}

// Helper functions for role display
window.getRoleClass = function(role) {
  const roleClasses = {
    'SUPER_ADMIN': 'bg-purple-100 text-purple-800',
    'SCIENCE_TEAM': 'bg-blue-100 text-blue-800',
    'EXECUTIVE_TEAM': 'bg-green-100 text-green-800',
    'INVESTOR': 'bg-yellow-100 text-yellow-800',
    'TEAM_MEMBER': 'bg-gray-100 text-gray-800'
  };
  return roleClasses[role] || 'bg-gray-100 text-gray-800';
};

window.getRoleLabel = function(role) {
  const roleLabels = {
    'SUPER_ADMIN': 'Super Admin',
    'SCIENCE_TEAM': 'Science Team',
    'EXECUTIVE_TEAM': 'Executive Team',
    'INVESTOR': 'Investor',
    'TEAM_MEMBER': 'Team Member'
  };
  return roleLabels[role] || role;
};

// Make the function globally available
window.getUserManagementTabHtml = getUserManagementTabHtml;

export { getUserManagementTabHtml };