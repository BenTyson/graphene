/**
 * Graphene Add/Edit Modal Component - THE FINAL BOSS
 * 
 * This is the most complex modal in the system, providing comprehensive graphene experiment tracking:
 * - Dynamic modal title (Add vs Edit)
 * - Complete experiment workflow from basic info to results
 * - Multi-section form: Basic Info, Setup, Base Treatment, Preparation, Thermal Treatment, 
 *   Washing, Drying, Product Characterization, SEM Reports, Experiment Objectives
 * - Advanced biochar source selection (individual experiments, lots, various)
 * - Grinding method conditional logic (Manual, Mill, Ball Mill, Blender)
 * - Appearance tags with toggleable selection
 * - SEM report management (direct upload, associations, view/remove)
 * - Experiment objectives parser for structured data entry
 * - Update reports multi-selection
 * - Extensive form validation and state management
 * 
 * Dependencies:
 * - Alpine.js data: showAddGraphene, editingGraphene, grapheneForm, all dropdown arrays
 * - Alpine.js methods: saveGraphene(), all form handlers and parsers
 * - Form field helpers: getDateFieldHtml, getSelectFieldHtml, getNumericFieldHtml
 * - Extensive dropdown management and conditional field logic
 * - SEM report viewing and management integration
 * - Global styling: Standard form classes and complex grid layouts
 */

/**
 * Returns the complete HTML for the massive Graphene modal component
 * @returns {string} HTML string for the Graphene modal (656+ lines)
 */
function getGrapheneModalHtml() {
  return `
    <!-- Graphene Add/Edit Modal -->
    <div x-show="showAddGraphene" x-cloak
         @click.away="showAddGraphene = false; editingGraphene = null"
         class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4">
        <div class="fixed inset-0 bg-black opacity-50"></div>
        <div class="relative bg-white rounded-none md:rounded-lg w-full md:max-w-3xl h-full md:h-auto md:max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <h3 class="text-lg font-semibold mb-4" x-text="editingGraphene ? 'Edit Graphene Record' : 'Add Graphene Record'"></h3>
          
          <form @submit.prevent="saveGraphene()" class="space-y-6">
            <!-- Basic Information -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Basic Information</h4>
              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Experiment #</label>
                  <input type="text" x-model="grapheneForm.experimentNumber" required
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Title Note</label>
                  <div class="relative">
                    <select x-model="grapheneForm.titleNote"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black appearance-none">
                      <option value="">None</option>
                      <template x-for="note in titleNotes" :key="note">
                        <option :value="note" x-text="note"></option>
                      </template>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Test Order</label>
                  <input type="number" x-model="grapheneForm.testOrder" 
                         placeholder="1, 2, 3..."
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                </div>
                <div x-html="getDateFieldHtml({
                  label: 'Experiment Date', 
                  dateModelVariable: 'grapheneForm.experimentDate',
                  unknownModelVariable: 'grapheneForm.dateUnknown'
                })"></div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Research Team</label>
                  <div class="relative">
                    <select x-model="grapheneForm.researchTeam" 
                            @change="if($event.target.value === 'add_new') { showAddResearchTeam = true; grapheneForm.researchTeam = 'Curia - Germany'; }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black appearance-none">
                      <option value="">Select team...</option>
                      <template x-for="team in researchTeams" :key="team">
                        <option :value="team" x-text="team"></option>
                      </template>
                      <option value="add_new" class="font-semibold">+ Add New Team</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Setup & Materials -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Setup & Materials</h4>
              <div class="grid grid-cols-3 gap-4">
                <div x-html="getSelectFieldHtml({
                  label: 'Oven',
                  modelVariable: 'grapheneForm.oven',
                  optionsArray: 'ovens',
                  showModalVariable: 'showAddOven',
                  placeholder: 'Select oven...',
                  addNewText: 'Oven',
                  resetValue: ''
                })"></div>
                <div x-html="getNumericFieldHtml({
                  label: 'Quantity',
                  unit: 'g',
                  modelVariable: 'grapheneForm.quantity',
                  step: '0.01'
                })"></div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Biochar Source</label>
                  <div class="relative">
                    <select x-model="grapheneForm.biocharSource" 
                            @change="handleBiocharSourceChange($event)"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black appearance-none">
                      <option value="">Select biochar source...</option>
                      <option value="various">Various (Mixed Sources)</option>
                      <optgroup label="Individual Experiments">
                        <template x-for="exp in availableExperiments" :key="'exp-' + exp">
                          <option :value="'exp:' + exp" x-text="'EXP: ' + exp"></option>
                        </template>
                      </optgroup>
                      <optgroup label="Combined Lots" x-show="availableLots.length > 0">
                        <template x-for="lot in availableLots" :key="'lot-' + lot.lotNumber">
                          <option :value="'lot:' + lot.lotNumber" x-text="'LOT: ' + lot.lotNumber + (lot.lotName ? ' (' + lot.lotName + ')' : '') + ' - ' + lot._count.experiments + ' experiments'"></option>
                        </template>
                      </optgroup>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p class="text-xs text-gray-500 mt-1">Select individual experiment or combined lot</p>
                </div>
              </div>
              
              <!-- Comments row -->
              <div class="grid grid-cols-1 gap-4 mt-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                  <div class="relative">
                    <select x-model="grapheneForm.comments"
                            @change="if($event.target.value === 'add_new') { showAddGrapheneComment = true; grapheneForm.comments = ''; }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black appearance-none">
                      <option value="">Select comment...</option>
                      <template x-for="comment in grapheneComments" :key="comment">
                        <option :value="comment" x-text="comment"></option>
                      </template>
                      <option value="add_new" class="font-semibold">+ Add New Comment</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Base Treatment -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Base Treatment</h4>
              <div class="grid grid-cols-3 gap-4">
                <div x-html="getNumericFieldHtml({
                  label: 'Amount',
                  unit: 'g',
                  modelVariable: 'grapheneForm.baseAmount',
                  step: '0.01'
                })"></div>
                <div x-html="getSelectFieldHtml({
                  label: 'Type',
                  modelVariable: 'grapheneForm.baseType',
                  optionsArray: 'baseTypes',
                  showModalVariable: 'showAddBaseType',
                  placeholder: 'Select...',
                  addNewText: 'Base Type',
                  resetValue: ''
                })"></div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Concentration (%)</label>
                  <input type="number" step="0.01" x-model="grapheneForm.baseConcentration"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </div>

            <!-- Second Base Treatment (Optional) -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Second Base (Optional)</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Amount (g)</label>
                  <input type="number" step="0.01" x-model="grapheneForm.base2Amount"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <div class="relative">
                    <select x-model="grapheneForm.base2Type" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none">
                      <option value="">Select...</option>
                      <template x-for="base in baseTypes" :key="base">
                        <option :value="base" x-text="base"></option>
                      </template>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Concentration (%)</label>
                  <input type="number" step="0.01" x-model="grapheneForm.base2Concentration"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </div>

            <!-- Preparation -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Preparation</h4>
              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Grinding Method</label>
                  <select x-model="grapheneForm.grindingMethod"
                          @change="if (grapheneForm.grindingMethod === 'manual') { grapheneForm.grindingFrequency = ''; grapheneForm.grindingCount = ''; grapheneForm.grindingTime = ''; } else if (grapheneForm.grindingMethod !== 'ball_mill') { grapheneForm.grindingFrequency = ''; }"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select...</option>
                    <option value="manual">Manual</option>
                    <option value="mill">Mill</option>
                    <option value="ball_mill">Ball Mill</option>
                    <option value="blender">Blender</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"># of Grinds</label>
                  <input type="number" step="1" min="1" x-model="grapheneForm.grindingCount"
                         :disabled="!grapheneForm.grindingMethod || grapheneForm.grindingMethod === 'manual'"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                         placeholder="Number of grinding cycles">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Grinding Time (min)</label>
                  <input type="number" step="0.1" x-model="grapheneForm.grindingTime"
                         :disabled="!grapheneForm.grindingMethod || grapheneForm.grindingMethod === 'manual'"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Frequency (Hz)</label>
                  <input type="number" step="0.1" x-model="grapheneForm.grindingFrequency"
                         :disabled="grapheneForm.grindingMethod !== 'ball_mill'"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Homogeneous</label>
                  <select x-model="grapheneForm.homogeneous"
                          class="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">Select...</option>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </div>
              </div>
            </div>
            
            <!-- Thermal Treatment -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Thermal Treatment</h4>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Gas</label>
                  <div class="relative">
                    <select x-model="grapheneForm.gas" 
                            @change="if($event.target.value === 'add_new') { showAddGas = true; grapheneForm.gas = ''; }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none">
                      <option value="">Select gas...</option>
                      <template x-for="gas in gases" :key="gas">
                        <option :value="gas" x-text="gas"></option>
                      </template>
                      <option value="add_new" class="font-semibold">+ Add New Gas</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Time (hr)</label>
                  <input type="number" step="0.1" x-model="grapheneForm.time"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Temperature Rate (°C/min)</label>
                  <input type="text" x-model="grapheneForm.tempRate" placeholder="20-27 or 3"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Max Temperature (°C)</label>
                  <input type="number" step="0.1" x-model="grapheneForm.tempMax"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
            </div>
            
            <!-- Washing -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Washing</h4>
              <div class="grid grid-cols-4 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Amount (g)</label>
                  <input type="number" step="0.01" x-model="grapheneForm.washAmount"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Solution</label>
                  <div class="relative">
                    <select x-model="grapheneForm.washSolution" 
                            @change="if($event.target.value === 'add_new') { showAddWashSolution = true; grapheneForm.washSolution = ''; }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none">
                      <option value="">Select...</option>
                      <template x-for="solution in washSolutions" :key="solution">
                        <option :value="solution" x-text="solution"></option>
                      </template>
                      <option value="add_new" class="font-semibold">+ Add New</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Concentration (%)</label>
                  <input type="number" step="0.1" x-model="grapheneForm.washConcentration"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Water</label>
                  <div class="relative">
                    <select x-model="grapheneForm.washWater"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none">
                      <option value="">None</option>
                      <template x-for="water in washWaters" :key="water">
                        <option :value="water" x-text="water"></option>
                      </template>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Drying -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Drying</h4>
              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Temperature (°C)</label>
                  <input type="number" step="0.1" x-model="grapheneForm.dryingTemp"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Atmosphere</label>
                  <div class="relative">
                    <select x-model="grapheneForm.dryingAtmosphere" 
                            @change="if($event.target.value === 'add_new') { showAddDryingAtmosphere = true; grapheneForm.dryingAtmosphere = ''; }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none">
                      <option value="">Select...</option>
                      <template x-for="atmosphere in dryingAtmospheres" :key="atmosphere">
                        <option :value="atmosphere" x-text="atmosphere"></option>
                      </template>
                      <option value="add_new" class="font-semibold">+ Add New</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Pressure</label>
                  <div class="relative">
                    <select x-model="grapheneForm.dryingPressure" 
                            @change="if($event.target.value === 'add_new') { showAddDryingPressure = true; grapheneForm.dryingPressure = ''; }"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none">
                      <template x-for="pressure in dryingPressures" :key="pressure">
                        <option :value="pressure" x-text="pressure"></option>
                      </template>
                      <option value="add_new" class="font-semibold">+ Add New</option>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Product Characterization -->
            <div>
              <h4 class="text-sm font-medium text-gray-700 mb-3">Product Characterization</h4>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Volume (ml)</label>
                  <input type="number" step="0.01" x-model="grapheneForm.volumeMl"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
              <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Species</label>
                  <div class="relative">
                    <select x-model="grapheneForm.species" 
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black appearance-none">
                      <option value="">Select species...</option>
                      <template x-for="spec in species" :key="spec">
                        <option :value="spec" x-text="spec"></option>
                      </template>
                    </select>
                    <div class="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                      <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Output (g)</label>
                  <input type="number" step="0.01" x-model="grapheneForm.output"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md">
                </div>
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Appearance Tags</label>
                <div class="space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <template x-for="tag in appearanceTags" :key="tag">
                      <button type="button" 
                              @click="toggleAppearanceTag(tag)"
                              :class="(grapheneForm.appearanceTags && grapheneForm.appearanceTags.includes(tag)) ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'"
                              class="px-3 py-1 text-sm rounded-full border transition-colors">
                        <span x-text="tag"></span>
                      </button>
                    </template>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button type="button" @click="showAddAppearanceTag = true" 
                            class="px-3 py-1 text-sm bg-link-light text-link-medium rounded-full border border-link hover:bg-link-light">
                      + Add New Tag
                    </button>
                  </div>
                  <div x-show="grapheneForm.appearanceTags && grapheneForm.appearanceTags.length > 0" class="text-sm text-gray-600">
                    Selected: <span x-text="(grapheneForm.appearanceTags || []).join(', ')"></span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- SEM Report Upload -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">SEM Reports (PDF)</label>
              
              <!-- Existing SEM Reports -->
              <div x-show="editingGraphene && (editingGraphene?.semReportPath || (editingGraphene?.semReports && editingGraphene.semReports.length > 0))" class="mb-3">
                <div class="text-xs text-gray-600 mb-2">Current SEM Reports:</div>
                
                <!-- Direct SEM Report -->
                <template x-if="editingGraphene?.semReportPath && !grapheneForm.removeSemReport">
                  <div class="mb-2 p-2 bg-link-light border border-link rounded">
                    <div class="flex items-center justify-between">
                      <div class="text-sm">
                        <span class="text-link-dark font-medium" x-text="editingGraphene?.semReportPath?.split('/').pop().replace(/_\\d+\\.pdf$/, '.pdf')"></span>
                        <span class="text-xs text-link block">Direct upload</span>
                      </div>
                      <div class="flex space-x-2">
                        <button type="button" @click="viewSemReport(editingGraphene?.semReportPath)" 
                                class="text-link text-link-hover text-sm">
                          View
                        </button>
                        <button type="button" @click="grapheneForm.removeSemReport = true" 
                                class="text-red-600 hover:text-red-900 text-sm">
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </template>
                
                <!-- Associated SEM Reports -->
                <template x-if="editingGraphene?.semReports && editingGraphene.semReports.length > 0">
                  <div class="space-y-2">
                    <template x-for="semReport in editingGraphene.semReports">
                      <div class="p-2 bg-gray-50 border border-gray-200 rounded">
                        <div class="flex items-center justify-between">
                          <div class="text-sm">
                            <span class="text-gray-800 font-medium" x-text="semReport.semReport.originalName"></span>
                            <span class="text-xs text-gray-600 block">Associated report</span>
                            <div x-show="semReport.semReport.description" class="text-xs text-gray-500 mt-1" x-text="semReport.semReport.description"></div>
                          </div>
                          <div class="flex space-x-2">
                            <button type="button" @click="viewSemPdf(semReport.semReport.filePath)" 
                                    class="text-link text-link-hover text-sm">
                              View
                            </button>
                            <button type="button" @click="removeSemReportAssociation(semReport.semReport.id)" 
                                    class="text-red-600 hover:text-red-900 text-sm">
                              Unlink
                            </button>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </div>
              
              <!-- Show removal notice -->
              <div x-show="grapheneForm.removeSemReport" class="mb-2 p-2 bg-red-50 rounded">
                <div class="flex items-center justify-between">
                  <span class="text-sm text-red-600">Direct SEM report will be removed when you save</span>
                  <button type="button" @click="grapheneForm.removeSemReport = false" 
                          class="text-gray-600 hover:text-gray-900 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
              
              <!-- Upload New Direct SEM Report -->
              <div class="border-t pt-3">
                <div class="text-sm font-medium text-gray-700 mb-2">Upload New Direct SEM Report:</div>
                
                <!-- File upload input (show if no current file, or replacing, or after removal) -->
                <div x-show="!editingGraphene || !editingGraphene?.semReportPath || grapheneForm.removeSemReport">
                  <input type="file" 
                         accept=".pdf"
                         @change="handleSemFileChange($event)"
                         class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  <p class="text-xs text-gray-500 mt-1">Upload PDF files only (max 10MB)</p>
                </div>
                
                <!-- Option to replace existing file -->
                <div x-show="editingGraphene && editingGraphene?.semReportPath && !grapheneForm.removeSemReport" class="mt-2">
                  <label class="text-sm text-gray-600">
                    <input type="checkbox" x-model="grapheneForm.replaceSemReport" class="mr-1">
                    Replace direct upload with new file
                  </label>
                  <div x-show="grapheneForm.replaceSemReport" class="mt-2">
                    <input type="file" 
                           accept=".pdf"
                           @change="handleSemFileChange($event)"
                           class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
                  </div>
                </div>
                
                <div x-show="grapheneForm.semReportFile" class="text-sm text-green-600 mt-1">
                  New file selected: <span x-text="grapheneForm.semReportFile?.name"></span>
                </div>
                
                <div class="text-xs text-gray-500 mt-2">
                  Note: To add more reports, use the SEM Reports page under Test Results.
                </div>
              </div>
            </div>
            
            <!-- Experiment Objective Section -->
            <div class="border-t pt-4">
              <h4 class="text-sm font-medium text-gray-700 mb-3">Experiment Objective & Results</h4>
              
              <!-- Paste Area -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-1">Paste Full Objective Text</label>
                <textarea x-model="grapheneForm.objectivePaste" 
                          rows="4"
                          placeholder="Paste the complete objective text here (Objective, Experiment details, Result, Conclusion, Recommended action)..."
                          class="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs"></textarea>
                <div class="flex justify-between mt-2">
                  <button type="button" 
                          @click="parseObjective()" 
                          class="px-3 py-1 text-sm bg-link text-white rounded hover:bg-link-hover">
                    Parse Text
                  </button>
                  <button type="button" 
                          @click="clearObjectiveFields()" 
                          class="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Clear All
                  </button>
                </div>
              </div>
              
              <!-- Parsed Fields -->
              <div class="space-y-3" x-show="grapheneForm.objective || grapheneForm.experimentDetails || grapheneForm.result || grapheneForm.conclusion || grapheneForm.recommendedAction">
                <div x-show="grapheneForm.objective">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Objective</label>
                  <textarea x-model="grapheneForm.objective" rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
                
                <div x-show="grapheneForm.experimentDetails">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Experiment Details</label>
                  <textarea x-model="grapheneForm.experimentDetails" rows="3"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
                
                <div x-show="grapheneForm.result">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Result</label>
                  <textarea x-model="grapheneForm.result" rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
                
                <div x-show="grapheneForm.conclusion">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Conclusion</label>
                  <textarea x-model="grapheneForm.conclusion" rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
                
                <div x-show="grapheneForm.recommendedAction">
                  <label class="block text-sm font-medium text-gray-700 mb-1">Recommended Action</label>
                  <textarea x-model="grapheneForm.recommendedAction" rows="2"
                            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"></textarea>
                </div>
              </div>
            </div>
            
            <!-- Update Reports Association -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Associated Update Reports</label>
              <div class="border border-gray-300 rounded-md p-3 max-h-32 overflow-y-auto">
                <template x-for="report in updateReports" :key="report.id">
                  <label class="flex items-center space-x-2 py-1">
                    <input type="checkbox" 
                           :checked="grapheneForm.updateReportIds && grapheneForm.updateReportIds.includes(report.id)"
                           @change="toggleUpdateReportSelection(report.id)"
                           class="rounded border-gray-300 focus:ring-black">
                    <span class="text-sm">
                      <strong x-text="report.originalName"></strong>
                      <span class="text-gray-500" x-show="report.weekOf"> - Week of <span x-text="window.formatDateSafe(report.weekOf)"></span></span>
                    </span>
                  </label>
                </template>
                <template x-if="updateReports.length === 0">
                  <div class="text-sm text-gray-500 text-center py-2">No update reports available</div>
                </template>
              </div>
              <p class="text-xs text-gray-500 mt-1">Select update reports that mention this experiment</p>
            </div>
            
            <div class="flex justify-end space-x-2 pt-4">
              <button type="button" @click="showAddGraphene = false; editingGraphene = null; grapheneForm = {}"
                      class="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit"
                      class="px-4 py-2 text-sm bg-black text-white rounded hover:bg-gray-800">
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;
}

// Export for use in main application
window.getGrapheneModalHtml = getGrapheneModalHtml;