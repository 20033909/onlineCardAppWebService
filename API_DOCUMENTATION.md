# API Documentation

## Overview
The Online Card Application Web Service provides RESTful API endpoints for managing users and their credit/debit cards.

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-token>
```

---

## Endpoints

### Root Endpoint

#### GET /
Get basic API information.

**Response:**
```json
{
  "message": "Welcome to Online Card Application Web Service",
  "version": "1.0.0",
  "endpoints": {
    "users": "/api/users",
    "cards": "/api/cards"
  }
}
```

---

## User Endpoints

### Register User

#### POST /api/users/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Validation:**
- `username`: minimum 3 characters
- `email`: valid email format
- `password`: minimum 6 characters

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (409):**
```json
{
  "error": "Username already exists"
}
```

### Login

#### POST /api/users/login
Authenticate a user and receive a JWT token.

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Response (401):**
```json
{
  "error": "Invalid credentials"
}
```

### Get Profile

#### GET /api/users/profile
Get the authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "created_at": "2026-02-04 01:00:00"
  }
}
```

### Get All Users

#### GET /api/users
Get all registered users (requires authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "users": [
    {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "created_at": "2026-02-04 01:00:00"
    }
  ]
}
```

---

## Card Endpoints

All card endpoints require authentication.

### Create Card

#### POST /api/cards
Create a new card for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cardNumber": "4532015112830366",
  "cardHolderName": "John Doe",
  "expiryDate": "12/25",
  "cvv": "123",
  "cardType": "Visa",
  "balance": 1000.00
}
```

**Validation:**
- `cardNumber`: 13-19 digits
- `cardHolderName`: required
- `expiryDate`: MM/YY format
- `cvv`: 3-4 digits
- `cardType`: Visa, MasterCard, American Express, or Discover
- `balance`: optional (default: 0)

**Response (201):**
```json
{
  "message": "Card created successfully",
  "card": {
    "id": 1,
    "userId": 1,
    "cardNumber": "4532015112830366",
    "cardHolderName": "John Doe",
    "expiryDate": "12/25",
    "cardType": "Visa",
    "balance": 1000
  }
}
```

**Note:** CVV is not returned in responses for security.

### Get All Cards

#### GET /api/cards
Get all cards for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "cards": [
    {
      "id": 1,
      "user_id": 1,
      "card_number": "4532015112830366",
      "card_holder_name": "John Doe",
      "expiry_date": "12/25",
      "card_type": "Visa",
      "balance": 1000,
      "is_active": 1,
      "created_at": "2026-02-04 01:00:00"
    }
  ]
}
```

### Get Card by ID

#### GET /api/cards/:id
Get a specific card by ID.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "card": {
    "id": 1,
    "user_id": 1,
    "card_number": "4532015112830366",
    "card_holder_name": "John Doe",
    "expiry_date": "12/25",
    "card_type": "Visa",
    "balance": 1000,
    "is_active": 1,
    "created_at": "2026-02-04 01:00:00"
  }
}
```

**Error Response (403):**
```json
{
  "error": "Access denied"
}
```

**Error Response (404):**
```json
{
  "error": "Card not found"
}
```

### Update Card

#### PUT /api/cards/:id
Update card information.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "cardHolderName": "John M. Doe",
  "expiryDate": "12/26",
  "isActive": true
}
```

**Note:** Only these fields can be updated. Card number and CVV cannot be changed.

**Response (200):**
```json
{
  "message": "Card updated successfully",
  "card": {
    "id": 1,
    "user_id": 1,
    "card_number": "4532015112830366",
    "card_holder_name": "John M. Doe",
    "expiry_date": "12/26",
    "card_type": "Visa",
    "balance": 1000,
    "is_active": 1,
    "created_at": "2026-02-04 01:00:00"
  }
}
```

### Update Card Balance

#### PATCH /api/cards/:id/balance
Update the balance of a card.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "balance": 1500.00
}
```

**Response (200):**
```json
{
  "message": "Card balance updated successfully",
  "balance": 1500
}
```

### Delete Card

#### DELETE /api/cards/:id
Delete a card.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Card deleted successfully"
}
```

---

## Error Responses

### 400 Bad Request
Validation errors or invalid input.

```json
{
  "errors": [
    {
      "msg": "Username must be at least 3 characters",
      "param": "username",
      "location": "body"
    }
  ]
}
```

### 401 Unauthorized
Missing or invalid authentication token.

```json
{
  "error": "Access token required"
}
```

### 403 Forbidden
Valid token but insufficient permissions.

```json
{
  "error": "Access denied"
}
```

### 404 Not Found
Resource not found.

```json
{
  "error": "Card not found"
}
```

### 409 Conflict
Resource already exists.

```json
{
  "error": "Username already exists"
}
```

### 500 Internal Server Error
Server error.

```json
{
  "error": {
    "message": "Internal Server Error",
    "status": 500
  }
}
```

---

## Data Models

### User
```
id: INTEGER (PRIMARY KEY)
username: TEXT (UNIQUE)
email: TEXT (UNIQUE)
password: TEXT (hashed)
created_at: DATETIME
```

### Card
```
id: INTEGER (PRIMARY KEY)
user_id: INTEGER (FOREIGN KEY)
card_number: TEXT (UNIQUE)
card_holder_name: TEXT
expiry_date: TEXT
cvv: TEXT
card_type: TEXT
balance: REAL
is_active: BOOLEAN
created_at: DATETIME
```

---

## Security Considerations

1. **Password Storage**: Passwords are hashed using bcrypt before storage
2. **JWT Tokens**: Tokens expire after 24 hours
3. **CVV Protection**: CVV is never returned in API responses
4. **Authorization**: Users can only access their own cards
5. **Input Validation**: All inputs are validated using express-validator

---

## Example Usage

### Complete Workflow Example

```bash
# 1. Register a new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"testpass123"}'

# Response includes token:
# {"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}

# 2. Create a card (use token from registration)
curl -X POST http://localhost:3000/api/cards \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "cardNumber":"4532015112830366",
    "cardHolderName":"Test User",
    "expiryDate":"12/25",
    "cvv":"123",
    "cardType":"Visa",
    "balance":1000.00
  }'

# 3. Get all cards
curl -X GET http://localhost:3000/api/cards \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 4. Update card balance
curl -X PATCH http://localhost:3000/api/cards/1/balance \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"balance":1500.00}'
```
