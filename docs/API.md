# API Documentation - Alveo System

Complete REST API reference for the Alveo System dental SaaS application.

## Table of Contents

- [Base URL](#base-url)
- [Authentication](#authentication)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Authentication](#authentication-endpoints)
  - [Patients](#patients)
  - [Doctors](#doctors)
  - [Appointments](#appointments)
  - [Expenses](#expenses)
  - [Labworks](#labworks)
  - [Settings](#settings)
  - [Statistics](#statistics)
  - [Export](#export)
  - [Billing](#billing)
  - [Admin](#admin)

---

## Base URL

**Development:**
```
http://localhost:5001/api/v1
```

**Production:**
```
https://api.yourdomain.com/api/v1
```

---

## Authentication

Most endpoints require authentication. Include the JWT access token in the Authorization header:

```http
Authorization: Bearer <access_token>
```

### Token Lifecycle

1. **Login** → Receive `accessToken` + `refreshToken`
2. **Use** `accessToken` for authenticated requests (expires in 15m)
3. **Refresh** using `refreshToken` when access token expires (valid for 7d)
4. **Logout** → Invalidate both tokens

---

## Response Format

### Success Response

```json
{
  "data": {...}
}
```

### List Response (with pagination)

```json
{
  "data": [...],
  "total": 100
}
```

### Error Response

```json
{
  "error": "Error message describing what went wrong"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## Error Handling

All errors follow the same format:

```json
{
  "error": "Description of the error"
}
```

**Common Errors:**

| Status | Error | Description |
|--------|-------|-------------|
| 400 | Validation error | Request data is invalid |
| 401 | No token provided | Authorization header missing |
| 401 | Invalid or expired token | Token is invalid or expired |
| 403 | Insufficient permissions | User lacks required role |
| 404 | Resource not found | Requested resource doesn't exist |
| 409 | Duplicate resource | Resource with same unique field exists |

---

## Rate Limiting

**Status:** Currently not implemented (planned for future release)

**Planned limits:**
- `/api/v1/auth/*`: 5 requests per 15 minutes per IP
- All other endpoints: 100 requests per 15 minutes per user

---

## Endpoints

### Health

#### GET /health

Health check endpoint (no authentication required).

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-27T12:00:00.000Z",
  "uptime": 3600,
  "database": "connected"
}
```

---

### Authentication Endpoints

#### POST /auth/register

Register a new tenant (clinic) and owner account.

**Request Body:**
```json
{
  "clinicName": "Clínica Dental Sonrisa",
  "clinicSlug": "sonrisa",
  "firstName": "Dr. Juan",
  "lastName": "Pérez",
  "email": "doctor@clinica.com",
  "password": "SecurePassword123!",
  "phone": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "user": {
      "id": "usr_...",
      "email": "doctor@clinica.com",
      "firstName": "Dr. Juan",
      "lastName": "Pérez",
      "role": "OWNER"
    },
    "tenant": {
      "id": "tnt_...",
      "name": "Clínica Dental Sonrisa",
      "slug": "sonrisa",
      "plan": "FREE"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

#### POST /auth/login

Login to existing account.

**Request Body:**
```json
{
  "email": "doctor@clinica.com",
  "password": "SecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "user": {
      "id": "usr_...",
      "email": "doctor@clinica.com",
      "firstName": "Dr. Juan",
      "lastName": "Pérez",
      "role": "OWNER",
      "tenantId": "tnt_..."
    },
    "tenant": {
      "id": "tnt_...",
      "name": "Clínica Dental Sonrisa",
      "slug": "sonrisa",
      "plan": "FREE"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

#### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbG..."
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "accessToken": "eyJhbG...",
    "refreshToken": "eyJhbG..."
  }
}
```

---

#### POST /auth/logout

Logout (invalidate tokens).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

#### POST /auth/forgot-password

Request password reset email.

**Request Body:**
```json
{
  "email": "doctor@clinica.com"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "message": "Password reset email sent"
  }
}
```

---

#### POST /auth/reset-password

Reset password using token from email.

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "password": "NewSecurePassword123!"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "message": "Password reset successful"
  }
}
```

---

### Patients

#### GET /patients

Get all patients for current tenant.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search` (optional): Search by name, email, or phone
- `gender` (optional): Filter by gender (`male`, `female`, `other`, `prefer_not_to_say`)
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Skip results (default: 0)

**Example:**
```
GET /patients?search=Juan&limit=20
```

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "pat_...",
      "tenantId": "tnt_...",
      "firstName": "Juan",
      "lastName": "García",
      "email": "juan@email.com",
      "phone": "+1234567890",
      "dob": "1990-05-15T00:00:00.000Z",
      "gender": "male",
      "address": "Calle Principal 123",
      "toothNotes": {},
      "isActive": true,
      "createdAt": "2026-01-15T10:30:00.000Z",
      "updatedAt": "2026-01-20T14:45:00.000Z"
    }
  ],
  "total": 42
}
```

---

#### GET /patients/:id

Get patient by ID.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "pat_...",
    "firstName": "Juan",
    "lastName": "García",
    ...
  }
}
```

---

#### POST /patients

Create new patient.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "Juan",
  "lastName": "García",
  "email": "juan@email.com",
  "phone": "+1234567890",
  "dob": "1990-05-15",
  "gender": "male",
  "address": "Calle Principal 123"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "id": "pat_...",
    "firstName": "Juan",
    "lastName": "García",
    ...
  }
}
```

---

#### PATCH /patients/:id

Update patient.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (all fields optional)
```json
{
  "firstName": "Juan Carlos",
  "email": "nuevoemail@email.com"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "pat_...",
    "firstName": "Juan Carlos",
    ...
  }
}
```

---

#### DELETE /patients/:id

Soft delete patient (sets isActive to false).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "message": "Patient deleted successfully"
  }
}
```

---

#### PUT /patients/:id/restore

Restore soft-deleted patient.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "pat_...",
    "isActive": true,
    ...
  }
}
```

---

#### PUT /patients/:id/tooth-notes

Update tooth notes (dental chart).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "toothNumber": "11",
  "note": "Caries detectada"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "pat_...",
    "toothNotes": {
      "11": "Caries detectada"
    }
  }
}
```

---

#### DELETE /patients/:id/tooth-notes/:toothNumber

Delete tooth note.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "message": "Tooth note deleted"
  }
}
```

---

### Doctors

#### GET /doctors

Get all doctors for current tenant.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search` (optional): Search by name or specialty
- `specialty` (optional): Filter by specialty
- `limit` (optional): Results per page
- `offset` (optional): Skip results

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "doc_...",
      "tenantId": "tnt_...",
      "firstName": "Dr. María",
      "lastName": "López",
      "email": "maria@clinica.com",
      "phone": "+1234567890",
      "specialty": "Ortodoncista",
      "licenseNumber": "LIC-12345",
      "workingDays": ["MON", "TUE", "WED", "THU", "FRI"],
      "workingHours": {
        "start": "09:00",
        "end": "18:00"
      },
      "consultingRoom": "Consultorio 1",
      "bio": "Especialista en ortodoncia con 10 años de experiencia",
      "hourlyRate": 100.00,
      "isActive": true,
      "createdAt": "2026-01-10T08:00:00.000Z"
    }
  ],
  "total": 5
}
```

---

#### POST /doctors

Create new doctor.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "firstName": "Dr. María",
  "lastName": "López",
  "email": "maria@clinica.com",
  "phone": "+1234567890",
  "specialty": "Ortodoncista",
  "licenseNumber": "LIC-12345",
  "workingDays": ["MON", "TUE", "WED", "THU", "FRI"],
  "workingHours": {
    "start": "09:00",
    "end": "18:00"
  },
  "consultingRoom": "Consultorio 1",
  "bio": "Especialista en ortodoncia",
  "hourlyRate": 100.00
}
```

**Response:** `201 Created`

---

#### PATCH /doctors/:id

Update doctor.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (all fields optional)

**Response:** `200 OK`

---

#### DELETE /doctors/:id

Soft delete doctor.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

---

#### PUT /doctors/:id/restore

Restore soft-deleted doctor.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

---

### Appointments

#### GET /appointments

Get all appointments for current tenant.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `patientId` (optional): Filter by patient
- `doctorId` (optional): Filter by doctor
- `status` (optional): Filter by status
- `startDate` (optional): Filter by start date (YYYY-MM-DD)
- `endDate` (optional): Filter by end date (YYYY-MM-DD)
- `limit`, `offset`: Pagination

**Appointment Statuses:**
- `SCHEDULED` - Agendada
- `CONFIRMED` - Confirmada
- `IN_PROGRESS` - En progreso
- `COMPLETED` - Completada
- `CANCELLED` - Cancelada
- `NO_SHOW` - No asistió
- `RESCHEDULED` - Reagendada

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "apt_...",
      "patientId": "pat_...",
      "patientName": "Juan García",
      "doctorId": "doc_...",
      "doctorName": "Dr. María López",
      "startTime": "2026-01-28T10:00:00.000Z",
      "endTime": "2026-01-28T10:30:00.000Z",
      "type": "Consulta general",
      "notes": "Primera consulta",
      "status": "SCHEDULED",
      "cost": 50.00,
      "isPaid": false,
      "isActive": true,
      "createdAt": "2026-01-20T15:00:00.000Z"
    }
  ],
  "total": 15
}
```

---

#### POST /appointments

Create new appointment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**
```json
{
  "patientId": "pat_...",
  "doctorId": "doc_...",
  "startTime": "2026-01-28T10:00:00.000Z",
  "endTime": "2026-01-28T10:30:00.000Z",
  "type": "Consulta general",
  "notes": "Primera consulta",
  "status": "SCHEDULED",
  "cost": 50.00,
  "isPaid": false
}
```

**Response:** `201 Created`

---

#### PATCH /appointments/:id

Update appointment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (all fields optional)

**Response:** `200 OK`

---

#### DELETE /appointments/:id

Soft delete appointment.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

---

### Expenses

#### GET /expenses

Get all expenses for current tenant.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search` (optional): Search by supplier or items
- `isPaid` (optional): Filter by payment status (true/false)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "exp_...",
      "supplier": "Dental Supply Co.",
      "items": "Guantes, mascarillas",
      "amount": 150.50,
      "date": "2026-01-25T00:00:00.000Z",
      "isPaid": false,
      "notes": "Compra mensual",
      "isActive": true,
      "createdAt": "2026-01-25T09:00:00.000Z"
    }
  ],
  "total": 20
}
```

#### GET /expenses/stats

Get expense statistics.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "total": 25,
    "unpaid": 10,
    "paid": 15,
    "totalAmount": 5250.75
  }
}
```

---

### Labworks

#### GET /labworks

Get all labworks for current tenant.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `search`: Search by lab or patient
- `isPaid`: Filter by payment status
- `isDelivered`: Filter by delivery status

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "lab_...",
      "lab": "Laboratorio Dental Premium",
      "patientId": "pat_...",
      "patientName": "Juan García",
      "description": "Corona de porcelana",
      "value": 300.00,
      "entryDate": "2026-01-20T00:00:00.000Z",
      "expectedDeliveryDate": "2026-01-27T00:00:00.000Z",
      "isPaid": false,
      "isDelivered": false,
      "isActive": true
    }
  ],
  "total": 8
}
```

#### GET /labworks/stats

Get labwork statistics.

**Response:** `200 OK`
```json
{
  "data": {
    "total": 15,
    "pending": 8,
    "delivered": 7,
    "unpaid": 10,
    "totalValue": 4500.00
  }
}
```

---

### Settings

#### GET /settings

Get tenant settings.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "id": "tnt_...",
    "name": "Clínica Dental Sonrisa",
    "slug": "sonrisa",
    "plan": "FREE",
    "email": "info@clinica.com",
    "phone": "+1234567890",
    "address": "Av. Principal 123",
    "logo": null,
    "website": "https://clinica.com",
    "socialMedia": {
      "facebook": "https://facebook.com/clinica",
      "instagram": "@clinica"
    }
  }
}
```

---

#### PATCH /settings

Update tenant settings.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:** (all fields optional)
```json
{
  "name": "Clínica Dental Nueva Sonrisa",
  "email": "contacto@clinica.com",
  "phone": "+9876543210"
}
```

**Response:** `200 OK`

---

### Statistics

#### GET /stats/overview

Get dashboard statistics overview.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "data": {
    "patients": {
      "total": 125,
      "active": 120,
      "new": 15
    },
    "appointments": {
      "total": 450,
      "today": 8,
      "thisWeek": 45,
      "thisMonth": 180
    },
    "revenue": {
      "today": 850.00,
      "thisWeek": 5200.00,
      "thisMonth": 22500.00
    }
  }
}
```

---

### Export

#### GET /export/patients

Export patients to CSV.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK` (CSV file)

---

#### GET /export/appointments

Export appointments to CSV.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD

**Response:** `200 OK` (CSV file)

---

### Billing

#### GET /billing/plans

Get available subscription plans.

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "FREE",
      "name": "Gratis",
      "price": 0,
      "limits": {
        "admins": 1,
        "doctors": 3,
        "patients": 15,
        "storage": 104857600
      }
    }
  ]
}
```

---

### Admin

Super admin endpoints (require super admin authentication).

#### POST /admin/setup

Create first super admin account (one-time use).

**Request Body:**
```json
{
  "setupKey": "your-setup-key",
  "email": "admin@example.com",
  "password": "SecurePassword123!",
  "firstName": "Super",
  "lastName": "Admin"
}
```

**Response:** `201 Created`

---

#### GET /admin/tenants

Get all tenants (super admin only).

**Headers:**
```
Authorization: Bearer <superadmin_token>
```

**Response:** `200 OK`

---

## Additional Information

### Multi-Tenancy

All endpoints (except `/admin/*` and `/auth/register`) operate within the context of the authenticated user's tenant. Data is automatically filtered by `tenantId`.

### Versioning

Current API version: `v1`

All endpoints are prefixed with `/api/v1`.

### CORS

Configured via `CORS_ORIGIN` environment variable.

Development: `http://localhost:5002`

---

*Last updated: January 27, 2026*
