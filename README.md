# Community Hub

A brief description of the project.

## User Stories (Features)

### Authentication Module

- **Feature: Signup**
  - User should be able to signup using a valid name, email, and strong password.

- **Feature: Signin**
  - User should be able to signin using valid credentials.

### Community Module

- **Feature: View Communities**
  - User should be able to see all communities.

- **Feature: Create Community**
  - User (AUTHORISED ONLY) should be able to create a community.

### Moderation Module

- **Feature: View Community Members**
  - User should be able to see all community members.

- **Feature: Add Member**
  - User (ADMIN ONLY) should be able to add a user as a member.

- **Feature: Remove Member**
  - User (If ADMIN or MODERATOR) should be able to remove a member from the community.

## Technologies Used

- Node.js
- Express
- Mongoose - MongoDB
- JWT for authentication
- Zod for validation
- @theinternetfolks/snowflake for generating unique IDs
- Other relevant technologies

## API Endpoints

### Authentication

- **POST /v1/auth/signup**
  - Description: User signup endpoint.
  - Request Body:
    - `name`: String (minimum 2 characters, maximum 64 characters)
    - `email`: String (valid email address, maximum 128 characters)
    - `password`: String (minimum 6 characters, maximum 64 characters)

- **POST /v1/auth/signin**
  - Description: User signin endpoint.
  - Request Body:
    - `email`: String (valid email address)
    - `password`: String


### Community Module

  - **POST /v1/community**
    - Description: Create a new community.
    - Request Body:
      - `name`: String (minimum 2 characters, maximum 128 characters)
    - Authorization: Requires user authentication.

  - **GET /v1/community**
    - Description: Get all communities.

  - **GET /v1/community/:id/members**
    - Description: Get all members of a community.
    - Params:
      - `id`: String (community SLUG)

  - **GET /v1/community/me/owner**
    - Description: Get communities owned by the signed-in user.
    - Authorization: Requires user authentication.

  - **GET /v1/community/me/member**
    - Description: Get all communities joined by the signed-in user.
    - Authorization: Requires user authentication.


### Moderation

- **POST /v1/member**
  - Description: Add a member to a community.
  - Request Body:
    - `community`: String (community ID)
    - `user`: String (user ID)
    - `role`: String (role ID)

- **DELETE /v1/member/:id**
  - Description: Remove a member from a community.
  - Params:
    - `id`: String (member ID)

## Installation

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Set up your database (MongoDB ).
4. Set up environment variables (if required).
5. Run the application using `npm start`.
