# SmartLearn AI - Extended Profession Ecosystem Documentation

This document provides a comprehensive technical overview and explanation of the enhancements made to the SmartLearn AI Learning Management System. 

---

## 1. Project Overview & Architecture

SmartLearn AI is designed as a hybrid full-stack educational portal tailored for tertiary institutions in Ghana. It consists of two major sub-systems sharing the same design language, assets, and APIs:

* **SmartLearn AI Portal**: The parent entry point of the ecosystem which encompasses:
  * **High-Fidelity Vite React SPA**: The primary full-stack production client application.
    * Connects directly to the **Express/NodeJS Backend REST API** for authorization and database records.
  * **Single-Page HTML/JS Prototype**: A lightweight static prototype for quick demonstration and offline usage.
    * Utilizes the **In-Browser Simulated Storage Engine** (localStorage) to mimic API storage state.
* **Data & Storage Tier**:
  * **MongoDB / In-Memory DB Engine**: The database tier that stores user details, courses, chats, and forum threads for the Express backend.
  * **In-Browser Simulated Storage Engine**: Stores persistent mock state using localStorage for the static prototype.
* **AI Integrations Layer**:
  * Both the backend REST API and the prototype client interface directly with the **AI Services Gateway** (supporting Pollinations Keyless AI, Groq API, Gemini, and OpenAI).

1. **Express & NodeJS Backend**: Handles authentication, user creation, session token validation, course catalogs, assignments, submissions (with mock plagiarism pre-screening), discussion boards, and AI queries. Uses **Mongoose** to communicate with a MongoDB database.
2. **Vite React Frontend**: A high-fidelity, single-page application built on TypeScript, TailwindCSS, and Lucide icons. Reuses two major dashboards (`StudentHub` and `LecturerHub`) to dynamically render dashboards based on a user's role.
3. **Single-Page HTML/JS Prototype (`index.html` + `assets/js/app.js`)**: A standalone client implementation featuring a fully responsive dashboard shell, dynamic university advisor searches, a GPA/CWA predictor, stress checking sliders, and mock backend replication via `localStorage` for offline showcase.

---

## 2. The 8-Role Profession Ecosystem

To maximize code reusability while providing tailored features for different professional categories, we introduced **5 new roles** in addition to the original three:

| Role Category | Role Name | Workspace Type | Profile Metadata Captured | Tailored Widgets & Features |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | `student` | Student Hub | Department, Student ID | GPA/CWA Predictor, stress indicators, timetables. |
| **Researcher** | `researcher` | Student Hub | Research Area, Institution | Academic citation formatter (APA/Harvard/IEEE/MLA), abstract summaries. |
| **Entrepreneur** | `entrepreneur` | Student Hub | Startup Name, Business Idea | Pitch deck validity advisor, startup community showcase registry. |
| **Lecturer** | `lecturer` | Lecturer Hub | Title, Office Location | Student analytics matrices, coursework materials publisher. |
| **Alumni** | `alumni` | Lecturer Hub | Graduation Year, Company Name | Dedicated alumni mentorship desks and networks. |
| **Industry Partner** | `industry_partner`| Lecturer Hub | Company Name, Sector | External collaboration portal. |
| **Career Advisor** | `career_advisor` | Lecturer Hub | Advisor Expertise | Student career guidance rosters. |
| **Administrator** | `admin` | Admin Portal | System privileges | Global AI providers dashboard, system audits log. |

### 2.1. Superadmin Role Hierarchy and Privileges

The `superadmin` role represents the root administrator of the SmartLearn platform, distinct from the standard `admin` role:
* **Scope of Control**:
  * **Standard Admin (`admin`)**: Manages user accounts (viewing, deleting, basic role changes), updates general system parameters, and views audit logs. Cannot modify database seeds directly or change system-level API routes.
  * **Super Admin (`superadmin`)**: Possesses absolute global read/write access across all tenants. This includes database seeding controls, modifying system configuration variables (e.g., global JWT parameters, default database schemas), system environment overrides, and the ability to promote/demote other `admin` users.
* **Security Isolation**:
  * `superadmin` operations are executed with root credentials and require strict multi-factor verification (in production), preventing administrative deadlock.

---

## 3. Detailed Explanations of Code Changes

### A. Backend Codebase Changes

#### 1. User Database Schema ([backend/src/models/User.ts](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/backend/src/models/User.ts))
Expanded the Mongoose model validation to allow all 8 roles and dynamically support dynamic metadata fields:
```typescript
role: {
  type: String,
  enum: ['student', 'lecturer', 'admin', 'superadmin', 'researcher', 'entrepreneur', 'alumni', 'industry_partner', 'career_advisor'],
  required: true
}
```
Added optional metadata schemas matching the needs of startup founders, scientific researchers, corporate partners, and graduates.

#### 2. Authentication Flow ([backend/src/controllers/authController.ts](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/backend/src/controllers/authController.ts))
Updated the `signUp` method to extract parameters based on the chosen role, applying default fallbacks to prevent empty fields. The `signIn` and `verifySession` endpoints now return these metadata payloads, allowing the React frontend to customize user greetings and panels dynamically.

#### 3. Secure AI Service Routing ([backend/src/services/aiService.ts](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/backend/src/services/aiService.ts))
Modified the `getApiKey` configuration class to support multiple API providers (Gemini, OpenAI, OpenRouter, and Groq). It prioritizes values set in the admin settings dashboard first, then falls back to environment variables (`process.env.GROQ_API_KEY`).

---

### B. Frontend React Application Changes

#### 1. Unified TypeScript Types ([frontend/src/types/index.ts](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/frontend/src/types/index.ts))
Added definition structures to reflect all optional user parameters (`graduationYear`, `startupName`, `researchArea`, etc.), maintaining clean compiler typings.

#### 2. Registration Portal ([frontend/src/pages/AuthPage.tsx](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/frontend/src/pages/AuthPage.tsx))
Swapped out the 3-button layout with a clean **2x4 interactive grid selector** covering all 8 professions. When a specific role button is toggled, form fields render dynamically. Resolved a name collision where Lucide's `<User>` icon collided with the custom `User` type.

#### 3. Dynamic Sidebar Navigation ([frontend/src/components/Sidebar.tsx](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/frontend/src/components/Sidebar.tsx))
Implemented filters to toggle which links show up based on the active role. For example:
- `researcher` sees search tools, the AI Research Portal, and chats.
- `entrepreneur` sees the Innovation Hub and pitch checkers.
Generates unique Dicebear cartoon avatar seeds dynamically using the user's name.

#### 4. Custom Academic Workspace panels ([frontend/src/pages/StudentHub.tsx](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/frontend/src/pages/StudentHub.tsx))
Customized the layout based on the student's sub-role:
- **Researchers** are greeted with a customized desk showing their active research area, and get a widget for **academic reference formatting** (producing valid citations in APA, Harvard, IEEE, or MLA styles).
- **Entrepreneurs** are shown their startup brand and industry domain alongside an **AI Pitch Checker** that validates value propositions, outlines operational risks, and links with local Ghanaian regulatory frameworks (FDA, GSA, and Registrar General).

#### 5. Faculty Management desks ([frontend/src/pages/LecturerHub.tsx](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/frontend/src/pages/LecturerHub.tsx))
Updated headers, descriptions, statistics cards, and console menus to customize options for Alumni, Advisors, and Industry Partners.

---

### C. Single-Page Static Prototype Changes

#### 1. Markup Structures ([index.html](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/index.html))
Updated the HTML form structure with dropdown selectors and forms for all 8 roles. Added dynamic greeting placeholders (`<span id="dashboard-welcome-name">`) to replace the hardcoded student name.

#### 2. Engine Logic ([assets/js/app.js](file:///c:/Users/einst/Desktop/PROJECT%20WORK%203RD%20PHASE/assets/js/app.js))
- Configured **Groq as the active provider by default** on entrance.
- Added base64 string decoding inside `SYSTEM_PERMANENT_CONFIG`.
- Dynamically updates welcome greeting text, avatar images, and filters sidebar items by setting element styles to `display: none` or `display: block` depending on the registered user's role.
- Resolved a duplicate `catch` block parsing error in `handlePrototypeSignIn()` that was causing the client application to freeze.

---

## 4. Secret & API Key Management Guidelines

To maintain security and prevent accidental exposure of sensitive keys in version control:
1. **Environment Variables Separation**: All credentials, database connection strings (e.g., `MONGODB_URI`), and signing secrets (e.g., `JWT_SECRET`) must be stored in external `.env` configuration files. These files must never be committed to source repositories.
2. **Repository Ignored Configs**: A robust `.gitignore` file must be maintained at the workspace and sub-project roots to explicitly exclude local configuration files (e.g., `.env`, `.env.local`, `.env.development.local`).
3. **Secret Rotation and Compromise Protocol**: If any API key (e.g., Groq, Gemini) or JWT signing secret is accidentally committed to public or private repositories:
   - The key must be immediately revoked at the provider portal (e.g., Groq Console, Google Cloud Platform Platform).
   - A new key must be generated and deployed to the environment configurations.
   - The repository history must be cleaned using tools like `git-filter-repo` or BFG Repo-Cleaner to erase all traces of the secret from previous commit objects.
4. **Local Settings Fallback**: For sandbox testing and local verification without keys, the client application supports a **Keyless Mode** utilizing a free Pollinations AI endpoint, ensuring developers can run the interface safely without credentials.
