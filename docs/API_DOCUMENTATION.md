# API Documentation

Complete API reference for Jivhala Motors Backend

## Base URL
```
Development: http://localhost:3000
Production: https://backend-0v1f.onrender.com
```

## Authentication

All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {}, // response data
  "message": "Success message"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {} // optional error details
}
```

## Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "username": "string",
  "email": "string",
  "phone": "string",
  "password": "string",
  "role": "admin|dealer" // optional, defaults to "dealer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "string",
      "email": "string",
      "phone": "string",
      "role": "dealer"
    },
    "token": "jwt_token"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "login": "username or email",
  "password": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "username": "string",
      "email": "string",
      "role": "dealer"
    },
    "token": "jwt_token"
  }
}
```

#### Forgot Password
```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "string"
}
```

### Vehicle Routes (`/api/vehicles`)

#### Get All Vehicles
```http
GET /api/vehicles
```

**Query Parameters:**
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page
- `search` (optional): Search term
- `status` (optional): Filter by status (available, sold, reserved)

**Response:**
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "vehicle_id",
        "make": "string",
        "model": "string",
        "year": 2024,
        "price": 150000,
        "status": "available",
        "photos": ["photo1.jpg"],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Create Vehicle
```http
POST /api/vehicles
```

**Content-Type:** `multipart/form-data`

**Form Data:**
```
make: string
model: string
year: number
price: number
mileage: number
color: string
fuelType: string
transmission: string
bodyType: string
description: string (optional)
status: string (optional, defaults to "available")
photos: File[] (optional, multiple image files)
buyerName: string (required if status is "sold")
buyerPhone: string (required if status is "sold")
buyerPhoto: File (optional, buyer photo if status is "sold")
```

#### Get Vehicle by ID
```http
GET /api/vehicles/:id
```

#### Update Vehicle
```http
PUT /api/vehicles/:id
```

**Content-Type:** `multipart/form-data`
(Same form data as Create Vehicle)

#### Delete Vehicle
```http
DELETE /api/vehicles/:id
```

### Export Routes (`/api/export`)

#### Export to PDF
```http
GET /api/export/pdf
```

**Query Parameters:**
- `status` (optional): Filter by status
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:** PDF file download

#### Export to Excel
```http
GET /api/export/excel
```

**Query Parameters:**
- `status` (optional): Filter by status
- `startDate` (optional): Start date filter
- `endDate` (optional): End date filter

**Response:** Excel file download

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 12345,
  "environment": "production"
}
```

## Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | BAD_REQUEST | Invalid request data |
| 401 | UNAUTHORIZED | Authentication required |
| 403 | FORBIDDEN | Insufficient permissions |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 422 | VALIDATION_ERROR | Validation failed |
| 429 | RATE_LIMIT | Too many requests |
| 500 | INTERNAL_ERROR | Server error |

## Rate Limiting

API requests are rate limited:
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **General endpoints**: 100 requests per 15 minutes per IP

## File Upload

### Supported Image Formats
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits
- **Vehicle photos**: 10MB per file
- **Buyer photos**: 5MB per file

### Upload Response
Uploaded files are accessible via:
```
GET /uploads/vehicles/{filename}
```

## Pagination

List endpoints support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

**Response includes:**
```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "hasNext": true,
    "hasPrev": false,
    "limit": 10
  }
}
```

## Data Validation

### Vehicle Data
- `make`: Required, 2-50 characters
- `model`: Required, 2-50 characters
- `year`: Required, 1900-current year
- `price`: Required, positive number
- `mileage`: Required, non-negative number
- `status`: Must be one of: "available", "sold", "reserved"

### User Data
- `username`: Required, 3-30 characters, alphanumeric + underscore
- `email`: Required, valid email format
- `phone`: Required, valid phone number
- `password`: Required, minimum 6 characters

## Examples

### Complete Vehicle Creation Example

```javascript
const formData = new FormData();
formData.append('make', 'Toyota');
formData.append('model', 'Camry');
formData.append('year', '2023');
formData.append('price', '250000');
formData.append('mileage', '15000');
formData.append('color', 'White');
formData.append('fuelType', 'Petrol');
formData.append('transmission', 'Automatic');
formData.append('bodyType', 'Sedan');
formData.append('description', 'Well maintained vehicle');
formData.append('photos', file1);
formData.append('photos', file2);

const response = await fetch('/api/vehicles', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token
  },
  body: formData
});
```

### Search and Filter Example

```javascript
const response = await fetch('/api/vehicles?search=toyota&status=available&page=1&limit=20', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});
```
