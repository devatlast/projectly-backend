Projectly Backend API

Projectly is a project and task management application built with NestJS, MongoDB, and Redis. It provides a REST API for user authentication, project management, and task management.
The backend includes email verification, caching, and Docker support.

Features
* User Authentication
    * User registration and login
    * Email verification
    * Email-based verification links
    * Secure authentication and logout
* User Management
    * Retrieve user information
    * Update user profile
    * Change email with verification
    * Delete user account
* Project Management
    * Create and manage projects
    * Retrieve projects belonging to a user
    * Update project information
    * Delete projects
* Task Management
    * Create and manage tasks
    * Retrieve tasks associated with projects
    * Update task information
    * Delete tasks
* Security
    * Request validation using DTOs
    * Environment-based configuration
    * Authentication and protected routes
    * Rate limiting
* Performance
    * Redis integration
    * Caching support
* Deployment
    * Docker containerization
    * MongoDB Atlas compatibility
    * Redis Cloud compatibility
    * Deployment-ready configuration for platforms such as Render

Tech Stack

Technology	Purpose
NestJS	Backend framework
TypeScript	Programming language
MongoDB	Database
Mongoose	MongoDB object modeling
Redis	Caching and rate limiting
Resend	Email delivery
Passport	Authentication strategies
Docker	Containerization
Node.js	JavaScript runtime
npm	Package management

Prerequisites

Before running the application, ensure you have the following installed or configured:

* Node.js
* npm
* MongoDB database or MongoDB Atlas account
* Redis instance or Redis Cloud account
* Resend account and API key
* Docker, if running the application in a container

Getting Started

1. Clone the Repository

git clone (https://github.com/devatlast/projectly-backend)

Navigate into the backend project directory:

cd task-api

2. Install Dependencies

npm install

3. Configure Environment Variables

Create a .env file in the project root:
touch .env
Add the environment variables required by your application:

# Application
PORT=3000
NODE_ENV=development
# MongoDB
MONGODB_URI=your_mongodb_connection_string
# Redis
REDIS_HOST=your_redis_host
REDIS_PORT=your_redis_port
REDIS_USERNAME=your_redis_username
REDIS_PASSWORD=your_redis_password
# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=your_verified_sender
FRONTEND_URL=http://localhost:3002
# Application Secret
APP_KEY=your_application_secret

Important: These are example values. Replace them with the actual values required by your configuration. Your application may use additional environment variables, so check your configuration files and source code.

Never commit your .env file or expose your database credentials, API keys, OAuth secrets, or application secrets publicly.

4. Run the Application

Start the development server:

npm run start:dev

To build the application:
npm run build

To run the production build:
npm run start:prod

The API will be available at the configured port. By default, this may be:
http://localhost:3000

Check your application’s route definitions for the available API endpoints.

Docker

Projectly’s backend can be run inside a Docker container.

Build the Docker Image

From the directory containing the Dockerfile, run:

docker build -t projectly-backend .

Run the Container

If your .env file contains the required environment variables, run:

docker run --rm \
  --env-file .env \
  -e PORT=3000 \
  -p 3000:3000 \
  --name projectly-backend \
  projectly-backend

This passes the environment variables into the running container without copying the .env file into the image.

The port mapping assumes the application listens on port 3000. Adjust it if your configuration uses another port.

Stop the Container

Press Ctrl + C in the terminal running the container.

Database and Caching

MongoDB

MongoDB stores application data, including users, projects, and tasks. The application connects using the MongoDB connection string configured through MONGODB_URI.
For deployment, a managed MongoDB service such as MongoDB Atlas can provide a remotely accessible database.

Redis

Redis supports caching and other performance-related features configured in the application.
The backend can connect to a managed Redis service, such as Redis Cloud, using the appropriate environment variables. Ensure the Redis connection settings match your provider’s requirements, including TLS when required.

Email Verification

Projectly uses Resend for email delivery.
The email service sends verification messages containing links that direct users to the frontend. The frontend and backend must be configured with the correct URLs for the verification flow to work properly.

Configure RESEND_API_KEY, EMAIL_FROM, and FRONTEND_URL appropriately for your environment.


Deployment

The backend can be containerized with Docker and deployed to a service that supports Docker deployments, such as Render.

General deployment steps:

1. Push the backend repository to GitHub.
2. Create a new web service on your hosting platform.
3. Connect the GitHub repository.
4. Select Docker as the deployment runtime, if prompted.
5. Configure the required environment variables in the hosting dashboard.
6. Deploy the application.
7. Test the deployed API and authentication flows.

For production, update the frontend URL, GitHub OAuth callback URL, email configuration, and other environment-specific settings.

Do not upload your .env file to GitHub or bake production secrets into your Docker image.

Project Structure

The project follows NestJS conventions. Your exact structure may vary, but the main components generally include:

task-api/
├── src/
│   ├── auth/
│   ├── users/
│   ├── projects/
│   ├── tasks/
│   ├── email/
│   ├── app.module.ts
│   └── main.ts
├── test/
├── Dockerfile
├── .dockerignore
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md

Available Scripts

Command	Description
npm install	Install dependencies
npm run start	Start the application
npm run start:dev	Start in development mode
npm run build	Compile the application
npm run start:prod	Run the compiled application
npm run test	Run unit tests
npm run test:e2e	Run end-to-end tests
npm run test:cov	Generate test coverage

Check package.json for the scripts actually available in your project.

Security Notes

* Keep .env out of version control.
* Never publish database credentials, API keys, or OAuth secrets.
* Use strong application secrets.
* Configure production URLs separately from local development URLs.
* Restrict database access to trusted connections.
* Use HTTPS for production traffic.
* Verify that protected endpoints require the appropriate authentication.

License
Rotimi Olawale