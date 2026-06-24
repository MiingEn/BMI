# BMI Calculator (Angular + Spring Boot)

## Features
- User registration and login
- BMI calculations and persisted history per user
- Admin dashboard with:
  - users tab (remove users)
  - BMI tab grouped by user
- Edit and delete personal BMI records
- Filter BMI history by date range
- Sort and paginate BMI history records
- Display BMI category, real-time BMI preview, and analytics summary
- Profile page and password update
- Frontend and backend input validation
- User-friendly error messages for invalid requests
- Role-based access control for USER and ADMIN

## Tech Stack
- Backend: Spring Boot, Spring Security, JWT, JPA, SQLite
- Frontend: Angular (standalone components)

## Run backend
1. `cd backend`
2. `mvn spring-boot:run`

Backend runs on `http://localhost:8080`.

Default admin account:
- username: `admin`
- password: `admin123`

## Run frontend
1. `cd frontend`
2. `npm install`
3. `npm start`

Frontend runs on `http://localhost:4200`.

## Run tests

### Backend tests

From the project root:

```bash
mvn -f backend/pom.xml clean test
```

Expected result:

```text
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

### Frontend tests

From the project root:

```bash
cd frontend
npm test -- --watch=false --browsers=ChromeHeadless
```

Expected result:

```text
TOTAL: 4 SUCCESS
```

## API summary
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/bmi`
- `GET /api/bmi/history`
- `GET /api/bmi/history?from=YYYY-MM-DD&to=YYYY-MM-DD`
- `PUT /api/bmi/{id}`
- `DELETE /api/bmi/{id}`
- `GET /api/profile`
- `PATCH /api/profile/password`
- `GET /api/admin/users`
- `DELETE /api/admin/users/{id}`
- `GET /api/admin/bmi`

### API endpoint details

| Method | URL | Authorization | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive a JWT |
| POST | `/api/bmi` | USER or ADMIN | Create a BMI record |
| GET | `/api/bmi/history` | USER or ADMIN | View personal BMI history |
| GET | `/api/bmi/history?from={date}&to={date}` | USER or ADMIN | Filter BMI history by date |
| PUT | `/api/bmi/{id}` | Record owner | Update a BMI record |
| DELETE | `/api/bmi/{id}` | Record owner | Delete a BMI record |
| GET | `/api/admin/users` | ADMIN only | View all users |
| GET | `/api/profile` | USER or ADMIN | View profile information |
| PATCH | `/api/profile/password` | USER or ADMIN | Update account password |
| DELETE | `/api/admin/users/{id}` | ADMIN only | Delete a user |
| GET | `/api/admin/bmi` | ADMIN only | View all BMI records |

## Example Request and Response

### Register User

Request:

```json
{
  "username": "user1",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "jwt-token",
  "username": "user1",
  "role": "ROLE_USER"
}
```

### Create BMI Record

Authorization:

```text
Authorization: Bearer <JWT_TOKEN>
```

Request:

```json
{
  "heightCm": 170,
  "weightKg": 70
}
```

Response:

```json
{
  "id": 1,
  "username": "user1",
  "heightCm": 170,
  "weightKg": 70,
  "bmi": 24.22
}
```
