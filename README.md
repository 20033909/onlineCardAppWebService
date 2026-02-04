# Online Card Application Web Service

A RESTful API backend service for managing online card applications. This project provides comprehensive functionality for user authentication and card management operations.

## Features

- **User Management**
  - User registration and authentication
  - JWT-based authorization
  - Secure password hashing with bcrypt

- **Card Management**
  - Create, read, update, and delete cards
  - Support for multiple card types (Visa, MasterCard, American Express, Discover)
  - Card balance management
  - Card activation/deactivation
  - Secure CVV handling

- **Security**
  - JWT token-based authentication
  - Password encryption
  - Protected API endpoints
  - Input validation and sanitization
  - Rate limiting to prevent abuse

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite3
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Rate Limiting**: express-rate-limit

## Installation

1. Clone the repository:
```bash
git clone https://github.com/20033909/onlineCardAppWebService.git
cd onlineCardAppWebService
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
```
PORT=3000
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

## Usage

### Start the server:
```bash
npm start
```

### Development mode (with auto-reload):
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### User Endpoints

#### Register a new user
```http
POST /api/users/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "securepassword"
}
```

#### Get user profile
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Get all users
```http
GET /api/users
Authorization: Bearer <token>
```

### Card Endpoints

All card endpoints require authentication via JWT token in the Authorization header.

#### Create a new card
```http
POST /api/cards
Authorization: Bearer <token>
Content-Type: application/json

{
  "cardNumber": "4532015112830366",
  "cardHolderName": "John Doe",
  "expiryDate": "12/25",
  "cvv": "123",
  "cardType": "Visa",
  "balance": 1000.00
}
```

#### Get all user's cards
```http
GET /api/cards
Authorization: Bearer <token>
```

#### Get a specific card
```http
GET /api/cards/:id
Authorization: Bearer <token>
```

#### Update a card
```http
PUT /api/cards/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "cardHolderName": "John M. Doe",
  "expiryDate": "12/26",
  "isActive": true
}
```

#### Update card balance
```http
PATCH /api/cards/:id/balance
Authorization: Bearer <token>
Content-Type: application/json

{
  "balance": 1500.00
}
```

#### Delete a card
```http
DELETE /api/cards/:id
Authorization: Bearer <token>
```

## Database Schema

### Users Table
- `id` (INTEGER, PRIMARY KEY)
- `username` (TEXT, UNIQUE)
- `email` (TEXT, UNIQUE)
- `password` (TEXT, hashed)
- `created_at` (DATETIME)

### Cards Table
- `id` (INTEGER, PRIMARY KEY)
- `user_id` (INTEGER, FOREIGN KEY)
- `card_number` (TEXT, UNIQUE)
- `card_holder_name` (TEXT)
- `expiry_date` (TEXT)
- `cvv` (TEXT)
- `card_type` (TEXT)
- `balance` (REAL)
- `is_active` (BOOLEAN)
- `created_at` (DATETIME)

## Testing

Run the test suite:
```bash
npm test
```

## Project Structure

```
onlineCardAppWebService/
├── src/
│   ├── config/
│   │   └── database.js       # Database configuration
│   ├── middleware/
│   │   └── auth.js            # Authentication middleware
│   ├── models/
│   │   ├── User.js            # User model
│   │   └── Card.js            # Card model
│   ├── routes/
│   │   ├── userRoutes.js      # User routes
│   │   └── cardRoutes.js      # Card routes
│   └── index.js               # Main application file
├── tests/
│   └── api.test.js            # API tests
├── .env.example               # Example environment variables
├── .gitignore                 # Git ignore file
├── package.json               # Project dependencies
└── README.md                  # This file
```

## Security Considerations

- Never commit the `.env` file to version control
- Change the `JWT_SECRET` in production
- Use HTTPS in production
- Rate limiting is implemented to prevent abuse:
  - General endpoints: 100 requests per 15 minutes
  - Authentication endpoints: 5 attempts per 15 minutes
  - Card operations: 50 requests per 15 minutes
- Validate and sanitize all user inputs

## License

ISC