# Assignment: Full-Stack BMI Tracker Enhancement

## Module Context
You are provided a working starter project with:
- Backend: Spring Boot (Java)
- Frontend: Angular (TypeScript)
- Authentication: JWT
- Roles: USER and ADMIN

Your goal is to enhance the system with stronger functionality, security quality, testing, and documentation.

## Assignment Type and Duration
- Type: Individual assignment
- Duration: 1 to 2 weeks

## Learning Outcomes
By completing this assignment, students will be able to:
- Build and extend REST APIs and consume them in Angular.
- Implement and verify JWT-based security in a full-stack application.
- Apply role-based authorization rules (USER vs ADMIN).
- Implement input validation and user-friendly error handling.
- Produce tested and documented production-style code.

## Starter Features Already Available
The starter code currently includes:
- User registration and login
- JWT authentication
- BMI calculation and BMI history
- Admin dashboard basics

Students must not remove existing core behavior.

## Required Tasks

### Task A: Functional Enhancement (30 marks)
Implement at least 2 meaningful user-facing enhancements.

Possible options:
- Edit and delete BMI records
- Filter BMI history by date range
- Display BMI category trend/summary (e.g., underweight/normal/overweight)
- Add a profile page (user information and password update)
- Add pagination/sorting to large BMI history lists

### Task B: Security and Authorization (20 marks)
- Ensure protected backend endpoints require a valid JWT.
- Ensure frontend protected routes require login.
- Enforce role restrictions:
  - USER can only access their own records
  - ADMIN can access admin-only features
- Handle 401 and 403 cases clearly in both backend responses and frontend UI.

### Task C: Validation and Error Handling (15 marks)
- Add or improve backend request validation for DTOs.
- Return clear structured error messages from the API.
- Show user-friendly error feedback in Angular pages/components.

### Task D: Testing (15 marks)
- Backend: at least 3 tests (unit and/or integration).
- Frontend: at least 2 tests (component and/or service).
- All tests must pass.
- Include exact commands for running tests in README.

### Task E: Documentation (10 marks)
Update README with:
- Setup instructions
- Run commands
- Test commands
- Implemented feature list
- API endpoint summary table including:
  - Method
  - URL
  - Authorization required (Yes/No + role)
  - Example request and response

### Task F: Code Quality (10 marks)
- Follow clean code practices:
  - Meaningful naming
  - Small focused methods/components
  - Consistent formatting
- Remove dead/commented-out code where possible.

## Technical Constraints
- Keep the existing tech stack (Spring Boot + Angular).
- Keep JWT authentication architecture.
- Do not break existing working features.
- Do not hardcode secrets in source code.

## Deliverables
Submit the following:
- Source code (backend and frontend)
- Updated README
- Short report (1 to 2 pages) including:
  - What features were added
  - Security decisions
  - Validation strategy
  - Challenges and solutions

## Required Theory Questions
Answer the following questions in your report:
- Explain the purpose of `@Entity` in Spring Boot/JPA.
- In this project, identify which class should use `@Entity` and why.
- Explain the role of `@RestController` in Spring Boot.
- Describe the difference between `@Controller` and `@RestController`.
- Explain what a TypeScript class is and when to use it in Angular.
- Explain what a TypeScript interface is and when to use it.
- Compare TypeScript class vs interface with one example from this project context.

## Marking Rubric (100 marks)
- Functional enhancement quality: 30
- Security and role control correctness: 20
- Validation and error handling: 15
- Test quality and coverage: 15
- Code quality and maintainability: 10
- Documentation and demo clarity: 10

## Bonus (up to +10 marks)
Any of the following can earn bonus marks:
- Docker setup for backend and frontend
- CI pipeline for build and test
- Accessibility improvements in frontend
- Better analytics/visualization for BMI trends

## Submission Checklist
Before submitting, verify:
- Application runs without manual patching
- Required tasks are complete
- Tests pass
- README and report are complete
- Required theory questions are answered in the report

## Suggested Run Commands
Backend:
- cd backend
- mvn spring-boot:run

Frontend:
- cd frontend
- npm install
- npm start

Frontend tests:
- cd frontend
- npm test

Backend tests:
- cd backend
- mvn test
