# 🔌 API Documentation

## Overview

The Doctor Booking System uses RESTful APIs to manage doctor data. All endpoints are authenticated via MongoDB and validated on both client and server side.

---

## Base URL

```
http://localhost:3000/api
```

Production: Replace with your deployed URL

---

## Endpoints

### 1. Get All Doctors

```http
GET /doctors
```

**Description:** Fetch all doctors from the database with optional filtering

**Query Parameters:**

| Parameter | Type | Required | Example |
|-----------|------|----------|---------|
| name | string | No | `?name=john` |
| specialty | string | No | `?specialty=cardiologist` |

**Examples:**

```bash
# Get all doctors
curl http://localhost:3000/api/doctors

# Filter by name (case-insensitive)
curl "http://localhost:3000/api/doctors?name=tushar"

# Filter by specialty
curl "http://localhost:3000/api/doctors?specialty=General%20Physician"

# Combined filters
curl "http://localhost:3000/api/doctors?name=dr&specialty=General%20Physician"
```

**Response (Success):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Dr. Tushar Kalra",
      "qualification": "MBBS, MD",
      "experience": "12 years",
      "address": "123 Medical Centre, Panipat",
      "googleLocation": "https://maps.google.com/maps?q=panipat",
      "phone": "+91 9876543210",
      "opdFees": 300,
      "specialty": "General Physician",
      "slots": ["10:00 AM", "11:30 AM", "1:00 PM", "3:00 PM"],
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

**Response (Error):**

```json
{
  "success": false,
  "message": "Error fetching doctors",
  "error": "Connection timeout"
}
```

**Status Codes:**

| Code | Meaning |
|------|---------|
| 200 | Success - doctors returned |
| 500 | Server error - check connection |

---

### 2. Add New Doctor

```http
POST /doctors
```

**Description:** Add a new doctor to the database

**Headers:**

```
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Dr. Jane Doe",
  "qualification": "MBBS, MD",
  "experience": "10 years",
  "specialty": "Cardiologist",
  "address": "456 Heart Care Centre, Panipat",
  "googleLocation": "https://maps.google.com/maps?q=heart+care+panipat",
  "phone": "+91 9876543211",
  "opdFees": 500,
  "slots": ["10:00 AM", "2:00 PM", "4:00 PM"]
}
```

**Field Descriptions:**

| Field | Type | Required | Example | Notes |
|-------|------|----------|---------|-------|
| name | string | Yes | Dr. Jane Doe | Full name with title |
| qualification | string | Yes | MBBS, MD | Comma-separated qualifications |
| experience | string | Yes | 10 years | Can include years/description |
| specialty | string | Yes | Cardiologist | Medical specialization |
| address | string | Yes | 456 Heart Care... | Full clinic address |
| googleLocation | string | Yes | https://maps.google.com/... | Valid Google Maps URL |
| phone | string | Yes | +91 9876543211 | Phone with country code |
| opdFees | number | Yes | 500 | Amount in rupees (no decimals) |
| slots | array | No | ["10:00 AM", "2:00 PM"] | Available time slots |

**Example Request:**

```bash
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Doe",
    "qualification": "MBBS, MD",
    "experience": "10 years",
    "specialty": "Cardiologist",
    "address": "456 Heart Care Centre, Panipat",
    "googleLocation": "https://maps.google.com/maps?q=heart+care+panipat",
    "phone": "+91 9876543211",
    "opdFees": 500,
    "slots": ["10:00 AM", "2:00 PM", "4:00 PM"]
  }'
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Doctor added successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "Dr. Jane Doe",
    "qualification": "MBBS, MD",
    "experience": "10 years",
    "specialty": "Cardiologist",
    "address": "456 Heart Care Centre, Panipat",
    "googleLocation": "https://maps.google.com/maps?q=heart+care+panipat",
    "phone": "+91 9876543211",
    "opdFees": 500,
    "slots": ["10:00 AM", "2:00 PM", "4:00 PM"],
    "createdAt": "2024-01-15T10:35:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

**Response (Validation Error):**

```json
{
  "success": false,
  "message": "Missing required fields"
}
```

**Response (Server Error):**

```json
{
  "success": false,
  "message": "Error creating doctor",
  "error": "E11000 duplicate key error"
}
```

**Status Codes:**

| Code | Meaning |
|------|---------|
| 201 | Created - doctor added successfully |
| 400 | Bad Request - missing/invalid fields |
| 500 | Server error - database connection failed |

---

## Field Validation Rules

### Server-Side Validation

All required fields must be present:
- ✅ `name` - Cannot be empty
- ✅ `qualification` - Cannot be empty
- ✅ `experience` - Cannot be empty
- ✅ `specialty` - Cannot be empty
- ✅ `address` - Cannot be empty
- ✅ `googleLocation` - Cannot be empty
- ✅ `phone` - Cannot be empty
- ✅ `opdFees` - Must be >= 0

### Client-Side Validation

Frontend validates before sending:
- ✅ HTML5 required attributes
- ✅ Number input validation (opdFees)
- ✅ URL validation (googleLocation)
- ✅ Phone type input

---

## Error Handling

### Common Errors

**1. Missing MongoDB Connection**
```json
{
  "success": false,
  "error": "MONGODB_URI is not defined in environment variables"
}
```
**Solution:** Create `.env.local` with `MONGODB_URI`

**2. Invalid JSON**
```json
{
  "success": false,
  "error": "Unexpected token"
}
```
**Solution:** Check JSON syntax is valid

**3. Duplicate Phone Number**
```json
{
  "success": false,
  "error": "E11000 duplicate key error"
}
```
**Solution:** Use unique phone number

**4. Invalid MongoDB URI**
```json
{
  "success": false,
  "error": "connect ECONNREFUSED"
}
```
**Solution:** Verify MongoDB URI credentials

---

## Usage Examples

### JavaScript/TypeScript

```typescript
// Fetch all doctors
const response = await fetch('/api/doctors');
const data = await response.json();
console.log(data.data); // Array of doctors

// Filter by name
const filtered = await fetch('/api/doctors?name=tushar');
const result = await filtered.json();

// Add doctor
const newDoctor = await fetch('/api/doctors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Dr. New',
    qualification: 'MBBS',
    experience: '5 years',
    specialty: 'Dentist',
    address: '789 Dental Clinic',
    googleLocation: 'https://maps.google.com/...',
    phone: '+91 9876543220',
    opdFees: 200,
    slots: ['9:00 AM', '11:00 AM']
  })
});

const result = await newDoctor.json();
if (result.success) {
  console.log('Doctor added!', result.data);
}
```

### React Hook

```typescript
// Custom hook for doctors
function useDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/doctors')
      .then(r => r.json())
      .then(d => setDoctors(d.data))
      .finally(() => setLoading(false));
  }, []);

  const addDoctor = async (doctorData) => {
    const response = await fetch('/api/doctors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doctorData)
    });
    return response.json();
  };

  return { doctors, loading, addDoctor };
}

// Usage
const { doctors, addDoctor } = useDoctors();
```

### cURL Examples

```bash
# Get all doctors
curl http://localhost:3000/api/doctors

# Pretty print response
curl -s http://localhost:3000/api/doctors | json_pp

# Filter by specialty
curl "http://localhost:3000/api/doctors?specialty=Cardiologist"

# Add doctor with cURL
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d @doctor.json

# Add doctor inline
curl -X POST http://localhost:3000/api/doctors \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Dr. Test",
    "qualification":"MBBS",
    "experience":"5",
    "specialty":"General",
    "address":"Test Address",
    "googleLocation":"https://maps.google.com",
    "phone":"+91 9999999999",
    "opdFees":300
  }'
```

---

## Rate Limiting

Currently no rate limiting is implemented. For production, consider:

```typescript
// Add to your API route
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use('/api/doctors', limiter);
```

---

## CORS Configuration

For cross-origin requests from external domains:

```typescript
// Add to app/api/doctors/route.ts
export function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

---

## Database Schema

```typescript
interface Doctor {
  _id: ObjectId;
  name: string;
  qualification: string;
  experience: string;
  address: string;
  googleLocation: string;
  phone: string;
  opdFees: number;
  specialty: string;
  slots: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Pagination (Future)

For handling large doctor lists:

```bash
curl "http://localhost:3000/api/doctors?page=1&limit=10"

Response:
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 50,
    "page": 1,
    "pages": 5,
    "limit": 10
  }
}
```

---

## Response Format

All responses follow consistent structure:

```json
{
  "success": true|false,
  "message": "Optional message",
  "data": {...}|[...],
  "error": "Error details if failed"
}
```

---

## Best Practices

1. **Always check `success` field** before using `data`
2. **Handle errors gracefully** on client side
3. **Validate input** before sending to API
4. **Use HTTPS** in production
5. **Never expose credentials** in client code
6. **Cache responses** where appropriate
7. **Add loading states** during API calls
8. **Test with Postman/Thunder Client** before deployment

---

## Testing Your API

### Using Postman

1. Create new request
2. Method: GET or POST
3. URL: `http://localhost:3000/api/doctors`
4. For POST: Add body with JSON
5. Send and check response

### Using Thunder Client (VS Code)

1. Install extension
2. Create new request
3. Configure same way as Postman
4. Test and inspect response

### Using Browser Console

```javascript
// In DevTools console
fetch('/api/doctors').then(r => r.json()).then(d => console.log(d))
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Jan 2024 | Initial release with GET/POST |

---

## Support

For issues or questions:
1. Check error message in response
2. Review this documentation
3. Check server logs
4. Verify MongoDB connection
5. Restart dev server

Happy API integration! 🚀
