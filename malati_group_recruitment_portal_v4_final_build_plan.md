# Malati Group Recruitment Portal V4 — Final Build Plan

## 1. Project Goal

Build a production-ready recruitment portal for Malati Group that allows candidates to discover jobs and apply online, while allowing administrators to manage recruitment without changing code.

The system should be simple, reliable, configurable, mobile-friendly, and suitable for Vercel deployment.

## 2. Core Architecture

Use a single Next.js application containing both the candidate portal and admin portal.

```text
Candidate UI ─┐
              ├── Next.js App ── Server/API ── Google Sheets
Admin UI ─────┘                         ├───── Google Drive
                                        └───── SMTP
```

### Stack

- Next.js 16.4.5
- TypeScript
- Tailwind CSS 4
- Google Sheets for structured data and configuration
- Google Drive for private CV storage
- Nodemailer/SMTP for email
- JWT + bcrypt for authentication
- Lucide React
- Vercel for deployment

### Architecture Rule

The browser must never directly access Google APIs.

All Google Sheets and Google Drive operations go through the Next.js server/API layer.

Avoid unnecessary infrastructure such as:

- Separate frontend/backend services
- Microservices
- Redis
- PostgreSQL
- Docker/Kubernetes
- Queues
- Full CMS
- Complex drag-and-drop builders

## 3. Design System

The candidate and admin interfaces share the same brand language but have different information densities.

### Brand

- Ink: `#111111`
- Muted text: `#666666`
- Border: `#E7E7E7`
- Surface: `#F6F6F6`
- White: `#FFFFFF`
- Brand red: `#C8102E`

Use the brand red sparingly as an accent.

### Typography

- Inter

### Visual Style

- Minimalist
- Editorial
- Premium
- Professional
- Modern
- Confident

Avoid:

- Generic SaaS appearance
- Excessive gradients
- Large decorative blobs
- Excessive shadows
- Overly rounded UI
- Unnecessary visual clutter

### Layout

- Desktop max width: approximately 1180px
- Desktop page padding: approximately 28px
- Mobile page padding: approximately 20px
- Minimal bordered cards
- Minimum touch target: 44px
- Subtle transitions

## 4. Candidate UX

Candidate experience should be simple, accessible, mobile-first, and low friction.

The candidate should not need an account.

### Candidate Flow

```text
QR
 ↓
Landing
 ↓
Department
 ↓
Position
 ↓
Job Details
 ↓
Apply
 ↓
Form
 ↓
Submit
 ↓
Success
```

### Candidate Pages

1. Landing
2. Departments
3. Job Listing
4. Job Detail
5. Apply
6. Success

### Landing Page

Primary content:

- Careers at Malati Group
- Explore current opportunities and apply online.
- View Open Positions
- Department sections/cards

### Job Detail

Display:

- Job title
- Department
- Location
- Employment type
- Experience
- Qualification
- Apply Now
- About
- Responsibilities
- Requirements
- Additional configurable job details

On mobile, the Apply action can use a sticky button.

### Application Form

The form must be generated from the configured `FORM_FIELDS`.

Use progressive sections such as:

```text
Personal
Professional
Documents
Submit
```

Rules:

- Required fields marked with `*`
- Mobile-first layout
- No candidate account
- Simple validation
- CV upload when enabled
- Submit without unnecessary steps

## 5. Admin UX

The admin interface should be information-dense but understandable.

### Sidebar

```text
MALATI GROUP
Recruitment Admin

Dashboard

Recruitment
  Jobs
  Applicants
  Departments

Configuration
  Application Form
  Job Details
  Statuses

Tools
  QR Codes
  Audit Log

Settings

Logout
```

## 6. Admin Dashboard

Show only useful operational information.

### Core Metrics

- Open Jobs
- Applicants
- New Today

### Operational Sections

- Recent Applications
- Jobs Closing Soon

Avoid unnecessary charts.

## 7. Job Management

Admins must be able to:

- Create jobs
- Edit jobs
- Delete/archive jobs where appropriate
- Draft jobs
- Publish/open jobs
- Close jobs
- Search jobs
- Filter jobs
- Preview jobs
- Reorder jobs
- Configure job details

### Job Status

Default:

- `DRAFT`
- `OPEN`
- `CLOSED`

A job should not appear as an active public opportunity unless it is configured as open.

## 8. Applicant Management

Provide a searchable and filterable applicant table.

Admins should be able to:

- View applicant
- View application details
- Change applicant status
- View/download CV securely
- Search
- Filter
- Review application history where available

### Default Applicant Statuses

```text
NEW
UNDER REVIEW
SHORTLISTED
INTERVIEW
SELECTED
REJECTED
```

Admins can configure additional statuses.

## 9. Department Management

Admins can:

- Add departments
- Edit departments
- Hide departments
- Reorder departments
- Activate/deactivate departments

## 10. Configuration-Driven Recruitment

This is a key V2 feature.

Recruitment behavior should be configurable without modifying application code.

Admins should be able to configure:

### Application Fields

- Add field
- Edit field
- Delete field
- Hide/show field
- Rename field
- Add description
- Change field type
- Make required/optional
- Reorder fields
- Configure options

### Supported Field Types

- Text
- Email
- Phone
- Number
- Textarea
- Dropdown
- Radio
- Checkbox
- Date
- File

## 11. Required vs Visible

These are separate settings.

Every configurable field should have:

```text
Required: ON/OFF
Visible: ON/OFF
```

Examples:

```text
CV
Visible = ON
Required = OFF
```

or:

```text
CV
Visible = ON
Required = ON
```

or:

```text
CV
Visible = OFF
Required = OFF
```

## 12. System Fields

Certain fields must remain protected because the application depends on them.

Examples:

- Application ID
- Candidate Name
- Email
- Phone
- Position
- Created At
- Status

These fields cannot be deleted.

Where safe, their presentation properties can still be configurable.

## 13. Historical Data Protection

Configuration changes must never destroy historical application data.

For example:

If the Experience field is removed from the current application form, existing applications that already contain Experience must retain that value.

Current form configuration and historical application records must therefore be treated separately.

## 14. Job-Specific Form Overrides

Global application configuration can be overridden for individual jobs.

Example:

```text
Global:
CV = Optional

CNC Programmer:
CV = Required
```

This allows specific positions to require additional information without changing the entire application form.

## 15. Job Details Configuration

Admins can add configurable job-specific information.

Examples:

- Shift
- Salary Range
- Joining Time
- Department Contact
- Other custom details

### Supported Job Detail Types

- Text
- Number
- Date
- Dropdown
- Long Text

Admins can:

- Add
- Edit
- Hide/show
- Reorder
- Configure
- Assign to a specific job

## 16. Google Sheets Data Architecture

### Existing Sheets

#### `POSITIONS`

Columns:

```text
id
title
department
location
employment_type
experience
qualification
description
responsibilities
requirements
deadline
status
display_order
created_at
updated_at
```

#### `DEPARTMENTS`

Columns:

```text
id
name
description
display_order
active
```

#### `WITH_CV`

Columns:

```text
id
application_id
position_id
candidate_name
email
phone
location
experience
qualification
additional_info
cv_file_id
cv_filename
status
created_at
```

#### `WITHOUT_CV`

Columns:

```text
id
application_id
position_id
candidate_name
email
phone
location
experience
qualification
additional_info
status
created_at
```

#### `SETTINGS`

Columns:

```text
key
value
```

#### `AUDIT_LOG`

Columns:

```text
id
actor
action
target
timestamp
details
```

### Recommended V2 Configuration Sheets

#### `FORM_FIELDS`

```text
id
key
label
description
type
required
visible
system_field
display_order
active
created_at
updated_at
```

#### `FORM_OPTIONS`

```text
id
field_id
label
value
display_order
active
```

#### `JOB_DETAILS`

```text
id
position_id
key
label
value
type
visible
display_order
active
```

#### `APPLICATION_STATUSES`

```text
id
name
display_order
active
```

## 17. Actual Recruitment Data

The portal is based on Malati Group recruitment material containing 23 positions:

1. QMS / IMS Representative Head
2. Supply Chain Management Head
3. HR & Administration Senior
4. HR Junior
5. Quality Head – Foundry
6. Development In-Charge – Foundry
7. Foundry Outsourcing Executive / In-Charge
8. Marketing Executive – Techno-Commercial
9. Marketing Supervisor
10. Maintenance In-Charge – Foundry
11. Maintenance In-Charge – Machine Shop
12. Maintenance Supervisor – Foundry
13. Electrical / Electronics / PLC Maintenance Engineer
14. Machine Shop Head
15. Machine Shop Outsourcing Development
16. Machine Shop Production Engineer
17. Quality Head & Quality Assurance – Machine Shop
18. CNC & VMC Programmer
19. Machine Shop Outsourcing Inspector
20. 3D CAD/CAM Works Designer
21. IT In-Charge / Software Engineer
22. Graduate Trainee / Technical Trainee
23. Creative Media / Digital Operations Intern

### Current Settings

```text
company_name = Malati Group
contact_email = hrandadmin@malatigroup.com
contact_phone = +91 91 68 66 32 36
portal_location = Hatkanangale, Kolhapur
recruitment_status = OPEN
```

## 18. Google Cloud Setup

Required setup:

1. Create Google Cloud project:
   `Malati Recruitment Portal`
2. Enable:
   - Google Sheets API
   - Google Drive API
3. Create service account.
4. Create service account JSON key.
5. Share the Google Sheet with the service account as Editor.
6. Create a Google Drive folder for CVs.
7. Share the CV folder with the service account as Editor.
8. Store the Drive folder ID.

Do not:

- Commit the service-account JSON to GitHub.
- Give unnecessarily broad Google Cloud project permissions.

Direct resource sharing is sufficient.

## 19. Environment Configuration

Create `.env.local` in the project root.

Expected configuration includes:

```text
GOOGLE_SPREADSHEET_ID
GOOGLE_SERVICE_ACCOUNT_KEY
JWT_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD_HASH

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD
HR_EMAIL

NEXT_PUBLIC_BASE_URL
EMAIL_ENABLED
```

Email should remain optional during development.

Recommended:

```text
EMAIL_ENABLED=false
```

when SMTP is not configured.

## 20. Email Architecture

Email must not block the core recruitment workflow.

The following should work without SMTP:

- Viewing jobs
- Viewing job details
- Applying
- Storing applications
- Admin management

SMTP can later be enabled for:

- Candidate acknowledgement
- HR notifications
- Status notifications

If email is disabled, application submission should still succeed.

## 21. Security

### Authentication

Admin authentication should use:

- JWT
- bcrypt
- Secure password handling
- Protected admin routes

### Google APIs

Google credentials must remain server-side.

Never expose:

- Service account JSON
- Google private key
- Drive credentials
- SMTP password
- JWT secret

to the browser.

### CV Security

CVs should be stored privately in Google Drive.

Candidates should not receive public Drive URLs.

Admin CV access should go through authenticated server-side handling.

### Application Security

Implement:

- Server-side validation
- File type validation
- File size limits
- Input sanitization/validation
- Authentication checks
- Authorization checks
- Secure session handling
- Rate limiting where appropriate
- Audit logging for sensitive admin actions

## 22. QR Code Tools

Admin should be able to generate QR links for:

- Main recruitment portal
- Department
- Specific job

Actions:

- Copy link
- Download QR
- Preview destination

## 23. Audit Log

Record important administrative actions.

Examples:

```text
Job created
Job edited
Job published
Job closed
Form field added
Form field edited
Form field hidden
Form field removed
Status changed
Applicant status changed
Settings changed
```

Each audit entry should include:

```text
id
actor
action
target
timestamp
details
```

## 24. Preview Before Publish

Configuration and job changes should support preview before becoming publicly active where practical.

This is especially important for:

- Job details
- Application form
- Job publishing
- Configuration changes

## 25. Build Phases

### Phase 1 — Foundation

Build:

- Next.js project structure
- Tailwind setup
- Global design system
- Google Sheets integration
- Google Drive integration
- Environment configuration
- Base API/server architecture
- Basic error handling

### Phase 2 — Candidate Portal

Build:

- Landing page
- Department pages/sections
- Job listing
- Job detail
- Responsive layout
- Apply flow
- Success page

### Phase 3 — Application Engine

Build:

- Configurable form renderer
- Form validation
- File upload
- Application ID generation
- Google Sheets storage
- Historical application storage
- Job-specific form overrides

### Phase 4 — Admin Authentication

Build:

- Admin login
- JWT authentication
- bcrypt password verification
- Protected routes
- Logout
- Session handling

### Phase 5 — Admin Recruitment Management

Build:

- Dashboard
- Job CRUD
- Job statuses
- Applicant table
- Applicant details
- Applicant status management
- Department management

### Phase 6 — Configuration Engine

Build:

- Form field management
- Field visibility
- Required/optional controls
- Field types
- Dropdown/radio options
- Field ordering
- Protected system fields
- Historical data protection

### Phase 7 — Job Configuration

Build:

- Job detail fields
- Job-specific overrides
- Job detail ordering
- Job detail visibility
- Preview

### Phase 8 — Admin Tools

Build:

- QR generator
- Audit log
- Search
- Filters
- Settings
- Recruitment status controls

### Phase 9 — Email

Add optional:

- Candidate acknowledgement
- HR notification
- Status notification

Email must remain decoupled from the core submission path.

### Phase 10 — QA

Test:

- Candidate mobile UX
- Desktop UX
- Admin UX
- Form configuration
- Job-specific overrides
- Required/visible behavior
- Historical data preservation
- CV upload
- Secure CV access
- Authentication
- Authorization
- Google Sheets failures
- Google Drive failures
- Email disabled mode
- Invalid submissions
- File validation
- Closed jobs
- QR destinations
- Audit logging

## 26. Current Next.js Prerendering Issue

The current application has encountered:

```text
Error: Route "/" encountered the unstable value `new Date()` while prerendering.
```

The trace points through:

```text
getPositions()
lib/google-sheets.ts
HomePage
app/page.tsx
```

The page already attempted:

```ts
await connection();
```

before loading:

```ts
getPositions()
getDepartments()
```

Therefore, the exact fix should be verified against the current project files, especially:

- `app/page.tsx`
- `lib/google-sheets.ts`
- `next.config.ts`

Do not blindly apply multiple caching/dynamic-rendering fixes before checking the actual project configuration.

The Google Sheets-backed recruitment pages should be treated as dynamic data-driven pages.

## 27. Development Email Mode

The application should be runnable locally without email configuration.

Development mode should allow:

```text
EMAIL_ENABLED=false
```

The portal should still support:

```text
Candidate → Application → Google Sheets → Admin
```

without SMTP.

## 28. Final Architecture

```text
                         ┌─────────────────────┐
                         │     Candidate UI    │
                         │  Mobile / Desktop   │
                         └──────────┬──────────┘
                                    │
                                    │
                         ┌──────────▼──────────┐
                         │      Next.js App     │
                         │                      │
                         │ Candidate UI         │
                         │ Admin UI             │
                         │ Server/API           │
                         │ Authentication       │
                         │ Validation           │
                         └───────┬───────┬──────┘
                                 │       │
                    ┌────────────┘       └────────────┐
                    ▼                                 ▼
             Google Sheets                       Google Drive
          Jobs / Applications /               Private CV files
          Configuration / Logs

                                 │
                                 ▼
                              SMTP
                         Optional email
```

## 29. Core Design Rule

> Everything recruitment-related should be configurable.
>
> Everything security- and infrastructure-related should remain controlled by the application.

This keeps the portal flexible for future recruitment changes without turning the project into an unnecessarily complex CMS or infrastructure platform.
