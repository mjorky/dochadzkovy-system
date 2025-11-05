# Database Relational Schema Guide

## Overview

This document describes the relational database schema for the attendance/work records system. The database uses PostgreSQL with a unique per-employee table structure for work records.

## Core Architecture

### Per-Employee Work Record Tables

Each employee has their own dedicated table named `t_{FirstName}_{LastName}` (e.g., `t_Miroslav_Boloz`, `t_Anna_Lovasova`).

All employee work record tables share the same structure:

```sql
CREATE TABLE t_{FirstName}_{LastName} (
  ID           BIGSERIAL PRIMARY KEY,
  CinnostTypID BIGINT NOT NULL,              -- FK to CinnostTyp (Activity/Absence Type)
  StartDate    DATE NOT NULL,
  ProjectID    BIGINT,                       -- FK to Projects (nullable)
  HourTypeID   BIGINT,                       -- FK to HourType (Productivity Type, nullable)
  HourTypesID  BIGINT,                       -- FK to HourTypes (Work Type, nullable)
  StartTime    TIME(6) NOT NULL,
  EndTime      TIME(6) NOT NULL,
  Description  TEXT,                         -- nullable
  km           INT DEFAULT 0,                -- kilometers traveled, nullable
  Lock         BOOLEAN DEFAULT false,        -- record locked for editing
  DlhodobaSC   BOOLEAN DEFAULT false,        -- long-term business trip flag

  FOREIGN KEY (CinnostTypID) REFERENCES CinnostTyp(ID),
  FOREIGN KEY (HourTypeID) REFERENCES HourType(ID),
  FOREIGN KEY (HourTypesID) REFERENCES HourTypes(ID),
  FOREIGN KEY (ProjectID) REFERENCES Projects(ID)
);
```

## Catalog/Reference Tables

### 1. CinnostTyp (Activity/Absence Type)

Defines the type of activity or absence for a work record.

**Table Structure:**
```sql
CREATE TABLE CinnostTyp (
  ID      BIGSERIAL PRIMARY KEY,
  Typ     VARCHAR(20),                       -- Type code
  Alias   VARCHAR(50),                       -- Display name/description
  Zmazane BOOLEAN DEFAULT false              -- Soft delete flag
);
```

**Data Values:**
| ID | Typ | Alias | Description |
|----|-----|-------|-------------|
| 1 | Prítomnosť | Prítomný v práci | Present at work |
| 2 | PN | Práce neschopnosť | Sick leave |
| 3 | Paragraf | Paragraf | Legal leave (§) |
| 4 | RD | Dovolenka | Vacation |
| 5 | OČR | Ošetrenie člena rodiny | Family member care |
| 6 | SC | Mimo pracoviska | Business trip |
| 7 | NV | Náhradné voľno | Compensatory time off |
| 9 | Lekár | Lekár | Doctor appointment |
| 10 | Doprovod | Lekár doprovod | Doctor accompaniment |
| 11 | DoprovodZP | Lekár dopr. zdrav. postih. | Doctor accompaniment (disabled) |

**Usage in queries:**
- Join on `CinnostTypID` to get activity type display name
- Use `Alias` field for user-friendly display
- Filter out deleted entries where `Zmazane = true`

---

### 2. HourType (Productivity Type)

Categorizes work hours by productivity classification.

**Table Structure:**
```sql
CREATE TABLE HourType (
  ID       BIGSERIAL PRIMARY KEY,
  HourType VARCHAR(50)                       -- Productivity category name
);
```

**Data Values:**
| ID | HourType | Description |
|----|----------|-------------|
| 1 | Produktívne | Productive |
| 2 | ProduktívneZ | Productive abroad |
| 3 | Produktívne70 | Productive 70% |
| 4 | Neproduktívne | Non-productive |
| 5 | NeproduktívneZ | Non-productive abroad |

**Usage in queries:**
- Join on `HourTypeID` to get productivity type
- Used for billing and hour categorization in reports

---

### 3. HourTypes (Work Type)

Defines the specific type of work activity performed.

**Table Structure:**
```sql
CREATE TABLE HourTypes (
  ID       BIGSERIAL PRIMARY KEY,
  HourType VARCHAR(50)                       -- Work activity name
);
```

**Data Values (partial list):**
| ID | HourType | Description |
|----|----------|-------------|
| 1 | Rezia | Management/Overhead |
| 2 | Cestovanie | Travel |
| 3 | Studium podkladov | Document study |
| 4 | Porada | Meeting |
| 5 | Programovanie | Programming |
| 6 | Navrh riesenia | Solution design |
| 7 | Bug Fix | Bug fixing |
| 8 | Praca na ponukach | Proposal work |
| 9 | Programovanie PLC | PLC programming |
| 10 | Programovanie SCADA | SCADA programming |
| 11 | Programovanie HMI | HMI programming |

**Usage in queries:**
- Join on `HourTypesID` to get work activity type
- Used for detailed time tracking and project analysis

---

### 4. Projects

Project catalog with manager and location information.

**Table Structure:**
```sql
CREATE TABLE Projects (
  ID                      BIGSERIAL PRIMARY KEY,
  Name                    VARCHAR(100),
  Number                  VARCHAR(12) UNIQUE,        -- Project number/code
  Description             VARCHAR(255),
  AllowAssignWorkingHours BOOLEAN DEFAULT false,     -- Active project flag
  CountryCode             VARCHAR(3),                -- FK to Countries
  Manager                 BIGINT,                    -- FK to Zamestnanci (employee ID)

  FOREIGN KEY (CountryCode) REFERENCES Countries(CountryCode),
  FOREIGN KEY (Manager) REFERENCES Zamestnanci(ID)
);
```

**Key Fields:**
- `Number`: Unique project identifier/code
- `AllowAssignWorkingHours`: When true, project is active and can be assigned to work records
- `Manager`: Employee ID of project manager

**Usage in queries:**
- Join on `ProjectID` to get project details
- Filter active projects with `AllowAssignWorkingHours = true`
- Resolve manager name via nested join to `Zamestnanci`

---

### 5. Zamestnanci (Employees)

Employee master table.

**Table Structure:**
```sql
CREATE TABLE Zamestnanci (
  ID                 BIGSERIAL PRIMARY KEY,
  Meno               VARCHAR(20),                    -- First name
  Priezvisko         VARCHAR(50),                    -- Last name
  TitulPred          VARCHAR(10),                    -- Title prefix (e.g., "Ing.")
  TitulZa            VARCHAR(10),                    -- Title suffix (e.g., "PhD.")
  Dovolenka          REAL DEFAULT 20,                -- Vacation days balance
  IsAdmin            BOOLEAN DEFAULT false,          -- Admin flag
  TypZamestnanca     VARCHAR(20),                    -- FK to ZamestnanecTyp
  Podpis             BYTEA,                          -- Digital signature
  RocnyNadcasVPlate  INT,                            -- Annual overtime in salary
  PoslednyZaznam     DATE,                           -- Last work record date
  ZamknuteK          DATE,                           -- Locked until date

  FOREIGN KEY (TypZamestnanca) REFERENCES ZamestnanecTyp(Typ),
  UNIQUE (Meno, Priezvisko)
);
```

**Key Fields:**
- `ZamknuteK`: Records with `StartDate <= ZamknuteK` are locked (Lock = true)
- `TypZamestnanca`: Employee type (Employee, Contractor, etc.)
- Unique constraint on (Meno, Priezvisko) - names must be unique

---

### 6. ZamestnanecTyp (Employee Type)

Employee classification with daily hour threshold.

**Table Structure:**
```sql
CREATE TABLE ZamestnanecTyp (
  Typ                VARCHAR(20) PRIMARY KEY,
  FondPracovnehoCasu INT                             -- Daily hour threshold
);
```

**Usage:**
- `FondPracovnehoCasu`: Standard work hours per day (typically 8 for employees)
- Used to calculate overtime (surplus over threshold)

---

## Common Query Patterns

### 1. Fetch Work Records with All Related Data

```typescript
// Using Prisma (TypeScript)
const records = await prisma.t_Miroslav_Boloz.findMany({
  include: {
    CinnostTyp: true,        // Include activity type
    Projects: true,          // Include project details
    HourType: true,          // Include productivity type
    HourTypes: true,         // Include work type
  },
  where: {
    StartDate: {
      gte: fromDate,
      lte: toDate,
    },
  },
  orderBy: {
    StartDate: 'asc',
  },
});
```

### 2. Dynamic Table Access by Employee

Since table names are dynamic (per employee), you need to:

1. Get employee name from `Zamestnanci` table
2. Construct table name: `t_${Meno}_${Priezvisko}`
3. Use Prisma's dynamic model access:

```typescript
const tableName = `t_${employee.Meno}_${employee.Priezvisko}`;
const records = await prisma[tableName].findMany({ ... });
```

### 3. Calculate Hours (Including Overnight Shifts)

```typescript
function calculateHours(startTime: Date, endTime: Date): number {
  const start = startTime.getHours() + startTime.getMinutes() / 60;
  const end = endTime.getHours() + endTime.getMinutes() / 60;

  // If end < start, it's an overnight shift - add 24 hours
  const hours = end < start ? (end + 24) - start : end - start;

  // Maximum 24 hours per shift
  return Math.min(hours, 24);
}
```

### 4. Filter Active Projects Only

```typescript
const activeProjects = await prisma.projects.findMany({
  where: {
    AllowAssignWorkingHours: true,
  },
  select: {
    ID: true,
    Number: true,
    Name: true,
  },
});
```

---

## Important Notes

### Field Nullability

⚠️ **Critical Business Rules**: Field requirements depend on activity type (CinnostTypID):

**Always Required (NOT NULL in schema):**
- **CinnostTypID**: Activity/absence type (always required)
- **StartDate**: Date of the record (always required)
- **StartTime/EndTime**: Time values (always required, may be dummy values for absences)

**Conditionally Required (nullable in schema, but business rules apply):**

**For Work Records (CinnostTypID = 1 "Prítomnosť" - Present at work):**
- **ProjectID**: REQUIRED - must have actual project assignment
- **HourTypeID**: REQUIRED - must have productivity type
- **HourTypesID**: REQUIRED - must have work type
- **StartTime/EndTime**: Actual work times

**For Absence Records (Vacation, Sick Leave, Doctor, etc.):**
- **ProjectID**: NULL - no project assignment
- **HourTypeID**: NULL - no productivity type
- **HourTypesID**: NULL - no work type
- **StartTime/EndTime**: Dummy times (typically 08:00:00 - 16:00:00 for 8 hours)

**Always Optional:**
- **Description**: Text description (nullable)
- **km**: Kilometers traveled (nullable, default 0)

**UI Display Rules:**
- Display NULL values as "—" or empty cells in work records table
- For absence types, hide or disable Project/HourType/HourTypes fields in forms
- For work records, validate that Project/HourType/HourTypes fields are filled

**Frontend Validation Best Practice:**
```typescript
// Validation logic based on activity type
if (activityType === 'Prítomnosť') {
  // Work record - require all fields
  projectId: required(),
  hourTypeId: required(),
  hourTypesId: required(),
  startTime: required(), // actual work time
  endTime: required(),   // actual work time
} else {
  // Absence record - allow NULL for work-specific fields
  projectId: null,
  hourTypeId: null,
  hourTypesId: null,
  startTime: '08:00:00', // dummy time
  endTime: '16:00:00',   // dummy time
}
```

### Lock Status

Work records can be locked in two ways:
1. **Individual record lock**: `Lock` field = true
2. **Date-based lock**: When `StartDate <= Zamestnanci.ZamknuteK`

Locked records should be read-only and visually distinct in the UI.

### DlhodobaSC Field

- Boolean field indicating "long-term business trip" (Dlhodobaslovná služobná cesta)
- Appears to be the "Trip Flag" mentioned in requirements
- Display as checkbox or icon in work records table

---

## GraphQL Query Design

For the Work Records Read & Display feature, the GraphQL query should:

1. Accept employee ID and date range as input
2. Dynamically determine employee table name from `Zamestnanci`
3. Fetch records with all joins (CinnostTyp, Projects, HourType, HourTypes)
4. Calculate hours (including overnight logic)
5. Return formatted data with display-friendly field names

**Example GraphQL Schema:**

```graphql
type WorkRecord {
  id: ID!
  date: Date!
  activityType: String!              # From CinnostTyp.Alias
  projectNumber: String              # From Projects.Number
  projectName: String                # From Projects.Name
  productivityType: String           # From HourType.HourType
  workType: String                   # From HourTypes.HourType
  startTime: Time!
  endTime: Time!
  hours: Float!                      # Calculated
  description: String
  kilometers: Int
  isLocked: Boolean!
  isBusinessTrip: Boolean!           # From DlhodobaSC
  isOvernight: Boolean!              # Calculated: endTime < startTime
}

type Query {
  workRecords(
    employeeId: ID!
    fromDate: Date!
    toDate: Date!
  ): [WorkRecord!]!
}
```

---

## References

- Prisma Schema: `/backend/prisma/schema.prisma`
- SQL Schema: `/docs/db/schema.sql`
- Sample Data: `/docs/db/schema_data.sql`

---

*Last Updated: 2025-11-05*
*Created for: Work Records - Read & Display Feature (Phase 2)*
