# Database Schema Reference

Complete Prisma schema documentation for the Graphene Production Control System.

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Complete Prisma Schema](#complete-prisma-schema)
3. [Model Descriptions](#model-descriptions)
4. [Relationships](#relationships)
5. [Design Principles](#design-principles)
6. [Important Notes](#important-notes)

---

## Schema Overview

**Database**: PostgreSQL
**ORM**: Prisma
**Schema Location**: `/prisma/schema.prisma`

### Material Pipeline

```
Raw Materials → Biochar → Graphene → Compound Batch/Micronization → MCB (optional) → Testing → Shipment
```

### Model Categories

- **Authentication**: User
- **Core Production**: Biochar, BiocharLot, Graphene, CompoundBatch, Micronization, MicronizedCompoundBatch, MicronizationMCB
- **Testing**: BET, ConductivityTest, RamanTest, TEMTest, ParticleSizeTest, XRDTest, XPSTest
- **Reports**: UpdateReport, SemReport (with junction tables)
- **Shipments**: MaterialShipment
- **News & AI**: NewsSource, NewsArticle, UserBookmark, KnowledgeDocument
- **References**: CharacterizationReference

---

## Complete Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================================
// AUTHENTICATION MODELS
// ============================================================================

model User {
  id           String    @id @default(cuid())
  username     String    @unique
  email        String    @unique
  passwordHash String    @map("password_hash")
  role         UserRole  @default(TEAM_MEMBER)
  firstName    String?   @map("first_name")
  lastName     String?   @map("last_name")
  isActive     Boolean   @default(true) @map("is_active")
  lastLogin    DateTime? @map("last_login")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime  @updatedAt @map("updated_at")

  @@index([username])
  @@index([email])
  @@index([role])
  @@map("users")
}

enum UserRole {
  SUPER_ADMIN
  SCIENCE_TEAM
  EXECUTIVE_TEAM
  INVESTOR
  TEAM_MEMBER
}

// ============================================================================
// CORE PRODUCTION MODELS
// ============================================================================

model Biochar {
  id                  String      @id @default(cuid())
  experimentNumber    String      @unique @map("experiment_number")
  reactor             String?
  rawMaterial         String?     @map("raw_material")
  acidAmount          Decimal?    @map("acid_amount") @db.Decimal(10, 2)
  acidConcentration   Decimal?    @map("acid_concentration") @db.Decimal(5, 2)
  acidMolarity        Decimal?    @map("acid_molarity") @db.Decimal(5, 2)
  acidType            String?     @map("acid_type")
  temperature         Decimal?    @db.Decimal(6, 2)
  time                Decimal?    @db.Decimal(10, 2)
  pressureInitial     Decimal?    @map("pressure_initial") @db.Decimal(10, 2)
  pressureFinal       Decimal?    @map("pressure_final") @db.Decimal(10, 2)
  washAmount          Decimal?    @map("wash_amount") @db.Decimal(10, 2)
  washMedium          String?     @map("wash_medium")
  output              Decimal?    @db.Decimal(10, 2)
  dryingTemp          Decimal?    @map("drying_temp") @db.Decimal(6, 2)
  kftPercentage       Decimal?    @map("kft_percentage") @db.Decimal(5, 2)
  comments            String?
  createdAt           DateTime    @default(now()) @map("created_at")
  updatedAt           DateTime    @updatedAt @map("updated_at")
  experimentDate      DateTime?   @map("experiment_date")
  testOrder           Int?        @map("test_order")
  startingAmount      Decimal?    @map("starting_amount") @db.Decimal(10, 2)
  lotNumber           String?     @map("lot_number")
  researchTeam        String?     @map("research_team")
  lot                 BiocharLot? @relation(fields: [lotNumber], references: [lotNumber])
  grapheneProductions Graphene[]

  @@index([createdAt])
  @@index([testOrder])
  @@index([experimentDate])
  @@index([lotNumber])
  @@map("biochar")
}

model BiocharLot {
  id                  String     @id @default(cuid())
  lotNumber           String     @unique @map("lot_number")
  lotName             String?    @map("lot_name")
  description         String?
  createdAt           DateTime   @default(now()) @map("created_at")
  updatedAt           DateTime   @updatedAt @map("updated_at")
  experiments         Biochar[]
  grapheneProductions Graphene[]

  @@map("biochar_lots")
}

model Graphene {
  id                   String                  @id @default(cuid())
  experimentNumber     String                  @unique @map("experiment_number")
  oven                 String?
  quantity             Decimal?                @db.Decimal(10, 2)
  baseAmount           Decimal?                @map("base_amount") @db.Decimal(10, 2)
  baseType             String?                 @map("base_type")
  baseConcentration    Decimal?                @map("base_concentration") @db.Decimal(5, 2)
  grindingMethod       GrindingMethod?         @map("grinding_method")
  grindingTime         Decimal?                @map("grinding_time") @db.Decimal(10, 2)
  gas                  String?
  tempRate             String?                 @map("temp_rate")
  tempMax              Decimal?                @map("temp_max") @db.Decimal(6, 2)
  time                 Decimal?                @db.Decimal(10, 2)
  washAmount           Decimal?                @map("wash_amount") @db.Decimal(10, 2)
  washSolution         String?                 @map("wash_solution")
  dryingTemp           Decimal?                @map("drying_temp") @db.Decimal(6, 2)
  dryingAtmosphere     String?                 @map("drying_atmosphere")
  dryingPressure       String?                 @map("drying_pressure")
  output               Decimal?                @db.Decimal(10, 2)
  species              String?
  comments             String?
  createdAt            DateTime                @default(now()) @map("created_at")
  updatedAt            DateTime                @updatedAt @map("updated_at")
  experimentDate       DateTime?               @map("experiment_date")
  testOrder            Int?                    @map("test_order")
  biocharExperiment    String?                 @map("biochar_experiment")
  appearanceTags       String[]                @map("appearance_tags")
  density              Decimal?                @db.Decimal(10, 4)
  homogeneous          Boolean?
  volumeMl             Decimal?                @map("volume_ml") @db.Decimal(10, 2)
  washConcentration    Decimal?                @map("wash_concentration") @db.Decimal(5, 2)
  washWater            String?                 @map("wash_water")
  biocharLotNumber     String?                 @map("biochar_lot_number")
  researchTeam         String?                 @map("research_team")
  semReportPath        String?                 @map("sem_report_path")
  base2Amount          Decimal?                @map("base2_amount") @db.Decimal(10, 2)
  base2Concentration   Decimal?                @map("base2_concentration") @db.Decimal(5, 2)
  base2Type            String?                 @map("base2_type")
  conclusion           String?
  experimentDetails    String?                 @map("experiment_details")
  objective            String?
  recommendedAction    String?                 @map("recommended_action")
  result               String?
  grindingFrequency    Decimal?                @map("grinding_frequency") @db.Decimal(10, 2)
  titleNote            String?                 @map("title_note")
  grindingCount        Int?                    @map("grinding_count")
  betTests             BET[]
  conductivityTests    ConductivityTest[]
  biocharExperimentRef Biochar?                @relation(fields: [biocharExperiment], references: [experimentNumber])
  biocharLotRef        BiocharLot?             @relation(fields: [biocharLotNumber], references: [lotNumber])
  compoundBatches      GrapheneCompoundBatch[]
  semReports           GrapheneSemReport[]
  updateReports        GrapheneUpdateReport[]
  shipments            MaterialShipment[]
  micronizations       Micronization[]
  ramanTests           RamanTest[]
  temTests             TEMTest[]

  @@index([biocharExperiment])
  @@index([biocharLotNumber])
  @@index([createdAt])
  @@index([testOrder])
  @@index([experimentDate])
  @@map("graphene")
}

model CompoundBatch {
  id                String                      @id @default(cuid())
  batchNumber       String                      @unique @map("batch_number")
  batchName         String?                     @map("batch_name")
  description       String?
  createdDate       DateTime?                   @map("created_date")
  totalOutput       Decimal?                    @map("total_output") @db.Decimal(10, 2)
  createdAt         DateTime                    @default(now()) @map("created_at")
  updatedAt         DateTime                    @updatedAt @map("updated_at")
  betTests          BET[]
  semReports        CompoundBatchSemReport[]
  updateReports     CompoundBatchUpdateReport[]
  conductivityTests ConductivityTest[]
  experiments       GrapheneCompoundBatch[]
  shipments         MaterialShipment[]
  micronizations    Micronization[]
  ramanTests        RamanTest[]
  temTests          TEMTest[]

  @@index([createdAt])
  @@index([createdDate])
  @@map("compound_batches")
}

model GrapheneCompoundBatch {
  id              String        @id @default(cuid())
  grapheneId      String        @map("graphene_id")
  compoundBatchId String        @map("compound_batch_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  compoundBatch   CompoundBatch @relation(fields: [compoundBatchId], references: [id], onDelete: Cascade)
  graphene        Graphene      @relation(fields: [grapheneId], references: [id], onDelete: Cascade)

  @@unique([grapheneId, compoundBatchId])
  @@map("graphene_compound_batches")
}

model Micronization {
  id                      String            @id @default(cuid())
  micronizationNumber     String            @unique @map("micronization_number")
  date                    DateTime?         @map("date")
  sku                     String?           @unique
  startingMaterialAmount  Decimal?          @map("starting_material_amount") @db.Decimal(10, 2)
  recoveredAmount         Decimal?          @map("recovered_amount") @db.Decimal(10, 2)
  grindPressure           Int?              @map("grind_pressure")
  micronizationReportPath String?           @map("micronization_report_path")
  grapheneSample          String?           @map("graphene_sample")
  compoundBatchNumber     String?           @map("compound_batch_number")
  createdAt               DateTime          @default(now()) @map("created_at")
  updatedAt               DateTime          @updatedAt @map("updated_at")
  dx50                    String?           @map("dx50")
  micronizationLocation   String?           @map("micronization_location")
  shipments               MaterialShipment[] @relation("MicronizationShipments")
  compoundBatchRef        CompoundBatch?    @relation(fields: [compoundBatchNumber], references: [batchNumber])
  grapheneRef             Graphene?         @relation(fields: [grapheneSample], references: [experimentNumber])
  mcbMembership           MicronizationMCB? // Optional - only populated if part of an MCB

  @@index([date])
  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([sku])
  @@index([micronizationLocation])
  @@index([grapheneSample, date])
  @@index([compoundBatchNumber, date])
  @@index([sku, date])
  @@index([micronizationLocation, date])
  @@map("micronizations")
}

model MicronizedCompoundBatch {
  id                   String              @id @default(cuid())
  mcbNumber            String              @unique @map("mcb_number")
  totalRecoveredAmount Decimal?            @map("total_recovered_amount") @db.Decimal(10, 2)
  mcbLocation          String?             @map("mcb_location")
  combinedDate         DateTime?           @map("combined_date")
  createdAt            DateTime            @default(now()) @map("created_at")
  updatedAt            DateTime            @updatedAt @map("updated_at")
  comments             String?
  micronizations       MicronizationMCB[]
  shipments            MaterialShipment[]

  @@index([mcbNumber])
  @@index([createdAt])
  @@index([combinedDate])
  @@map("micronized_compound_batches")
}

model MicronizationMCB {
  id                        String                  @id @default(cuid())
  micronizationId           String                  @unique @map("micronization_id")
  micronizedCompoundBatchId String                  @map("mcb_id")
  micronization             Micronization           @relation(fields: [micronizationId], references: [id], onDelete: Cascade)
  mcb                       MicronizedCompoundBatch @relation(fields: [micronizedCompoundBatchId], references: [id], onDelete: Cascade)

  @@unique([micronizationId])
  @@map("micronization_mcbs")
}

// ============================================================================
// TESTING MODELS
// ============================================================================

model BET {
  id                  String         @id @default(cuid())
  testDate            DateTime?      @map("test_date")
  grapheneSample      String?        @map("graphene_sample")
  multipointBetArea   Decimal?       @map("multipoint_bet_area") @db.Decimal(10, 4)
  langmuirSurfaceArea Decimal?       @map("langmuir_surface_area") @db.Decimal(10, 4)
  comments            String?
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")
  betReportPath       String?        @map("bet_report_path")
  researchTeam        String?        @map("research_team")
  testingLab          String?        @map("testing_lab")
  mass                Decimal?       @db.Decimal(10, 4)
  compoundBatchNumber String?        @map("compound_batch_number")
  compoundBatchRef    CompoundBatch? @relation(fields: [compoundBatchNumber], references: [batchNumber])
  grapheneRef         Graphene?      @relation(fields: [grapheneSample], references: [experimentNumber])

  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([createdAt])
  @@index([testDate])
  @@index([grapheneSample, testDate])
  @@index([compoundBatchNumber, testDate])
  @@index([testingLab, testDate])
  @@map("bet")
}

model ConductivityTest {
  id                     String         @id @default(cuid())
  testDate               DateTime?      @map("test_date")
  grapheneSample         String?        @map("graphene_sample")
  description            String?
  conductivity1kN        Decimal?       @map("conductivity_1kn") @db.Decimal(12, 6)
  conductivity8kN        Decimal?       @map("conductivity_8kn") @db.Decimal(12, 6)
  conductivity12kN       Decimal?       @map("conductivity_12kn") @db.Decimal(12, 6)
  conductivity20kN       Decimal?       @map("conductivity_20kn") @db.Decimal(12, 6)
  comments               String?
  createdAt              DateTime       @default(now()) @map("created_at")
  updatedAt              DateTime       @updatedAt @map("updated_at")
  compoundBatchNumber    String?        @map("compound_batch_number")
  conductivityReportPath String?        @map("conductivity_report_path")
  name                   String?
  compoundBatchRef       CompoundBatch? @relation(fields: [compoundBatchNumber], references: [batchNumber])
  grapheneRef            Graphene?      @relation(fields: [grapheneSample], references: [experimentNumber])

  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([createdAt])
  @@index([testDate])
  @@index([grapheneSample, testDate])
  @@index([compoundBatchNumber, testDate])
  @@map("conductivity_tests")
}

model RamanTest {
  id                     String         @id @default(cuid())
  testDate               DateTime?      @map("test_date")
  grapheneSample         String?        @map("graphene_sample")
  researchTeam           String?        @map("research_team")
  testingLab             String?        @map("testing_lab")
  ramanReportPath        String?        @map("raman_report_path")
  comments               String?
  createdAt              DateTime       @default(now()) @map("created_at")
  updatedAt              DateTime       @updatedAt @map("updated_at")
  integralTypA2D1        Decimal?       @map("integral_typ_a_2d_1") @db.Decimal(10, 3)
  integralTypA2D2        Decimal?       @map("integral_typ_a_2d_2") @db.Decimal(10, 3)
  integralTypAD1         Decimal?       @map("integral_typ_a_d_1") @db.Decimal(10, 3)
  integralTypAD2         Decimal?       @map("integral_typ_a_d_2") @db.Decimal(10, 3)
  integralTypADG1        Decimal?       @map("integral_typ_a_dg_1") @db.Decimal(10, 4)
  integralTypADG2        Decimal?       @map("integral_typ_a_dg_2") @db.Decimal(10, 4)
  integralTypAG1         Decimal?       @map("integral_typ_a_g_1") @db.Decimal(10, 3)
  integralTypAG2         Decimal?       @map("integral_typ_a_g_2") @db.Decimal(10, 3)
  integrationRange2DHigh Decimal?       @map("integration_range_2d_high") @db.Decimal(10, 2)
  integrationRange2DLow  Decimal?       @map("integration_range_2d_low") @db.Decimal(10, 2)
  integrationRangeDHigh  Decimal?       @map("integration_range_d_high") @db.Decimal(10, 2)
  integrationRangeDLow   Decimal?       @map("integration_range_d_low") @db.Decimal(10, 2)
  integrationRangeDGHigh Decimal?       @map("integration_range_dg_high") @db.Decimal(10, 4)
  integrationRangeDGLow  Decimal?       @map("integration_range_dg_low") @db.Decimal(10, 4)
  integrationRangeGHigh  Decimal?       @map("integration_range_g_high") @db.Decimal(10, 2)
  integrationRangeGLow   Decimal?       @map("integration_range_g_low") @db.Decimal(10, 2)
  peakHighTypJ2D1        Decimal?       @map("peak_high_typ_j_2d_1") @db.Decimal(10, 4)
  peakHighTypJ2D2        Decimal?       @map("peak_high_typ_j_2d_2") @db.Decimal(10, 4)
  peakHighTypJD1         Decimal?       @map("peak_high_typ_j_d_1") @db.Decimal(10, 4)
  peakHighTypJD2         Decimal?       @map("peak_high_typ_j_d_2") @db.Decimal(10, 4)
  peakHighTypJDG1        Decimal?       @map("peak_high_typ_j_dg_1") @db.Decimal(10, 4)
  peakHighTypJDG2        Decimal?       @map("peak_high_typ_j_dg_2") @db.Decimal(10, 4)
  peakHighTypJG1         Decimal?       @map("peak_high_typ_j_g_1") @db.Decimal(10, 4)
  peakHighTypJG2         Decimal?       @map("peak_high_typ_j_g_2") @db.Decimal(10, 4)
  compoundBatchNumber    String?        @map("compound_batch_number")
  integralTypB2D1        Decimal?       @map("integral_typ_b_2d_1") @db.Decimal(10, 3)
  integralTypB2D2        Decimal?       @map("integral_typ_b_2d_2") @db.Decimal(10, 3)
  integralTypBD1         Decimal?       @map("integral_typ_b_d_1") @db.Decimal(10, 3)
  integralTypBD2         Decimal?       @map("integral_typ_b_d_2") @db.Decimal(10, 3)
  integralTypBDG1        Decimal?       @map("integral_typ_b_dg_1") @db.Decimal(10, 4)
  integralTypBDG2        Decimal?       @map("integral_typ_b_dg_2") @db.Decimal(10, 4)
  integralTypBG1         Decimal?       @map("integral_typ_b_g_1") @db.Decimal(10, 3)
  integralTypBG2         Decimal?       @map("integral_typ_b_g_2") @db.Decimal(10, 3)
  compoundBatchRef       CompoundBatch? @relation(fields: [compoundBatchNumber], references: [batchNumber])
  grapheneRef            Graphene?      @relation(fields: [grapheneSample], references: [experimentNumber])

  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([createdAt])
  @@index([testDate])
  @@index([grapheneSample, testDate])
  @@index([compoundBatchNumber, testDate])
  @@index([testingLab, testDate])
  @@map("raman_tests")
}

model TEMTest {
  id                  String         @id @default(cuid())
  testDate            DateTime?      @map("test_date")
  grapheneSample      String?        @map("graphene_sample")
  researchTeam        String?        @map("research_team")
  testingLab          String?        @map("testing_lab")
  temReportPath       String?        @map("tem_report_path")
  comments            String?
  createdAt           DateTime       @default(now()) @map("created_at")
  updatedAt           DateTime       @updatedAt @map("updated_at")
  compoundBatchNumber String?        @map("compound_batch_number")
  compoundBatchRef    CompoundBatch? @relation(fields: [compoundBatchNumber], references: [batchNumber])
  grapheneRef         Graphene?      @relation(fields: [grapheneSample], references: [experimentNumber])

  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([createdAt])
  @@index([testDate])
  @@index([grapheneSample, testDate])
  @@index([compoundBatchNumber, testDate])
  @@index([testingLab, testDate])
  @@map("tem_tests")
}

// ============================================================================
// REPORT MODELS
// ============================================================================

model UpdateReport {
  id                   String                      @id @default(cuid())
  filename             String                      @map("filename")
  originalName         String                      @map("original_name")
  filePath             String                      @map("file_path")
  description          String?
  weekOf               DateTime?                   @map("week_of")
  createdAt            DateTime                    @default(now()) @map("created_at")
  updatedAt            DateTime                    @updatedAt @map("updated_at")
  compoundBatchReports CompoundBatchUpdateReport[]
  grapheneReports      GrapheneUpdateReport[]

  @@index([createdAt])
  @@index([weekOf])
  @@map("update_reports")
}

model SemReport {
  id                   String                   @id @default(cuid())
  filename             String                   @map("filename")
  originalName         String                   @map("original_name")
  filePath             String                   @map("file_path")
  description          String?
  reportDate           DateTime?                @map("report_date")
  createdAt            DateTime                 @default(now()) @map("created_at")
  updatedAt            DateTime                 @updatedAt @map("updated_at")
  compoundBatchReports CompoundBatchSemReport[]
  grapheneReports      GrapheneSemReport[]

  @@index([createdAt])
  @@index([reportDate])
  @@map("sem_reports")
}

model GrapheneUpdateReport {
  id             String       @id @default(cuid())
  grapheneId     String       @map("graphene_id")
  updateReportId String       @map("update_report_id")
  createdAt      DateTime     @default(now()) @map("created_at")
  graphene       Graphene     @relation(fields: [grapheneId], references: [id], onDelete: Cascade)
  updateReport   UpdateReport @relation(fields: [updateReportId], references: [id], onDelete: Cascade)

  @@unique([grapheneId, updateReportId])
  @@map("graphene_update_reports")
}

model GrapheneSemReport {
  id          String    @id @default(cuid())
  grapheneId  String    @map("graphene_id")
  semReportId String    @map("sem_report_id")
  createdAt   DateTime  @default(now()) @map("created_at")
  graphene    Graphene  @relation(fields: [grapheneId], references: [id], onDelete: Cascade)
  semReport   SemReport @relation(fields: [semReportId], references: [id], onDelete: Cascade)

  @@unique([grapheneId, semReportId])
  @@map("graphene_sem_reports")
}

model CompoundBatchSemReport {
  id              String        @id @default(cuid())
  compoundBatchId String        @map("compound_batch_id")
  semReportId     String        @map("sem_report_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  compoundBatch   CompoundBatch @relation(fields: [compoundBatchId], references: [id], onDelete: Cascade)
  semReport       SemReport     @relation(fields: [semReportId], references: [id], onDelete: Cascade)

  @@unique([compoundBatchId, semReportId])
  @@map("compound_batch_sem_reports")
}

model CompoundBatchUpdateReport {
  id              String        @id @default(cuid())
  compoundBatchId String        @map("compound_batch_id")
  updateReportId  String        @map("update_report_id")
  createdAt       DateTime      @default(now()) @map("created_at")
  compoundBatch   CompoundBatch @relation(fields: [compoundBatchId], references: [id], onDelete: Cascade)
  updateReport    UpdateReport  @relation(fields: [updateReportId], references: [id], onDelete: Cascade)

  @@unique([compoundBatchId, updateReportId])
  @@map("compound_batch_update_reports")
}

// ============================================================================
// SHIPMENT MODELS
// ============================================================================

model MaterialShipment {
  id                  String                   @id @default(cuid())
  shipmentNumber      String                   @unique @map("shipment_number")
  shipFromLocation    String                   @map("ship_from_location")
  shipToLocation      String                   @map("ship_to_location")
  shipmentDate        DateTime?                @map("shipment_date")
  amountShipped       Decimal?                 @map("amount_shipped") @db.Decimal(10, 2)
  unit                String                   @default("g")
  purpose             String?
  grapheneSample      String?                  @map("graphene_sample")
  compoundBatchNumber String?                  @map("compound_batch_number")
  comments            String?
  status              String?                  @default("shipped")
  receivedDate        DateTime?                @map("received_date")
  createdAt           DateTime                 @default(now()) @map("created_at")
  updatedAt           DateTime                 @updatedAt @map("updated_at")
  micronizationSku    String?                  @map("micronization_sku")
  mcbNumber           String?                  @map("mcb_number")
  compoundBatchRef    CompoundBatch?           @relation(fields: [compoundBatchNumber], references: [batchNumber])
  grapheneRef         Graphene?                @relation(fields: [grapheneSample], references: [experimentNumber])
  micronizationRef    Micronization?           @relation("MicronizationShipments", fields: [micronizationSku], references: [sku])
  mcbRef              MicronizedCompoundBatch? @relation(fields: [mcbNumber], references: [mcbNumber])

  @@index([shipmentDate])
  @@index([grapheneSample])
  @@index([compoundBatchNumber])
  @@index([micronizationSku])
  @@index([mcbNumber])
  @@index([status, shipmentDate])
  @@index([shipFromLocation, shipmentDate])
  @@index([shipToLocation, shipmentDate])
  @@index([grapheneSample, shipmentDate])
  @@index([compoundBatchNumber, shipmentDate])
  @@index([micronizationSku, shipmentDate])
  @@index([mcbNumber, shipmentDate])
  @@map("material_shipments")
}

// ============================================================================
// NEWS & AI MODELS
// ============================================================================

model NewsSource {
  id               String                 @id @default(cuid())
  name             String                 @unique
  url              String
  sourceType       SourceType
  rateLimit        Int?
  lastFetched      DateTime?              @map("last_fetched")
  isActive         Boolean                @default(true) @map("is_active")
  reliabilityScore Decimal?               @map("reliability_score") @db.Decimal(3, 2)
  termsAccepted    Boolean                @default(false) @map("terms_accepted")
  robotsTxtChecked DateTime?              @map("robots_txt_checked")
  createdAt        DateTime               @default(now()) @map("created_at")
  updatedAt        DateTime               @updatedAt @map("updated_at")
  processingLogs   ContentProcessingLog[]
  articles         NewsArticle[]

  @@index([isActive, lastFetched])
  @@index([sourceType, isActive])
  @@map("news_sources")
}

model NewsArticle {
  id                 String         @id @default(cuid())
  title              String
  summary            String?
  content            String?
  url                String         @unique
  publishDate        DateTime       @map("publish_date")
  fetchedAt          DateTime       @default(now()) @map("fetched_at")
  category           NewsCategory
  relevanceScore     Decimal        @map("relevance_score") @db.Decimal(4, 2)
  contentHash        String         @unique @map("content_hash")
  imageUrls          String[]       @map("image_urls")
  keywordTags        String[]       @map("keyword_tags")
  author             String?
  readingTime        Int?           @map("reading_time")
  sourceId           String         @map("source_id")
  isBookmarked       Boolean        @default(false) @map("is_bookmarked")
  viewCount          Int            @default(0) @map("view_count")
  laymanSummary      String?        @map("layman_summary") @db.Text
  summaryGenerated   Boolean        @default(false) @map("summary_generated")
  summaryError       String?        @map("summary_error")
  summaryStatus      SummaryStatus  @default(PENDING) @map("summary_status")
  summaryGeneratedAt DateTime?      @map("summary_generated_at")
  summaryAttempts    Int            @default(0) @map("summary_attempts")
  createdAt          DateTime       @default(now()) @map("created_at")
  updatedAt          DateTime       @updatedAt @map("updated_at")
  source             NewsSource     @relation(fields: [sourceId], references: [id], onDelete: Cascade)
  bookmarks          UserBookmark[]

  @@index([publishDate, relevanceScore])
  @@index([category, publishDate])
  @@index([contentHash])
  @@index([sourceId, publishDate])
  @@index([relevanceScore])
  @@index([summaryGenerated, relevanceScore])
  @@index([summaryStatus, createdAt])
  @@map("news_articles")
}

model UserBookmark {
  id        String      @id @default(cuid())
  articleId String      @map("article_id")
  userId    String?     @map("user_id")
  notes     String?
  createdAt DateTime    @default(now()) @map("created_at")
  article   NewsArticle @relation(fields: [articleId], references: [id], onDelete: Cascade)

  @@unique([articleId, userId])
  @@index([userId, createdAt])
  @@map("user_bookmarks")
}

model NewsPreference {
  id                  String          @id @default(cuid())
  userId              String?         @unique @map("user_id")
  preferredCategories NewsCategory[]  @map("preferred_categories")
  excludedSources     String[]        @map("excluded_sources")
  keywordAlerts       String[]        @map("keyword_alerts")
  emailDigest         Boolean         @default(false) @map("email_digest")
  digestFrequency     DigestFrequency @default(WEEKLY) @map("digest_frequency")
  createdAt           DateTime        @default(now()) @map("created_at")
  updatedAt           DateTime        @updatedAt @map("updated_at")

  @@map("news_preferences")
}

model ContentProcessingLog {
  id             String        @id @default(cuid())
  articleId      String?       @map("article_id")
  sourceId       String        @map("source_id")
  processType    ProcessType   @map("process_type")
  status         ProcessStatus
  errorMessage   String?       @map("error_message")
  processingTime Int?          @map("processing_time")
  createdAt      DateTime      @default(now()) @map("created_at")
  source         NewsSource    @relation(fields: [sourceId], references: [id], onDelete: Cascade)

  @@index([sourceId, createdAt])
  @@index([status, createdAt])
  @@map("content_processing_logs")
}

model KnowledgeDocument {
  id                 String            @id @default(cuid())
  title              String
  description        String?
  filename           String            @map("filename")
  originalName       String            @map("original_name")
  filePath           String            @map("file_path")
  fileSize           Int?              @map("file_size")
  mimeType           String?           @map("mime_type")
  documentType       DocumentType      @map("document_type")
  documentCategory   DocumentCategory? @map("document_category")
  researchAreas      String[]          @map("research_areas")
  keywords           String[]
  authors            String[]
  publicationDate    DateTime?         @map("publication_date")
  uploadedAt         DateTime          @default(now()) @map("uploaded_at")
  updatedAt          DateTime          @updatedAt @map("updated_at")
  processingStatus   ProcessingStatus  @default(PENDING) @map("processing_status")
  extractedText      String?           @map("extracted_text") @db.Text
  summary            String?           @map("summary") @db.Text
  laymanSummary      String?           @map("layman_summary") @db.Text
  keyFindings        String[]          @map("key_findings")
  relevanceScore     Decimal?          @map("relevance_score") @db.Decimal(4, 2)
  contentHash        String?           @unique @map("content_hash")
  processingError    String?           @map("processing_error")
  processingAttempts Int               @default(0) @map("processing_attempts")
  lastProcessedAt    DateTime?         @map("last_processed_at")
  isActive           Boolean           @default(true) @map("is_active")
  tags               String[]
  metadata           Json?

  @@index([documentType, processingStatus])
  @@index([documentCategory, uploadedAt])
  @@index([processingStatus, processingAttempts])
  @@index([relevanceScore, documentType])
  @@index([contentHash])
  @@index([isActive, uploadedAt])
  @@map("knowledge_documents")
}

// ============================================================================
// REFERENCE MODELS
// ============================================================================

model CharacterizationReference {
  id         String    @id @default(cuid())
  source     String
  sourceType String    @map("source_type")
  testType   String    @map("test_type")
  value      Decimal?  @db.Decimal(20, 6)
  valueString String?   @map("value_string")
  unit       String?
  conditions Json?
  testDate   DateTime? @map("test_date")
  notes      String?
  isRange    Boolean   @default(false) @map("is_range")
  minValue   Decimal?  @map("min_value") @db.Decimal(20, 6)
  maxValue   Decimal?  @map("max_value") @db.Decimal(20, 6)
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")

  @@unique([source, testType])
  @@index([source])
  @@index([testType])
  @@index([sourceType])
  @@map("characterization_references")
}

// ============================================================================
// ENUMS
// ============================================================================

enum GrindingMethod {
  manual
  mill
  ball_mill
  blender
}

enum SourceType {
  RSS
  API
  WEB_SCRAPING
  MANUAL
}

enum NewsCategory {
  RESEARCH_BREAKTHROUGH
  INDUSTRY_NEWS
  MARKET_ANALYSIS
  APPLICATIONS
  PRODUCTION_METHODS
  PATENTS
  COMPANY_NEWS
  FUNDING_INVESTMENT
}

enum DigestFrequency {
  DAILY
  WEEKLY
  MONTHLY
}

enum ProcessType {
  FETCH
  PARSE
  CATEGORIZE
  RELEVANCE_SCORE
  IMAGE_EXTRACT
  DUPLICATE_CHECK
}

enum ProcessStatus {
  SUCCESS
  FAILED
  PARTIAL
  SKIPPED
}

enum SummaryStatus {
  PENDING
  GENERATING
  COMPLETED
  FAILED
  SKIPPED
}

enum DocumentType {
  RESEARCH_PAPER
  PATENT
  TECHNICAL_REPORT
  WHITEPAPER
  THESIS
  CONFERENCE_PAPER
  BOOK_CHAPTER
  MANUAL
  SPECIFICATION
  OTHER
}

enum DocumentCategory {
  GRAPHENE_PRODUCTION
  BIOCHAR_PROCESSING
  MATERIAL_CHARACTERIZATION
  CONDUCTIVITY_TESTING
  SURFACE_ANALYSIS
  SCALING_METHODS
  QUALITY_CONTROL
  EQUIPMENT_OPERATION
  SAFETY_PROCEDURES
  MARKET_ANALYSIS
  APPLICATIONS
  GENERAL
}

enum ProcessingStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  SKIPPED
}
```

---

## Model Descriptions

### Authentication

**User** - User accounts with role-based access control
- **Key Fields**: username, email, passwordHash, role (TEAM_MEMBER, SUPER_ADMIN)
- **Security**: bcrypt password hashing, JWT token-based sessions
- **Features**: Login tracking, account activation/deactivation

### Core Production

**Biochar** - Raw material experiments with reactor processing
- **Key Fields**: experimentNumber (unique), reactor, rawMaterial, temperature, time (hours), output
- **Relationships**: Links to BiocharLot, Graphene experiments

**BiocharLot** - Groups biochar experiments for lot-based tracking
- **Key Fields**: lotNumber (unique), lotName, description
- **Purpose**: Batch tracking and material grouping

**Graphene** - Production experiments using biochar as input
- **Key Fields**: experimentNumber (unique), biocharExperiment, oven, baseType, temperature, time (minutes), output
- **Advanced Features**:
  - Title notes for annotations
  - Second base support (base2 fields)
  - Experiment objectives (5 text fields)
  - Grinding options (manual, mill, ball_mill, blender)
  - Appearance tags array

**CompoundBatch** - Groups multiple graphene experiments
- **Key Fields**: batchNumber (unique), batchName, totalOutput, createdDate
- **Features**: Auto-calculated total output, full traceability
- **Relationships**: Many-to-many with Graphene

**Micronization** - Micronization processing records
- **Key Fields**: micronizationNumber (unique), sku (unique), grindPressure, dx50, micronizationLocation
- **Features**: SKU tracking, recovery rate calculation
- **Relationships**: Links to Graphene OR CompoundBatch, optional MCB membership
- **Exclusivity**: Each micronization can only belong to one MCB (enforced by unique constraint)

**MicronizedCompoundBatch (MCB)** - Logical grouping of micronizations for shipment
- **Key Fields**: mcbNumber (unique identifier/SKU), mcbLocation, combinedDate
- **Auto-calculated**: totalRecoveredAmount (sum of component micronizations)
- **Purpose**: Combine multiple micronizations into a single trackable batch
- **Relationships**: Links to multiple Micronizations via MicronizationMCB junction table
- **Inventory**: Component micronizations are excluded from individual counts to prevent double-counting
- **Date Tracking**: combinedDate tracks when micronizations were physically combined (distinct from createdAt)

**MicronizationMCB** - Junction table for MCB membership
- **Purpose**: Links micronizations to their parent MCB
- **Constraint**: Each micronization can only belong to one MCB (@@unique on micronizationId)
- **Cascade Delete**: Deleting an MCB frees up its component micronizations

### Testing Models (All Support Dual Referencing)

**BET** - Surface area measurements
- **Key Fields**: mass, multipointBetArea, langmuirSurfaceArea
- **Precision**: Decimal(10,4) for scientific measurements
- **Scientific Notation**: Supports format like 1.88e3

**ConductivityTest** - Electrical conductivity at multiple pressures
- **Key Fields**: conductivity1kN, conductivity8kN, conductivity12kN, conductivity20kN
- **File Support**: PDF, XLSX, XLS, XLSM (10MB max)

**RamanTest** - Raman spectroscopy analysis
- **Matrix Structure**: 4×4 data matrix (32 fields total)
- **Rows**: Integration Range, Integral Typ A, Integral Typ B, Peak High Typ J
- **Columns**: 2D Band, G Band, D Band, D/G Ratio

**TEMTest** - Transmission Electron Microscopy
- **Key Fields**: testDate, temReportPath, comments
- **Simple Structure**: Basic test record with PDF report

### Reports

**UpdateReport** - Weekly update reports
- **Key Fields**: filename, weekOf, filePath
- **Storage**: Cloudinary CDN
- **Relationships**: Many-to-many with Graphene and CompoundBatch

**SemReport** - SEM imaging reports
- **Key Fields**: filename, reportDate, filePath
- **Features**: Bulk upload (up to 10 PDFs), Cloudinary storage
- **Relationships**: Many-to-many with Graphene and CompoundBatch

### Shipments

**MaterialShipment** - Material shipment tracking
- **Key Fields**: shipmentNumber (auto-generated), shipFromLocation, shipToLocation, status
- **Quad Reference**: Can link to grapheneSample, compoundBatchNumber, micronizationSku, OR mcbNumber
- **Status Levels**: pending, shipped, in_transit, received
- **Partial MCB Shipments**: Supports shipping portions of an MCB (e.g., 10g from 100g MCB)
- **Inventory Tracking**: Shipments automatically update location-based inventory calculations

### News & AI

**NewsSource** - RSS feed sources
**NewsArticle** - News articles with GPT-4 summarization
**KnowledgeDocument** - Research papers and patents with AI processing

### References

**CharacterizationReference** - External benchmarks
- **Sources**: Dr. Li, ISO, ASTM, GEIC
- **Test Types**: BET, Conductivity, RAMAN, XPS, etc.

---

## Relationships

### Material Flow
```
Biochar (raw material)
  ↓
Graphene (production)
  ↓
CompoundBatch (grouping) / Micronization (processing)
  ↓
MCB (optional - combines micronizations)
  ↓
Tests (BET, Conductivity, RAMAN, TEM)
  ↓
MaterialShipment (distribution)
```

### MCB (Micronized Compound Batch) Architecture
- **Purpose**: Logical grouping of micronizations for shipment tracking
- **Relationship**: One-to-many with Micronizations via MicronizationMCB junction table
- **Exclusivity**: Each micronization can belong to at most one MCB
- **Inventory Logic**:
  - MCBs stored at their designated location (mcbLocation)
  - Component micronizations excluded from individual inventory counts
  - Prevents double-counting of material
  - Supports partial shipments (e.g., ship 10g from 100g MCB)

### Test Referencing (Dual Architecture)
- Tests can reference **either** individual Graphene experiments **or** CompoundBatch
- Soft references using string identifiers (not foreign keys)
- Enables flexible testing of individual samples or batched materials

### Report Associations (Many-to-Many)
- UpdateReports ↔ Graphene (via GrapheneUpdateReport junction)
- UpdateReports ↔ CompoundBatch (via CompoundBatchUpdateReport junction)
- SemReports ↔ Graphene (via GrapheneSemReport junction)
- SemReports ↔ CompoundBatch (via CompoundBatchSemReport junction)

### Shipment Referencing (Quad Architecture)
- MaterialShipment can reference:
  - Individual Graphene experiments (via grapheneSample)
  - CompoundBatch (via compoundBatchNumber)
  - Individual Micronization (via micronizationSku)
  - MCB (via mcbNumber) - supports partial shipments from MCBs

---

## Design Principles

### Soft References
- Test samples use string identifiers, not foreign keys
- Provides flexibility for referencing experiments or batches
- Maintains data integrity without rigid constraints

### Multi-Reference Architecture
- Tests support dual referencing (Graphene OR CompoundBatch)
- Shipments support quad referencing (Graphene, CompoundBatch, Micronization, OR MCB)
- MCBs use exclusive membership (each micronization in at most one MCB)
- Never modifies original data when creating batches, micronizations, or MCBs
- Inventory tracking prevents double-counting by excluding MCB members from individual counts

### Full Traceability
- Complete audit trail from raw materials to final testing
- All relationships preserve material journey history
- Timestamps on all records (createdAt, updatedAt)

### Indexing Strategy
- Composite indexes for common query patterns
- Date-based indexes for time-series queries
- Sample identifier indexes for quick lookups

---

## Important Notes

### Time Units
- **Biochar**: Time stored in **HOURS**
- **Graphene**: Time stored in **MINUTES**

### Data Constraints
- **Experiment Numbers**: Unique per table
- **Lot Numbers**: Unique in BiocharLot table
- **SKUs**: Unique in Micronization table
- **URLs**: Unique in NewsArticle table

### Scientific Notation
- BET surface area supports format like `1.88e3`
- Displayed as 1.88 × 10³ in UI

### File Storage
- **Local Development**: `/uploads/` directories
- **Production**: Cloudinary CDN
- **Path Format**: Full Cloudinary URLs stored in database

### MCB Inventory Tracking
- **Component Exclusion**: Micronizations in an MCB are excluded from individual inventory counts
- **Query Pattern**: `WHERE mcbMembership: null` filters out MCB members
- **Location Tracking**: MCBs tracked at their mcbLocation, not component locations
- **Partial Shipments**: System correctly subtracts partial shipments from MCB totals
- **Example**: 100g MCB with 10g shipped shows 90g remaining at origin, 10g at destination

---

## Database Commands

### Common Prisma Operations

```bash
# Generate Prisma Client
npx prisma generate

# Apply schema changes (development)
npx prisma db push

# Open Prisma Studio (database GUI)
npx prisma studio

# Create migration
npx prisma migrate dev --name migration_name

# Reset database (WARNING: Deletes all data!)
npx prisma migrate reset
```

### Backup & Restore

```bash
# Create backup
npm run backup:create "description"

# Restore from backup
psql $DATABASE_URL < backups/backup_file.sql
```

---

**Last Updated:** January 2025 (MCB simplified - removed name/SKU fields, added combinedDate)
**Schema Version:** Current (January 2025)
**For API Usage:** See [API-REFERENCE.md](API-REFERENCE.md)
