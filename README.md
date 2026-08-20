# Buildora Admin Review Portal (Angular 19)

Standalone internal admin review application for the Buildora Enterprise Platform.

---

## Key Features

- **JWT Authentication & AuthGuard**: Protected dashboard routes with `HttpInterceptorFn` attaching Bearer tokens and redirecting on 401s.
- **Dashboard Overview**: Header metric cards (Total, Pending, Approved, Rejected) with real-time statistics.
- **Searchable & Filterable Applications Table**: Live search by company name, contact, or email, status tabs, pagination.
- **Detailed Submission View**: 3 grouped sections matching the original form layout, with read-only interactive interest chips.
- **Approve / Reject Action Workflows**:
  - Modal confirmation for approval.
  - Modal rejection with mandatory reason text field.
  - Read-only review audit trail and automated email logs.

---

## Seed Credentials

- **Email:** `admin@buildora.com`
- **Password:** `Admin@Buildora2026!`

---

## Running Locally

1. Install dependencies:
```bash
cd D:\Projects\Buildora\Angular\buildora-admin-portal
npm install
```

2. Run the development server (configured on port **4201**):
```bash
npm start
```

3. Open in browser:
`http://localhost:4201`
