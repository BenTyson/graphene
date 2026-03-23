# API Reference

Complete REST API documentation for the Graphene Production Control System.

---

## Table of Contents

1. [API Overview](#api-overview)
2. [Authentication APIs](#authentication-apis)
3. [Core Entity APIs](#core-entity-apis)
4. [Test Results APIs](#test-results-apis)
5. [Report Management APIs](#report-management-apis)
6. [System APIs](#system-apis)
7. [Pipeline / CRM APIs](#pipeline--crm-apis)
8. [Response Formats](#response-formats)
9. [Error Handling](#error-handling)

---

## API Overview

**Base URL (Development)**: `http://localhost:3000/api`
**Base URL (Production)**: `https://admin.hgraphene.com/api`

### Common Features

- **Default Sort**: DESC (newest first) for all list endpoints
- **File Upload Support**: Multipart form data with size limits
- **Authentication**: JWT Bearer tokens for protected endpoints
- **Error Handling**: Consistent error response format
- **CSV Export**: Available for all major entities

---

## Authentication APIs

### User Authentication

#### Login
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": boolean (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "jwt_token_string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "TEAM_MEMBER | SUPER_ADMIN"
    }
  }
}
```

**Features:**
- Rate limiting: 5 attempts per 15 minutes per IP
- bcrypt password verification
- Configurable token expiration (7d default, 30d with rememberMe)

#### Logout
```http
POST /api/auth/logout
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
```http
GET /api/auth/me
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "firstName": "string",
      "lastName": "string",
      "role": "string",
      "lastLogin": "datetime",
      "createdAt": "datetime"
    }
  }
}
```

---

## Core Entity APIs

### Biochar

#### List All Biochar Experiments
```http
GET /api/biochar
```

**Query Parameters:**
- Sort: DESC by default (newest first)
- Filters supported for all fields

#### Get Related Data
```http
GET /api/biochar/:experimentNumber/related
```

**Response:** Downstream graphene experiments and BET test data

#### Create Biochar Experiment
```http
POST /api/biochar
```

**Request Body:** Form data with experiment fields

#### Update Biochar Experiment
```http
PUT /api/biochar/:id
```

#### Delete Biochar Experiment
```http
DELETE /api/biochar/:id
```

#### Export to CSV
```http
GET /api/biochar/export/csv
```

#### Combine into Lot
```http
POST /api/biochar/combine-lots
```

**Purpose:** Combine multiple experiments into a BiocharLot

#### Get Available Lots
```http
GET /api/biochar/lots
```

---

### Graphene

#### List All Graphene Experiments
```http
GET /api/graphene
```

**Query Parameters:**
- `search` (string, optional): Search experiments, biochar source, species
- `species` (string, optional): Filter by species classification
  - `all` (default): Show all experiments
  - `species1`: KOH only (no NaOH in base2Type)
  - `species2`: KOH + NaOH (has NaOH in base2Type)
- `tested[]` (array, optional): Filter by test types (AND logic - must have all selected)
  - `bet`: Has at least one BET test
  - `conductivity`: Has at least one Conductivity test
  - `raman`: Has at least one RAMAN test
- `limit` (number, optional): Maximum records to return (default: 500)
- Sort: DESC by default

**Example Requests:**
```http
GET /api/graphene?species=species2
GET /api/graphene?tested[]=bet&tested[]=conductivity
GET /api/graphene?species=species1&tested[]=raman&search=MB
```

**Response Format:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "experimentNumber": "MB3079",
      "baseType": "KOH",
      "baseAmount": "10.00",
      "baseConcentration": "50.00",
      "base2Type": "NaOH",
      "base2Amount": "5.00",
      "base2Concentration": "30.00",
      // ... other fields
    }
  ],
  "meta": {
    "totalRecords": 150,
    "filteredRecords": 25
  }
}
```

#### Get Related Data
```http
GET /api/graphene/:experimentNumber/related
```

**Response:** Upstream biochar source and downstream test data (BET, Conductivity, RAMAN, TEM)

#### Create Graphene Experiment
```http
POST /api/graphene
```

**Features:**
- Supports SEM PDF upload (multipart/form-data)
- File size limit: 10MB per PDF

#### Update Graphene Experiment
```http
PUT /api/graphene/:id
```

**Features:** Supports SEM PDF upload

#### Delete Graphene Experiment
```http
DELETE /api/graphene/:id
```

#### Export to CSV
```http
GET /api/graphene/export/csv
```

---

### Compound Batches

#### List All Compound Batches
```http
GET /api/compound-batches
```

#### Get Single Compound Batch
```http
GET /api/compound-batches/:id
```

**Response:** Compound batch with associated experiments

#### Get by Batch Number
```http
GET /api/compound-batches/by-number/:batchNumber
```

#### Create Compound Batch
```http
POST /api/compound-batches
```

**Request Body:**
```json
{
  "batchNumber": "string",
  "batchName": "string (optional)",
  "description": "string (optional)",
  "experimentIds": ["graphene_id_1", "graphene_id_2"]
}
```

**Features:**
- Auto-calculates total output from constituent experiments
- Creates many-to-many associations

#### Update Compound Batch
```http
PUT /api/compound-batches/:id
```

**Features:** Update metadata and experiment associations

#### Delete Compound Batch
```http
DELETE /api/compound-batches/:id
```

**Important:** Preserves original graphene experiments (only removes associations)

#### Add Experiment to Batch
```http
POST /api/compound-batches/:id/experiments/:grapheneId
```

#### Remove Experiment from Batch
```http
DELETE /api/compound-batches/:id/experiments/:grapheneId
```

#### Get Related Test Data
```http
GET /api/compound-batches/:id/related
```

**Response:** Related test data and constituent experiments

#### Export to CSV
```http
GET /api/compound-batches/export/csv
```

---

### Micronization

#### List All Micronization Records
```http
GET /api/micronization
```

**Features:** Search and filtering support

#### Create Micronization Record
```http
POST /api/micronization
```

**Features:**
- PDF upload support (10MB max)
- Auto-generates SKU
- Auto-calculates recovery rate

**Request Body:** Multipart form data

#### Update Micronization Record
```http
PUT /api/micronization/:id
```

**Features:** PDF upload support

#### Delete Micronization Record
```http
DELETE /api/micronization/:id
```

**Effect:** Deletes record and associated files

#### Export to CSV
```http
GET /api/micronization/export/csv
```

---

## Test Results APIs

### BET Tests

#### List All BET Tests
```http
GET /api/bet
```

#### Create BET Test
```http
POST /api/bet
```

**Features:**
- BET PDF upload support
- Scientific notation support for surface area (e.g., 1.88e3)
- Links to grapheneSample OR compoundBatchNumber

**Request Fields:**
- `testDate` (datetime, optional)
- `grapheneSample` (string, optional)
- `compoundBatchNumber` (string, optional)
- `multipointBetArea` (decimal, optional)
- `langmuirSurfaceArea` (decimal, optional)
- `mass` (decimal with 4 decimal places, optional)
- `testingLab` (string, optional)
- `researchTeam` (string, optional)
- `comments` (string, optional)
- `betReportPath` (file upload, optional)

#### Update BET Test
```http
PUT /api/bet/:id
```

#### Delete BET Test
```http
DELETE /api/bet/:id
```

#### Export to CSV
```http
GET /api/bet/export/csv
```

---

### Conductivity Tests

#### List All Conductivity Tests
```http
GET /api/conductivity
```

#### Create Conductivity Test
```http
POST /api/conductivity
```

**Features:**
- Multi-format file support: PDF, XLSX, XLS, XLSM
- File size limit: 10MB
- Links to grapheneSample OR compoundBatchNumber

**Request Fields:**
- `testDate` (datetime, optional)
- `grapheneSample` (string, optional)
- `compoundBatchNumber` (string, optional)
- `name` (string, optional)
- `conductivity1kN` (decimal, optional)
- `conductivity8kN` (decimal, optional)
- `conductivity12kN` (decimal, optional)
- `conductivity20kN` (decimal, optional)
- `comments` (string, optional)
- `conductivityReportPath` (file upload, optional)

#### Update Conductivity Test
```http
PUT /api/conductivity/:id
```

#### Delete Conductivity Test
```http
DELETE /api/conductivity/:id
```

#### Export to CSV
```http
GET /api/conductivity/export/csv
```

---

### RAMAN Tests

#### List All RAMAN Tests
```http
GET /api/raman
```

#### Create RAMAN Test
```http
POST /api/raman
```

**Features:**
- PDF upload support
- 32-field matrix structure (4×4 data matrix)
- Links to grapheneSample OR compoundBatchNumber

**Matrix Fields:**
- Integration Range: 2D, D, G, D/G (High & Low)
- Integral Typ A: 2D, D, G, D/G (pairs 1 & 2)
- Integral Typ B: 2D, D, G, D/G (pairs 1 & 2)
- Peak High Typ J: 2D, D, G, D/G (pairs 1 & 2)

#### Update RAMAN Test
```http
PUT /api/raman/:id
```

#### Delete RAMAN Test
```http
DELETE /api/raman/:id
```

#### Export to CSV
```http
GET /api/raman/export/csv
```

---

### TEM Tests

#### List All TEM Tests
```http
GET /api/tem
```

#### Create TEM Test
```http
POST /api/tem
```

**Features:**
- PDF upload support (10MB max)
- Links to grapheneSample OR compoundBatchNumber

**Request Fields:**
- `testDate` (datetime, optional)
- `grapheneSample` (string, optional)
- `compoundBatchNumber` (string, optional)
- `testingLab` (string, optional)
- `researchTeam` (string, optional)
- `comments` (string, optional)
- `temReportPath` (file upload, optional)

#### Update TEM Test
```http
PUT /api/tem/:id
```

#### Delete TEM Test
```http
DELETE /api/tem/:id
```

#### Export to CSV
```http
GET /api/tem/export/csv
```

---

## Report Management APIs

### Update Reports

#### List All Update Reports
```http
GET /api/update-reports
```

**Response:** All reports with associated experiments

#### Upload New Report
```http
POST /api/update-reports
```

**Features:**
- File size limit: 50MB
- Supports experiment associations on upload
- Stores on Cloudinary CDN

**Request Body:** Multipart form data
- `file` (PDF required)
- `description` (string, optional)
- `weekOf` (datetime, optional)
- `experimentIds` (array of graphene IDs, optional)

#### Update Report Metadata
```http
PUT /api/update-reports/:id
```

**Purpose:** Update metadata and experiment associations

#### Delete Report
```http
DELETE /api/update-reports/:id
```

**Effect:** Deletes report and file from Cloudinary

#### Add Experiment Association
```http
POST /api/update-reports/:id/graphene/:grapheneId
```

#### Remove Experiment Association
```http
DELETE /api/update-reports/:id/graphene/:grapheneId
```

#### Get Reports for Experiment
```http
GET /api/update-reports/graphene/:experimentNumber
```

---

### SEM Reports

#### List All SEM Reports
```http
GET /api/sem-reports
```

**Response:** All SEM reports with associated experiments

#### Bulk Upload PDFs
```http
POST /api/sem-reports
```

**Features:**
- Bulk upload: Up to 10 PDFs simultaneously
- File size limit: 10MB each
- Optional experiment associations on upload
- Direct Cloudinary CDN integration

**Request Body:** Multipart form data
- `files[]` (array of PDFs, required)
- `reportDate` (datetime, optional)
- `experimentIds` (array of graphene IDs, optional)

**Note:** Direct uploads through graphene modal automatically create SEM report entries

#### Update Report Date
```http
PUT /api/sem-reports/:id
```

**Purpose:** Update report date and experiment associations

#### Delete Report
```http
DELETE /api/sem-reports/:id
```

**Effect:** Deletes report and file from Cloudinary

#### Get Single Report
```http
GET /api/sem-reports/:id
```

**Response:** SEM report with all associations

#### Get Reports for Experiment
```http
GET /api/sem-reports/graphene/:experimentNumber
```

#### Add Experiment Association
```http
POST /api/sem-reports/:id/graphene/:grapheneId
```

#### Remove Experiment Association
```http
DELETE /api/sem-reports/:id/graphene/:grapheneId
```

---

## System APIs

### Material Shipments

#### List All Shipments
```http
GET /api/shipments
```

**Features:** Search and filtering support

#### Create Shipment
```http
POST /api/shipments
```

**Features:**
- Auto-generated shipment number (SHIP-YYYY-MM-HHMMSS format)
- Triple material support (graphene, compound batch, OR micronization SKU)
- Status tracking

**Request Body:**
```json
{
  "shipFromLocation": "string",
  "shipToLocation": "string",
  "shipmentDate": "datetime (optional)",
  "amountShipped": "decimal (optional)",
  "unit": "string (default: 'g')",
  "purpose": "string (optional)",
  "grapheneSample": "string (optional)",
  "compoundBatchNumber": "string (optional)",
  "micronizationSku": "string (optional)",
  "status": "pending | shipped | in_transit | received (optional)",
  "comments": "string (optional)"
}
```

#### Update Shipment
```http
PUT /api/shipments/:id
```

#### Delete Shipment
```http
DELETE /api/shipments/:id
```

#### Export to CSV
```http
GET /api/shipments/export/csv
```

#### Get 'From' Locations
```http
GET /api/shipments/locations/from
```

**Response:** Array of unique 'from' locations for dropdown

#### Get 'To' Locations
```http
GET /api/shipments/locations/to
```

**Response:** Array of unique 'to' locations for dropdown

---

### Dashboard

#### Get Production Metrics
```http
GET /api/dashboard/production-metrics
```

**Response:**
```json
{
  "totalProduction": "decimal",
  "experimentCount": "integer",
  "averageOutput": "decimal",
  "currentMonth": {
    "production": "decimal",
    "experiments": "integer"
  },
  "previousMonth": {
    "production": "decimal",
    "experiments": "integer"
  },
  "percentageChange": {
    "production": "decimal",
    "experiments": "decimal"
  },
  "monthlyTrend": [
    {
      "month": "string",
      "production": "decimal",
      "experiments": "integer"
    }
  ]
}
```

**Features:**
- Total graphene production
- Experiment counts
- Average output
- Current vs previous month comparison
- 6-month production trend data

#### Get Inventory by Location
```http
GET /api/dashboard/inventory-by-location
```

**Response:**
```json
{
  "locations": [
    {
      "location": "string",
      "shippedTo": "decimal",
      "shippedFrom": "decimal",
      "currentBalance": "decimal",
      "inTransit": "decimal",
      "shipmentCount": "integer"
    }
  ]
}
```

**Features:**
- Materials shipped TO and FROM each location
- Current inventory balance (received - shipped)
- In-transit materials tracking
- Shipment counts

#### Get Best Test Results
```http
GET /api/dashboard/best-test-results
```

**Response:**
```json
{
  "bestBET": [
    {
      "sample": "string",
      "multipointBetArea": "decimal",
      "testDate": "datetime",
      "testingLab": "string"
    }
  ],
  "bestConductivity": [
    {
      "sample": "string",
      "conductivity1kN": "decimal",
      "conductivity8kN": "decimal",
      "conductivity12kN": "decimal",
      "conductivity20kN": "decimal",
      "testDate": "datetime"
    }
  ],
  "bestRAMAN": [
    {
      "sample": "string",
      "dgRatio": "decimal",
      "testDate": "datetime",
      "testingLab": "string"
    }
  ]
}
```

**Features:**
- Highest BET surface area measurements
- Best conductivity results at all pressure levels
- Lowest RAMAN D/G ratios (quality indicators)

---

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### List Response (with pagination)

```json
{
  "success": true,
  "data": [
    // Array of records
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "limit": "integer"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

---

## Error Handling

### Common Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate records)
- `413` - Payload Too Large (file size limits)
- `429` - Too Many Requests (rate limiting)
- `500` - Internal Server Error

### Authentication Errors

**Missing Token:**
```json
{
  "success": false,
  "error": {
    "message": "No token provided",
    "code": "NO_TOKEN"
  }
}
```

**Invalid Token:**
```json
{
  "success": false,
  "error": {
    "message": "Invalid token",
    "code": "INVALID_TOKEN"
  }
}
```

**Expired Token:**
```json
{
  "success": false,
  "error": {
    "message": "Token expired",
    "code": "TOKEN_EXPIRED"
  }
}
```

### Validation Errors

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "code": "VALIDATION_ERROR",
    "details": {
      "fieldName": ["Error message 1", "Error message 2"]
    }
  }
}
```

---

## File Upload Specifications

### General File Limits

- **PDF Files**: 10MB max (standard)
- **Update Reports**: 50MB max
- **Excel Files**: 10MB max (.xlsx, .xls, .xlsm)
- **Bulk SEM Upload**: 10 files × 10MB each

### Supported File Types

- **Test Reports**: PDF
- **Conductivity Reports**: PDF, XLSX, XLS, XLSM
- **Update Reports**: PDF
- **SEM Reports**: PDF
- **Micronization Reports**: PDF

### File Storage

- **Development**: Cloudinary CDN (`graphene-uploads-dev` folder)
- **Production**: Cloudinary CDN (`graphene-uploads` folder)
- **URL Format**: Full Cloudinary URLs stored in database

---

## Rate Limiting

### Authentication Endpoints

- **Login**: 5 attempts per 15 minutes per IP address
- **Other Auth**: No rate limiting

### Data Endpoints

- **No Rate Limiting**: Currently no rate limits on data endpoints
- **Future**: May implement API key-based rate limiting

---

## API Best Practices

### Making Requests

1. **Include Authentication**: Always include Bearer token for protected endpoints
2. **Handle Errors**: Check `success` field in response
3. **Validate Files**: Check file size before upload
4. **Use Filters**: Utilize query parameters for efficient data retrieval
5. **Pagination**: Handle paginated responses when listing large datasets

### Example Request (with fetch)

```javascript
const response = await fetch('/api/graphene', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log('Data:', result.data);
} else {
  console.error('Error:', result.error.message);
}
```

### Example File Upload

```javascript
const formData = new FormData();
formData.append('file', pdfFile);
formData.append('testDate', '2025-01-15');
formData.append('grapheneSample', 'MRa389A');

const response = await fetch('/api/bet', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
    // Don't set Content-Type for multipart/form-data
  },
  body: formData
});
```

---

## Task Management APIs

Route file: `server/routes/tasks.js`
Auth: All endpoints require JWT + internal role (SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, TEAM_MEMBER). THIRD_PARTY and INVESTOR blocked.

### Endpoints

```
GET    /api/tasks/assignees                    - List assignable users (id, name, role)
GET    /api/tasks/stats                        - Counts by status + myTasks + overdue
GET    /api/tasks                              - List root tasks (filters: status, priority, assigneeId, search, overdue, sortBy, order, limit, offset)
GET    /api/tasks/:id                          - Detail with subtasks, comments, attachments, activity
POST   /api/tasks                              - Create task (title required; description, status, priority, dueDate, assigneeId, parentId, tags optional)
PUT    /api/tasks/:id                          - Update task (creator + SUPER_ADMIN only)
DELETE /api/tasks/:id                          - Delete task + subtasks + attachment files (creator + SUPER_ADMIN only)
PATCH  /api/tasks/:id/status                   - Quick status change (status, position)
PATCH  /api/tasks/:id/position                 - Reorder within column
PATCH  /api/tasks/reorder                      - Batch position update for drag-and-drop (taskId, newStatus, positions[])
POST   /api/tasks/:id/comments                 - Add comment (content required)
DELETE /api/tasks/:id/comments/:cid            - Delete comment (author + SUPER_ADMIN only)
POST   /api/tasks/:id/attachments              - Upload files (multipart, field: 'attachments', max 5 files, 15MB each)
DELETE /api/tasks/:id/attachments/:attachmentId - Delete attachment (uploader, task creator, or SUPER_ADMIN)
```

### Task Status Flow
`TODO` -> `IN_PROGRESS` -> `IN_REVIEW` -> `DONE` (also `ARCHIVED`)

Kanban board shows 4 active columns (TODO, IN_PROGRESS, IN_REVIEW, DONE). ARCHIVED tasks are hidden by default, toggled via "Show archived" filter.

### Drag-and-Drop
`PATCH /api/tasks/reorder` accepts `{ taskId, newStatus, positions: [{ id, position }] }`. Atomically updates the dragged task's status (if column changed) and all affected positions in a Prisma transaction.

### Attachments
Upload via `POST /:id/attachments` with multipart form data (field name: `attachments`). Accepted types: PDF, JPG, PNG, GIF, DOCX, XLSX, XLS, DOC, TXT, CSV. Files stored via Cloudinary (production) or local `uploads/task-attachments/` (dev). Task deletion auto-cleans attachment files from storage.

### Activity Logging
All changes auto-log to TaskActivity: created, status_changed, assigned, priority_changed, due_date_changed, comment_added, edited, attachment_added, attachment_removed.

## Pipeline / CRM APIs

Route file: `server/routes/pipeline.js`
Auth: All endpoints require JWT + internal role (SUPER_ADMIN, SCIENCE_TEAM, EXECUTIVE_TEAM, TEAM_MEMBER). THIRD_PARTY and INVESTOR blocked.

### Endpoints

```
GET    /api/pipeline/owners                                  - List assignable users (id, name, role)
GET    /api/pipeline/stats                                   - Contact counts by type, pipeline counts by stage, overdue follow-ups
GET    /api/pipeline/contacts                                - List contacts (filters: contactType, contactKind, ownerId, search, onPipeline, sortBy, order, limit, offset)
GET    /api/pipeline/contacts/:id                            - Detail with company/people, activities, attachments
POST   /api/pipeline/contacts                                - Create contact (name required; contactType optional, contactKind, email, phone, role, source, tags, companyId, etc.)
PUT    /api/pipeline/contacts/:id                            - Update contact (stage changes log activity, terminal stages set closedAt)
DELETE /api/pipeline/contacts/:id                            - Delete contact + cascade activities, attachments (owner + SUPER_ADMIN only)
POST   /api/pipeline/contacts/:id/activities                 - Log activity (action + content; types: note_added, call_logged, email_sent, meeting)
POST   /api/pipeline/contacts/:id/attachments                - Upload files (multipart, field: 'attachments', max 5 files, 15MB each)
DELETE /api/pipeline/contacts/:id/attachments/:attachmentId  - Delete attachment (uploader, contact owner, or SUPER_ADMIN)
POST   /api/pipeline/contacts/:id/add-to-pipeline            - Add contact to pipeline board (sets contactType + first stage + position + optional pipelineTitle)
POST   /api/pipeline/contacts/:id/remove-from-pipeline       - Remove contact from pipeline (clears stage, position, closedAt)
PATCH  /api/pipeline/contacts/reorder                        - Batch position update for drag-and-drop (contactId, newStage, positions[])
```

### Contact Model
Two kinds: PERSON (individual) and COMPANY (organization). A Person can link to a Company via companyId (self-referential). Company contact details flow through linked people; company itself stores only general email and website as backup.

Contacts ARE the pipeline items. Pipeline fields on Contact: `pipelineTitle` (optional card label), `stage` (nullable -- null means not on any board), `position` (int for Kanban ordering), `closedAt`, `lostReason`. `contactType` (CLIENT/INVESTOR/PARTNER) is optional and determines which pipeline board the contact appears on. Removing from pipeline clears all pipeline fields including pipelineTitle.

### Pipeline Types & Stages
Each contact on the pipeline has a contactType (CLIENT, INVESTOR, PARTNER). Stage is stored directly on the Contact as a string:
- **CLIENT**: LEAD → QUALIFIED → SAMPLE_SENT → EVALUATION → NEGOTIATION → WON | LOST
- **INVESTOR**: IDENTIFIED → OUTREACH → MEETING → DUE_DILIGENCE → TERM_SHEET → COMMITTED | PASSED
- **PARTNER**: IDENTIFIED → INITIAL_CONTACT → EXPLORING → PROPOSAL → ACTIVE | INACTIVE

Terminal stages (WON, LOST, COMMITTED, PASSED, INACTIVE) auto-set `closedAt`. Re-opening clears it.

### Drag-and-Drop
`PATCH /api/pipeline/contacts/reorder` accepts `{ contactId, newStage, positions: [{ id, position }] }`. Same pattern as task reorder -- atomically updates stage and positions in a transaction.

### Activity Logging
Contact activities auto-update `lastContactedAt` for interaction types (note_added, call_logged, email_sent, meeting). System-generated activities track stage_changed, added_to_pipeline, removed_from_pipeline, type_changed, owner_changed, attachment_added, attachment_removed.

### Attachments
Same pattern as tasks. Upload via `POST /contacts/:id/attachments` with multipart form data. Accepted types: PDF, JPG, PNG, GIF, DOCX, XLSX, XLS, DOC, TXT, CSV. 15MB limit per file.

---

## Additional Test Type APIs (added post-initial docs)

### Particle Size Tests
```
GET/POST/PUT/DELETE /api/particle-size[/:id]
GET /api/particle-size/export/csv
```
Fields: d10, d50, d90, span. References Graphene, CompoundBatch, Micronization, MCB.

### XRD Tests
```
GET/POST/PUT/DELETE /api/xrd[/:id]
GET /api/xrd/export/csv
```
Multi-file report upload. References Graphene, CompoundBatch, Micronization, MCB.

### XPS Tests
```
GET/POST/PUT/DELETE /api/xps[/:id]
GET /api/xps/export/csv
```
Multi-file report upload. Extensive elemental composition data. References Graphene, CompoundBatch, Micronization, MCB.

### MCB (Micronized Compound Batch)
```
GET/POST/PUT/DELETE /api/mcb[/:id]
GET /api/mcb/available/micronizations
GET /api/mcb/export/csv
```
Groups multiple Micronization records. totalRecoveredAmount auto-calculated.

---

**Last Updated:** March 22, 2026
**API Version:** 2.0
**For Database Schema:** See [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md)
