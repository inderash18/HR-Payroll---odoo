# Odoo

> **A secure, multi-tenant workforce operations and payroll platform for modern IT organizations.**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.2.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_4.21.2-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.4.1-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.19-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.0.8-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

---

## 1. Hero Section

**Odoo** is an enterprise-grade, multi-tenant workforce operations and payroll platform designed for modern software engineering squads and IT enterprises. It streamlines employee records, daily attendance clocking, leave/WFH allocations, statutory salary structures, and automated payroll batches under strict role-based access control and tenant isolation.

---

## 2. Product Overview

Managing modern IT engineering organizations requires addressing flexible work schedules, multiple project squads, cross-department allocations, strict salary component computations, and granular auditability. Generic HR tools frequently lack tenant isolation and role-tailored workflow boundaries.

Odoo solves this by delivering an integrated, database-driven operating platform:
- **Target Audience**: IT companies, technology enterprises, software engineering agencies, and multi-entity organizations.
- **Core Problem Solved**: Eliminates fragmented spreadsheets and disconnected systems by unifying employee directories, time tracking, leave approvals, salary rules, payrun validation, and executive KPI reporting into a single secured source of truth.
- **Hybrid Workforce Focus**: Built specifically for modern IT workflows—including hybrid and remote work modes, daily digital check-ins, sprint project squad tagging, dynamic leave types, and automated salary slip generation.

---

## 3. Key Capabilities

### Workforce Management
- **Centralized Employee Directory**: Manage comprehensive profiles including work emails, bank details, tax IDs, job positions, and squad memberships.
- **Department & Squad Hierarchy**: Organize engineering squads and business units with dedicated manager assignments and parent-child hierarchy support.
- **Contract Lifecycle**: Draft, activate, and manage employment contracts with wage bindings and working schedules.

### Attendance and Availability
- **Daily Digital Clock-In/Clock-Out**: Instant employee self-service check-in with live duration computation and IP/device tracking.
- **Operational Health Metrics**: Live department attendance percentages, real-time presence indicators, and late check-in detection.

### Leave & Work-From-Home Workflows
- **Dynamic Leave Types**: Configurable leave policies (Casual, Sick, Paid Time Off, WFH, Maternity/Paternity).
- **Entitlement Allocations**: Automatic leave balance allocations per employee and annual tracking.
- **Approval Workflow**: Multi-stage leave request submission with manager approval, rejection reasons, and balance reconciliation.

### Compensation & Payroll
- **Configurable Salary Structures**: Rule-based calculation engine supporting base pay, HRA, special allowances, PF deductions, professional tax, and custom formula components.
- **Batch Payrun Engine**: State-driven payrun processing pipeline (`DRAFT` → `COMPUTING` → `COMPUTED` → `VALIDATED` → `PAID`).
- **Payslip Generation & Statements**: Instant breakdown generation with printable HTML views and PDF delivery pipelines.

### Role-Based Dashboards
- **Tailored Views**: Dedicated dashboard experiences for Super Admins, Organization Admins, HR Managers, Payroll Managers, Department Managers, Employees, and Auditors.
- **Real-Time KPI Insights**: Total workforce, active payroll liabilities, pending approval counters, and department attendance rings.

### Reporting & Auditability
- **Audit Logs**: Immutable log trails capturing user actions, IP addresses, resource entities, timestamps, and tenant IDs.
- **Executive Summaries**: High-level organizational headcount, payroll distribution, and departmental compliance reporting.

### Security & Tenant Isolation
- **Tenant Partitioning**: Strict `organizationId` scoping enforced at database, ORM, and middleware layers.
- **Secure Sessions**: Dual JWT architecture with short-lived access tokens and sliding refresh tokens stored in `HttpOnly` secure cookies.

### Visual Design System & Theme Engine
- **Plum / Mauve / Berry Aesthetic**: Enterprise design palette derived from rich plum (`#3A004D`), velvet berry (`#8B4F67`), orchid (`#9E4B88`), and lavender mist (`#D9C3D2`).
- **Light, Dark & System Modes**: Complete theme synchronization with OS color-scheme listeners and persistent user preference storage.

---

## 4. Roles and Access Control

Odoo enforces granular Role-Based Access Control (RBAC) across all frontend route guards and backend API endpoints.

| Role | Primary Responsibility | Key Access Scope |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | Platform & Multi-Tenant Infrastructure | Global organization provisioning, cross-tenant management, system audit |
| `ORGANIZATION_ADMIN` | Full Organization Administration | User administration, departments, contracts, policy configurations, full company reporting |
| `HR_MANAGER` | Workforce Operations & People Management | Employee directory, onboarding, department assignments, leave approvals, attendance records |
| `PAYROLL_MANAGER` | Compensation & Payroll Execution | Salary structures, salary rules, payrun computation, payslip approvals, disbursement records |
| `FINANCE_MANAGER` | Financial Audits & Disbursements | Payout validations, financial summary reports, bank transfer reconciliations |
| `DEPARTMENT_MANAGER` | Squad & Team Leadership | Direct report attendance tracking, squad project assignments, departmental leave approvals |
| `EMPLOYEE` | Self-Service Workforce Operations | Personal profile management, daily clock-in/out, leave applications, own payslip downloads |
| `AUDITOR` | Compliance & Security Verification | Read-only access across employee directories, payroll records, and immutable audit logs |

### Authorization Architecture
- **Tenant Validation**: Middleware verifies that request headers and token payloads match the target organization boundary before query execution.
- **Ownership Verification**: Employees can read and mutate only their own profile, attendance, and leave records.
- **Auditor Restrictions**: Write, update, and delete mutations are strictly blocked for read-only compliance roles.

---

## 5. Architecture Diagram

```mermaid
flowchart TB
    subgraph Client["Frontend Client (React 18 + Vite)"]
        UI["React SPA & TailwindCSS"]
        ROUTER["React Router DOM (Protected Routes)"]
        AUTH_CTX["Auth & Theme Context Providers"]
        AXIOS["Axios Interceptor (withCredentials / Auto Refresh)"]
        UI --> ROUTER
        ROUTER --> AUTH_CTX
        AUTH_CTX --> AXIOS
    end

    subgraph Server["Backend API (Node.js + Express)"]
        MW_CORS["CORS & Helmet Headers"]
        MW_RATE["Express Rate Limiter"]
        MW_AUTH["Authentication Middleware (JWT Extract)"]
        MW_RBAC["RBAC & Tenant Isolation Guard"]
        MW_ZOD["Zod Schema Validator"]
        CONTROLLERS["Domain Controllers"]
        SERVICES["Business Logic & AST Payroll Engine"]
        REPOSITORIES["Data Repositories"]

        MW_CORS --> MW_RATE
        MW_RATE --> MW_AUTH
        MW_AUTH --> MW_RBAC
        MW_RBAC --> MW_ZOD
        MW_ZOD --> CONTROLLERS
        CONTROLLERS --> SERVICES
        SERVICES --> REPOSITORIES
    end

    subgraph Data["Database & Storage Layer"]
        PRISMA["Prisma ORM (v6.4.1)"]
        POSTGRES[("PostgreSQL 16 Multi-Tenant DB")]
        PUPPETEER["Puppeteer Headless PDF Generator"]
        NODEMAILER["Nodemailer Transactional Mailer"]

        REPOSITORIES --> PRISMA
        PRISMA --> POSTGRES
        SERVICES --> PUPPETEER
        SERVICES --> NODEMAILER
    end

    AXIOS -->|HTTPS / JSON + HttpOnly Cookies| MW_CORS
```

---

## 6. Request and Data Flow

All transactional mutations and view lookups follow a unidirectional, secured pipeline where PostgreSQL is the single source of truth.

```mermaid
sequenceDiagram
    autonumber
    actor User as Authenticated User
    participant App as React Frontend
    participant API as Express API Router
    participant Guard as Auth & RBAC Middleware
    participant Val as Zod Validator
    participant Svc as Service Layer
    participant DB as Prisma / PostgreSQL

    User->>App: Submits Form / Navigates View
    App->>API: HTTP Request + HttpOnly Session Cookie
    API->>Guard: Verify JWT & Validate Tenant ID
    alt Token Invalid / Expired
        Guard-->>App: 401 Unauthorized (Triggers Refresh)
    else Forbidden Role
        Guard-->>App: 403 Forbidden
    else Authorized
        Guard->>Val: Validate Request Payload
        alt Schema Error
            Val-->>App: 400 Bad Request (Field Errors)
        else Valid
            Val->>Svc: Invoke Domain Business Logic
            Svc->>DB: Execute Scoped Query (Prisma)
            DB-->>Svc: Return Entity Records
            Svc-->>API: Format Response Data DTO
            API-->>App: 200 OK (JSON Response)
            App-->>User: Update State & Render UI
        end
    end
```

---

## 7. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | `^18.3.1` | Declarative UI component architecture |
| **Frontend Bundler** | Vite | `^6.2.0` | High-speed ESM development and production bundling |
| **Styling & Design** | Tailwind CSS | `^3.4.19` | Utility-first CSS engine with custom design tokens |
| **Routing** | React Router DOM | `^6.29.0` | Client-side routing, protected route guards, deep-linking |
| **HTTP Client** | Axios | `^1.8.1` | Promise-based HTTP client with automatic cookie interceptors |
| **Data Visualization** | Recharts | `^2.15.1` | Declarative chart rendering for headcount & attendance KPIs |
| **Iconography** | Lucide React | `^0.475.0` | Modern iconography for navigation and UI elements |
| **Backend Framework** | Express.js | `^4.21.2` | RESTful API server routing and middleware pipeline |
| **Runtime** | Node.js | `>=18.0.0` | JavaScript server runtime environment |
| **Database ORM** | Prisma ORM | `^6.4.1` | Type-safe query building, migrations, and schema management |
| **Database** | PostgreSQL | `16` | Relational multi-tenant persistent database |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | `^9.0.2` | Stateless signed access and refresh tokens |
| **Password Hashing** | `bcrypt` | `^5.1.1` | Adaptive salt rounds for cryptographic password hashing |
| **Data Validation** | Zod | `^3.24.2` | TypeScript/JavaScript schema validation for all API inputs |
| **Security Headers** | Helmet | `^8.0.0` | Secure HTTP response headers (CSP, HSTS, XSS protection) |
| **Rate Limiting** | `express-rate-limit` | `^7.5.0` | Brute-force and DDoS mitigation on auth endpoints |
| **Document Export** | Puppeteer | `^24.4.0` | Headless Chromium engine for server-side PDF payslip exports |
| **Transactional Email**| Nodemailer | `^6.10.0` | SMTP client for payslip dispatch and password reset tokens |
| **Testing Engine** | Vitest + Supertest | `^3.0.8` / `^7.0.0`| Fast unit, integration, and RBAC security test suites |
| **Containerization** | Docker + Docker Compose | — | Containerized PostgreSQL database infrastructure |

---

## 8. Repository Structure

```text
odoo/
├── client/                           # Frontend React Application
│   ├── public/                       # Static assets and favicon
│   ├── src/
│   │   ├── api/                      # Axios HTTP client instance & interceptors
│   │   ├── components/               # Reusable UI cards, tables, modals, ThemeToggle
│   │   ├── config/                   # Navigation item mappings per role
│   │   ├── context/                  # ThemeContext provider alias
│   │   ├── contexts/                 # AuthContext, ThemeContext, LayoutContext
│   │   ├── layouts/                  # AppLayout, Sidebar, Topbar
│   │   ├── pages/                    # Domain views (Dashboard, Employees, Payroll, etc.)
│   │   ├── routes/                   # Route definitions & ProtectedRoute wrappers
│   │   └── styles/                   # tokens.css, theme.css, variables.css, global.css
│   ├── index.html                    # Single-page application entry HTML
│   ├── package.json                  # Client dependencies and build scripts
│   ├── tailwind.config.js            # Tailwind theme extensions and token mappings
│   └── vite.config.js                # Vite build and dev server configuration
├── server/                           # Backend Node.js Express API
│   ├── prisma/
│   │   ├── schema.prisma             # PostgreSQL schema definition & models
│   │   └── seed.js                   # Enterprise database seeding script
│   ├── scripts/
│   │   └── ensure-env.js             # Automated environment variable sync script
│   ├── src/
│   │   ├── config/                   # Environment bindings, Prisma client, permissions
│   │   ├── controllers/              # Route handlers for auth, users, payroll, etc.
│   │   ├── middleware/               # Auth, RBAC, tenant guard, rate limiter, error handler
│   │   ├── repositories/             # Data access layer interfacing with Prisma
│   │   ├── routes/                   # Express router definitions (/api/v1/*)
│   │   ├── services/                 # Domain logic and payroll calculation engine
│   │   ├── tests/                    # Vitest API and RBAC test suites
│   │   ├── utils/                    # Structured API responses and helper utilities
│   │   ├── validators/               # Zod validation schemas
│   │   └── server.js                 # Application entry point and server startup
│   └── package.json                  # Server dependencies and lifecycle scripts
├── docker-compose.yml                # Local PostgreSQL infrastructure
├── package.json                      # Workspace root orchestrator
└── README.md                         # Project documentation
```

---

## 9. Database and Core Entities

The database schema is managed through **Prisma ORM** targeting **PostgreSQL**.

| Entity | Purpose | Key Relationships |
| :--- | :--- | :--- |
| `Organization` | Top-level tenant container | One-to-many with Users, Employees, Departments, Payruns, Contracts |
| `LegalEntity` | Legal corporate branch / registered entity | Belongs to Organization; has many Employees and Users |
| `Department` | Organizational unit or engineering squad | Belongs to Organization; self-referential hierarchy; has many Employees |
| `JobPosition` | Job title and role designation | Belongs to Organization and Department; has many Employees |
| `User` | Authenticated account credential | Belongs to Organization; links one-to-one with Employee; has RefreshTokens |
| `Employee` | Detailed employment and identity record | Links to User, Department, JobPosition, WorkingSchedule, Contracts |
| `Contract` | Employment terms, base wage, and schedule | Belongs to Employee, Organization, and SalaryStructure |
| `WorkingSchedule` | Standard hours, shift templates, and break rules| Belongs to Organization; has many ScheduleLines and Contracts |
| `Attendance` | Daily check-in/out timestamps and work duration| Belongs to Employee and Organization |
| `LeaveType` | Policy definitions (Casual, Sick, WFH, etc.) | Belongs to Organization; has many Allocations and Requests |
| `LeaveAllocation`| Annual leave allowance per employee | Belongs to Employee and LeaveType |
| `LeaveRequest` | Employee time-off application | Belongs to Employee, LeaveType; references Approver User |
| `SalaryStructure`| Compensation template definition | Belongs to Organization; has many SalaryRules and Contracts |
| `SalaryRule` | Individual computation formula / allowance | Belongs to Organization and SalaryStructure |
| `Payrun` | Monthly payroll batch processing execution | Belongs to Organization and LegalEntity; has many Payslips |
| `Payslip` | Itemized monthly earnings and deductions slip| Belongs to Payrun, Employee, and Organization |
| `RefreshToken` | Cryptographic session tokens for rotation | Belongs to User |
| `AuditLog` | Immutable event log trail | Belongs to Organization and User |

---

## 10. API Documentation

All API endpoints are mounted under `/api/v1` and respond exclusively with standardized JSON payloads:

```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {}
}
```

### Endpoints Overview

| Module | Method | Endpoint | Description | Required Access |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/register` | Register new organization & admin | Public (Rate Limited) |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & issue HttpOnly cookies | Public (Rate Limited) |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Rotate refresh token & issue new access token | Valid Refresh Cookie |
| **Auth** | `GET` | `/api/v1/auth/me` | Fetch active session and user context | Authenticated |
| **Auth** | `POST` | `/api/v1/auth/logout` | Revoke session & clear cookies | Authenticated |
| **Auth** | `GET` | `/api/v1/auth/sessions` | List active user device sessions | Authenticated |
| **Auth** | `DELETE`| `/api/v1/auth/sessions/:id` | Revoke specific session device | Authenticated |
| **Profile** | `GET` | `/api/v1/users/me` | Get full user profile with employee details | Authenticated |
| **Profile** | `PATCH` | `/api/v1/users/me` | Update personal contact & bank info | Authenticated |
| **Profile** | `PATCH` | `/api/v1/users/me/preferences` | Update theme & notification preferences | Authenticated |
| **Profile** | `POST` | `/api/v1/users/me/avatar` | Upload base64 profile avatar | Authenticated |
| **Employees** | `GET` | `/api/v1/employees` | List organization employees with filters | `employees.read` |
| **Employees** | `POST` | `/api/v1/employees` | Create employee record | `employees.create` |
| **Employees** | `GET` | `/api/v1/employees/:id` | Get employee details by ID | Authenticated (Self/Admin) |
| **Employees** | `PUT` | `/api/v1/employees/:id` | Update employee record | `employees.update` |
| **Departments**| `GET` | `/api/v1/departments` | List all departments and headcount | `departments.read` |
| **Departments**| `POST` | `/api/v1/departments` | Create a new department / squad | `departments.create` |
| **Contracts** | `GET` | `/api/v1/contracts` | List employee contracts & wages | `compensation.read` |
| **Contracts** | `POST` | `/api/v1/contracts` | Issue new employment contract | `compensation.update` |
| **Attendance** | `GET` | `/api/v1/attendance` | List attendance logs | `attendance.read.all` / `own`|
| **Attendance** | `POST` | `/api/v1/attendance/clock-in` | Record daily clock-in timestamp | `attendance.checkin` |
| **Attendance** | `POST` | `/api/v1/attendance/clock-out` | Record daily clock-out timestamp | `attendance.checkout` |
| **Leaves** | `GET` | `/api/v1/leaves/requests` | List leave & WFH requests | `leave.read.all` / `own` |
| **Leaves** | `POST` | `/api/v1/leaves/requests` | Submit a new leave request | `leave.apply` |
| **Leaves** | `POST` | `/api/v1/leaves/requests/:id/approve` | Approve a pending leave request | `leave.approve` |
| **Leaves** | `POST` | `/api/v1/leaves/requests/:id/reject` | Reject a pending leave request | `leave.approve` |
| **Payroll** | `GET` | `/api/v1/payroll/structures` | List salary structure templates | `salary_structures.read` |
| **Payroll** | `POST` | `/api/v1/payroll/structures` | Create new salary structure | `salary_structures.create` |
| **Payroll** | `GET` | `/api/v1/payroll/payruns` | List monthly payroll batches | `payroll.read.all` |
| **Payroll** | `POST` | `/api/v1/payroll/payruns` | Create new payroll batch | `payroll.create` |
| **Payroll** | `POST` | `/api/v1/payroll/payruns/:id/compute` | Execute batch salary calculation engine | `payroll.calculate` |
| **Payroll** | `POST` | `/api/v1/payroll/payruns/:id/validate` | Validate calculated payroll batch | `payroll.submit` |
| **Payroll** | `POST` | `/api/v1/payroll/payruns/:id/pay` | Mark payrun as paid & disbursed | `payroll.submit` |
| **Payslips** | `GET` | `/api/v1/payroll/payslips` | List generated employee payslips | `payslips.read.all` / `own` |
| **Payslips** | `GET` | `/api/v1/payroll/payslips/:id/html` | Render printable HTML salary statement | `payslips.read.all` / `own` |
| **Dashboard** | `GET` | `/api/v1/dashboard` | Dynamic role-tailored dashboard dataset | Authenticated |
| **Audit Logs** | `GET` | `/api/v1/audit-logs` | Retrieve immutable audit event records | `audit.read` |
| **Health** | `GET` | `/api/v1/health/liveness` | Service uptime health check | Public |
| **Health** | `GET` | `/api/v1/health/readiness` | Database connection readiness probe | Public |

---

## 11. Security Architecture

- **Cryptographic Password Hashing**: Passwords are saved with salted hashes via `bcrypt` (10 rounds).
- **Dual JWT Token Strategy**: Short-lived Access Tokens (15 minutes) signed with `JWT_ACCESS_SECRET` paired with sliding Refresh Tokens (7 days) stored in the database.
- **HttpOnly Cookies**: Tokens are transmitted via secure `HttpOnly`, `SameSite=Lax` cookies (`odoo_access_token`, `odoo_refresh_token`) to mitigate XSS exposure.
- **Tenant Isolation**: Every database query is strictly filtered by the authenticated user's `organizationId`.
- **Strict Input Validation**: All incoming request bodies, query params, and route parameters are validated using `zod` schemas before hitting controllers.
- **Rate Limiting**: Public authentication routes are guarded with `express-rate-limit` to prevent credential brute-force attacks.
- **Security Headers**: Standardized HTTP headers configured via `helmet` including `X-Frame-Options`, `X-Content-Type-Options`, and `Strict-Transport-Security`.
- **CORS Protection**: Restricted to authorized origins with `credentials: true`.
- **Audit Logging**: Sensitive actions (logins, role updates, payrun executions) generate persistent audit log entries.

---

## 12. Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Docker & Docker Compose** (for local PostgreSQL database)

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd HR-Payroll---odoo
   ```

2. **Start the local PostgreSQL database**:
   ```bash
   docker-compose up -d
   ```

3. **Install dependencies across the monorepo**:
   ```bash
   npm install
   ```

4. **Configure Environment Variables**:
   Create a `.env` file in the `server/` directory (refer to `.env.example`):
   ```env
   NODE_ENV=development
   PORT=3000
   API_PREFIX=/api/v1
   APP_NAME=Odoo

   DATABASE_URL="postgresql://postgres:password123@localhost:5432/odoo?schema=public"

   JWT_ACCESS_SECRET="your_jwt_access_secret_key_minimum_32_characters"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key_minimum_32_characters"
   JWT_REFRESH_EXPIRES_IN="7d"

   COOKIE_SECRET="your_cookie_signing_secret_key_minimum_32_characters"

   SMTP_HOST="localhost"
   SMTP_PORT=1025
   SMTP_USER=""
   SMTP_PASSWORD=""
   SMTP_FROM="no-reply@odoo.local"

   STORAGE_LOCAL_PATH="./uploads"

   DEV_FIXED_AUTH_ENABLED=true
   DEV_FIXED_AUTH_EMAIL="admin@odoo.local"
   DEV_FIXED_AUTH_PASSWORD="admin123"
   DEV_FIXED_AUTH_ROLE="ADMIN"
   DEV_FIXED_AUTH_NAME="Development Admin"
   ```

5. **Generate Prisma Client and Run Database Migrations**:
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Seed Initial Roles, Departments, and Test Data**:
   ```bash
   npm run prisma:seed
   ```

7. **Start Development Servers (Concurrent Client & Server)**:
   ```bash
   npm run dev
   ```
   - **Frontend Application**: `http://localhost:5173`
   - **Backend Express API**: `http://localhost:3000/api/v1`

---

## 13. Development Test Accounts

When the database is populated via `npm run prisma:seed`, the following predefined role accounts are provisioned:

| Role | Email | Password Source |
| :--- | :--- | :--- |
| `SUPER_ADMIN` | `platform.admin@odoo.in` | Configured in seed (`Odoo@123`) |
| `ORGANIZATION_ADMIN` | `indhu.admin@odoo.in` | Configured in seed (`Odoo@123`) |
| `HR_MANAGER` | `kavya.hr@odoo.in` | Configured in seed (`Odoo@123`) |
| `PAYROLL_MANAGER` | `vishal.payroll@odoo.in` | Configured in seed (`Odoo@123`) |
| `FINANCE_MANAGER` | `finance.manager@odoo.in` | Configured in seed (`Odoo@123`) |
| `DEPARTMENT_MANAGER` | `aravind.manager@odoo.in` | Configured in seed (`Odoo@123`) |
| `EMPLOYEE` | `employee@odoo.in` | Configured in seed (`Odoo@123`) |
| `AUDITOR` | `auditor@odoo.in` | Configured in seed (`Odoo@123`) |

> [!NOTE]
> For development authentication bypass (when configured in local `.env`), the fixed admin account `admin@odoo.local` is also available.

---

## 14. Testing

Odoo includes automated test suites covering API functionality, authentication, and strict RBAC authorization.

### Run All Backend Tests
```bash
npm run test
```

### Build Frontend Bundle
```bash
npm run build
```

---

## 15. Screenshots

> Product screenshots will be added after the production UI is finalized.

---

## 16. Roadmap

The following capabilities are planned for upcoming releases:
- [ ] **Direct Bank Payout Integration**: Automated salary disbursements via bank transfer APIs.
- [ ] **Biometric Hardware Integration**: Webhook adapters for physical office fingerprint / RFID biometric terminals.
- [ ] **Single Sign-On (SSO)**: SAML 2.0 and OpenID Connect (OIDC) enterprise identity providers (Okta, Azure AD, Google Workspace).
- [ ] **Real-Time WebSocket Notifications**: Instant push alerts for leave approvals, attendance flags, and payroll validation.
- [ ] **Mobile Application**: Native iOS and Android employee self-service client using React Native.

---

## 17. Contributing

We welcome contributions to Odoo. Please follow these guidelines:

1. **Fork and Branch**: Create a feature branch with a descriptive name (`feature/salary-formula-builder` or `fix/attendance-clock-drift`).
2. **Code Standards**: Adhere to ESLint rules and maintain semantic CSS token usage (avoid hardcoded colors).
3. **Validate**: Ensure that all unit and RBAC test suites pass before submitting:
   ```bash
   npm run test
   npm run build
   ```
4. **Pull Requests**: Submit a clear Pull Request detailing the changes, test results, and potential schema modifications. Never commit production secrets, database credentials, or private keys.

---

## 18. License and Support

**License**: Proprietary / Internal project — license pending.

For questions, issues, or architectural inquiries, please open an issue in the project repository.
