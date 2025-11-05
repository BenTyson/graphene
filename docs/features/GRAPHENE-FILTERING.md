# Graphene Filtering System

**Server-side filtering for graphene experiments with toggle-based UI**

---

## Overview

The graphene table features a streamlined filtering system that allows users to filter experiments by:
1. **Species Classification** - Chemical composition (KOH vs KOH+NaOH)
2. **Test Types** - Which characterization tests have been performed

All filters use **server-side processing** with efficient Prisma relation queries for optimal performance.

---

## Species Classification

### Definition

Experiments are automatically classified based on their base composition:

- **Species 1**: KOH only
  - `base2Type` is `null` OR `base2Type` is not "NaOH"
  - Single base chemistry

- **Species 2**: KOH + NaOH
  - `base2Type === "NaOH"`
  - Dual base chemistry

### UI Implementation

**Location**: `client/src/js/components/tabs/GrapheneTab.js` (lines 54-76)

**Toggle Buttons:**
```
Species: [All] [Species 1 (KOH only)] [Species 2 (KOH + NaOH)]
```

**Behavior:**
- Single-select (only one species can be selected at a time)
- Default: "All" (shows all experiments)
- Selected button: Black background
- Unselected buttons: White background

### Backend Implementation

**Location**: `server/routes/graphene.js` (lines 32-44)

**Prisma Query Logic:**
```javascript
if (speciesFilter === 'species1') {
  where.OR = [
    { base2Type: null },
    { base2Type: { not: 'NaOH' } }
  ];
} else if (speciesFilter === 'species2') {
  where.base2Type = 'NaOH';
}
```

---

## Test Type Filtering

### Definition

Filter experiments by which characterization tests have been performed:

- **BET**: Surface area analysis tests
- **Conductivity**: Electrical conductivity measurements
- **RAMAN**: Raman spectroscopy analysis

### Logic

**Multi-select with AND logic**: Experiments must have ALL selected test types.

**Examples:**
- Select BET only → Shows experiments with at least one BET test
- Select BET + Conductivity → Shows experiments with BOTH BET AND Conductivity tests
- Select all three → Shows experiments with BET AND Conductivity AND RAMAN tests

### UI Implementation

**Location**: `client/src/js/components/tabs/GrapheneTab.js` (lines 81-101)

**Toggle Buttons:**
```
Tested: [BET] [Conductivity] [RAMAN]
```

**Behavior:**
- Multi-select (multiple tests can be selected simultaneously)
- No default selection (shows all experiments)
- Selected buttons: Black background
- Unselected buttons: White background
- Clicking toggles selection on/off

### State Management

**Location**: `client/src/js/app-refactored.js`

**State Variable** (line 460):
```javascript
grapheneTestedFilters: []  // Array of selected test types
```

**Toggle Method** (lines 1243-1251):
```javascript
toggleTestedFilter(testType) {
  const index = this.grapheneTestedFilters.indexOf(testType);
  if (index > -1) {
    // Remove - create new array for Alpine reactivity
    this.grapheneTestedFilters = this.grapheneTestedFilters.filter(t => t !== testType);
  } else {
    // Add - create new array for Alpine reactivity
    this.grapheneTestedFilters = [...this.grapheneTestedFilters, testType];
  }
}
```

**Note**: Uses array spread/filter to create new arrays instead of mutating, ensuring Alpine.js detects changes.

### Backend Implementation

**Location**: `server/routes/graphene.js` (lines 46-61)

**Prisma Query Logic:**
```javascript
const testedFilters = req.query['tested[]'] || req.query.tested;
if (testedFilters) {
  const filters = Array.isArray(testedFilters) ? testedFilters : [testedFilters];

  filters.forEach(testType => {
    if (testType === 'bet') {
      where.betTests = { some: {} };
    } else if (testType === 'conductivity') {
      where.conductivityTests = { some: {} };
    } else if (testType === 'raman') {
      where.ramanTests = { some: {} };
    }
  });
}
```

**Efficiency**: Uses Prisma's `{ some: {} }` relation query to check for test existence without loading test data.

---

## API Integration

### Query Parameters

**Endpoint**: `GET /api/graphene`

**Parameters:**
```
?species=species1              // Single species filter
?tested[]=bet                  // Single test filter
?tested[]=bet&tested[]=raman   // Multiple test filters (AND logic)
?species=species2&tested[]=bet // Combined filters
```

### Request Flow

1. **Frontend**: User clicks filter button
2. **State Update**: Filter state updated (grapheneSpeciesFilter or grapheneTestedFilters)
3. **API Call**: `loadGrapheneRecords()` triggered
4. **Query Build**: URLSearchParams constructed with filters
5. **Backend**: Prisma WHERE clause built with filter conditions
6. **Response**: Filtered graphene records returned
7. **Display**: Table updates with filtered results

### Data Loading

**Location**: `client/src/js/app-refactored.js` (lines 1054-1089)

```javascript
async loadGrapheneRecords() {
  const params = new URLSearchParams();

  if (this.grapheneSearch) {
    params.append('search', this.grapheneSearch);
  }

  if (this.grapheneSpeciesFilter) {
    params.append('species', this.grapheneSpeciesFilter);
  }

  if (this.grapheneTestedFilters && this.grapheneTestedFilters.length > 0) {
    this.grapheneTestedFilters.forEach(testType => {
      params.append('tested[]', testType);
    });
  }

  const response = await fetch(`/api/graphene?${params}`);
  // ... handle response
}
```

---

## Database Relationships

### Test Associations

All test models link to graphene via `experimentNumber`:

**BET Model:**
```prisma
model BET {
  grapheneSample String?  // Links to Graphene.experimentNumber
  grapheneRef    Graphene? @relation(fields: [grapheneSample], references: [experimentNumber])
}
```

**Similar structure for:**
- ConductivityTest
- RamanTest
- TEMTest (available but not in UI yet)

### Relation Queries

Prisma's `{ some: {} }` checks for related records without loading them:

```javascript
where.betTests = { some: {} }
// Returns experiments that have at least one related BET record
// Efficient: No JOIN needed, just relationship check
```

---

## NaOH Percentage Display

### Table Column

**Location**: `client/src/js/components/tabs/GrapheneTab.js` (line 195)

New "NaOH%" column added to BASE section showing:
- **Species 1**: `0%` (no NaOH)
- **Species 2**: Calculated percentage (e.g., `33.3%`)

**Calculation** (lines 284-295):
```javascript
const baseAmt = parseFloat(record.baseAmount) || 0;
const base2Amt = parseFloat(record.base2Amount) || 0;
const totalBase = baseAmt + base2Amt;

if (record.base2Type === 'NaOH') {
  return ((base2Amt / totalBase) * 100).toFixed(1) + '%';
}
return '0%';
```

### Detail Page

**Location**: `client/src/js/components/dataPage/DataPageSection.js`

**Equipment & Base Section** (line 112):
- Title shows: `"Equipment & Base (Species 1)"` or `"Equipment & Base (Species 2)"`
- Base row displays both bases when present: `"10g KOH (50%) + 5g NaOH (30%)"`

---

## Visual Appearance vs Species

**Important Distinction:**

- **Species Field** (database): Visual appearance descriptors
  - Examples: "1/2 Mix", "Mostly 2", "Fluffy"
  - Shown in: Detail page Appearance section
  - User-entered observation of physical appearance

- **Species Classification** (computed): Chemical composition
  - Values: "Species 1" or "Species 2"
  - Based on: NaOH presence in base2Type
  - Used for: Filtering and categorization

These are separate concepts despite similar naming.

---

## Filter Combinations

Filters work together with AND logic:

| Species | Tested | Result |
|---------|--------|--------|
| All | None | All experiments |
| Species 1 | None | KOH-only experiments |
| Species 2 | None | KOH+NaOH experiments |
| All | BET | Experiments with BET tests |
| Species 2 | BET + Conductivity | KOH+NaOH experiments with both BET and Conductivity |

### Search Integration

Search works alongside filters:
```
Search: "MB" + Species: Species 2 + Tested: BET
→ Shows MB-series experiments that are Species 2 and have BET tests
```

---

## Performance Considerations

### Why Server-Side?

1. **Test data not loaded initially**: Tests are fetched on-demand when rows expand
2. **Efficient queries**: Prisma relation checks don't require loading test records
3. **Scalability**: Works with large datasets without client-side filtering overhead
4. **Accurate counts**: Server knows total vs filtered record counts

### Query Efficiency

**Species Filter:**
- Simple field comparison (`base2Type === 'NaOH'`)
- Uses indexed column

**Test Filter:**
- Relation existence checks (`{ some: {} }`)
- No JOIN overhead
- Fast even with thousands of test records

---

## Future Enhancements

Potential additions to filtering system:

1. **Date Range Filter**: Filter by experiment date
2. **Temperature Filter**: Min/max temperature values
3. **Output Filter**: Min/max output amounts
4. **TEM Filter**: Add TEM to test type filters
5. **Compound Batch Association**: Filter by batch membership
6. **Save Filter Presets**: User-saved filter combinations

---

## Troubleshooting

### Filter Not Working

1. Check browser console for errors
2. Verify query parameters in network tab
3. Check server logs for Prisma query errors
4. Ensure database relationships exist

### Button Not Toggling

**Issue**: Alpine.js not detecting array changes

**Solution**: Use array spread/filter instead of splice/push
```javascript
// ❌ Don't mutate
this.array.push(item);

// ✅ Create new array
this.array = [...this.array, item];
```

### Empty Results

1. Verify experiments have the required data (base2Type for Species 2)
2. Verify test records exist and link to experiments via experimentNumber
3. Check for null/undefined values in filter fields

---

**Last Updated**: January 2025
**Related Documentation**:
- [API-REFERENCE.md](../core-reference/API-REFERENCE.md) - API endpoints and parameters
- [DATABASE-SCHEMA.md](../core-reference/DATABASE-SCHEMA.md) - Database structure
- [SESSION-START.md](../session-start/SESSION-START.md) - Quick start guide
