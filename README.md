
# Therapist-Client Portal

A comprehensive web application for therapists and clients, fully migrated to a microservices architecture. This platform provides secure authentication, user management, branding customization, and integrated video sessions through a modern React frontend.

## 🎯 Project Overview

### Purpose & Scope
This project serves as a therapist-client portal that has been fully migrated from Supabase stored procedures to standalone microservices. The application enables secure communication, session management, and administrative functions while maintaining HIPAA-compliant data handling.

### Key Features
- **Authentication & Authorization**: JWT-based auth with role-based access control
- **User & Role Management**: Multi-tenant user administration with custom roles
- **Branding Customization**: Tenant-specific logos, colors, and practice branding
- **Video Sessions**: Twilio-powered telehealth sessions with recording capabilities
- **Document Management**: Secure file upload and storage for client documents
- **Session Notes**: Comprehensive note-taking with templates and OCR support
- **Client Portal**: Self-service booking, forms, and document access

## 🏗️ Architecture

### Microservices & Vite Proxy

#### Service-First Design
Each business domain is encapsulated in its own microservice with dedicated responsibilities:

- **Auth Service**: User authentication, registration, and JWT token management
- **User Service**: User profiles, role assignments, and tenant management
- **Branding Service**: Logo uploads, color themes, and practice customization
- **Configuration Service**: Application settings and feature toggles
- **Twilio Service**: Video room creation, token generation, and webhook handling
- **Email Verification Service**: Email validation and verification workflows

#### Frontend Proxy
The React/Vite client uses a development server proxy to route API requests seamlessly:

```javascript
// vite.config.ts proxy configuration
proxy: {
  '/api': {
    target: process.env.MS_API_URL || 'http://localhost:3001',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

This approach eliminates CORS issues during development and provides a clean separation between frontend and backend services.

#### Technology Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Microservices architecture with REST APIs
- **Database**: PostgreSQL with Flyway migrations
- **Authentication**: JWT tokens with role-based access control
- **Video**: Twilio Video API integration
- **Deployment**: GitHub Actions with automated migrations

## 🔧 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `MS_API_URL` | Base URL for microservices | `http://localhost:3001` | Yes |
| `NODE_ENV` | Environment mode | `development` | No |
| `JWT_SECRET` | Secret for signing/verifying tokens | - | Yes |
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | - | Yes |
| `TWILIO_API_KEY` | Twilio API key for video services | - | Yes |
| `TWILIO_API_SECRET` | Twilio API secret | - | Yes |
| `EMAIL_SERVICE_URL` | Email verification service URL | - | Yes |
| `UPLOAD_BUCKET` | File storage bucket name | - | Yes |

### Setup Instructions

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Fill in the required values in `.env`
3. Ensure all microservices are running and accessible via `MS_API_URL`

## 📚 API Documentation

### OpenAPI Specification
The complete API documentation is available in machine-readable format:

- **Swagger UI**: [https://api.yourdomain.com/docs](https://api.yourdomain.com/docs)
- **Raw OpenAPI Spec**: [docs/openapi.yaml](./docs/openapi.yaml)

You can import the OpenAPI specification into tools like Postman, Insomnia, or API documentation platforms.

### Key Endpoints

| Method | Path | Description | Service |
|--------|------|-------------|---------|
| `POST` | `/api/auth/login` | Authenticate user credentials | Auth |
| `POST` | `/api/auth/register` | Register new user account | Auth |
| `GET` | `/api/users/{userId}` | Retrieve user profile | User |
| `PUT` | `/api/users/{userId}` | Update user profile | User |
| `GET` | `/api/branding/{tenantId}` | Get tenant branding settings | Branding |
| `PUT` | `/api/branding/{tenantId}` | Update tenant branding | Branding |
| `POST` | `/api/twilio/rooms` | Create video session room | Twilio |
| `POST` | `/api/twilio/token` | Generate access token | Twilio |
| `POST` | `/api/email-verification/send` | Send verification email | Email |
| `POST` | `/api/email-verification/verify` | Verify email with token | Email |

## 🗄️ Database Management

### Migrations
Database schema changes are managed using Flyway migrations with automated GitHub Actions deployment.

#### Migration Naming Convention
All migration files follow the pattern: `V<version>__<description>.sql`

Examples:
- `V1__initial_schema.sql`
- `V2__add_user_roles.sql`
- `V3__drop_legacy_stored_procedures.sql`

#### Automated Deployment
Migrations run automatically when:
1. Changes are pushed to the `main` branch
2. Files in `db/migrations/` are modified

See [db/README.md](./db/README.md) for detailed migration instructions.

## 📋 Changelog

All notable changes to this project are documented following the [Keep a Changelog](https://keepachangelog.com/) format.

### [Unreleased]

### [1.0.0] – 2025-05-28

#### Added
- Complete microservices architecture migration
- Flyway database migration system with GitHub Actions automation
- Service modules for all business domains (`authService.ts`, `userService.ts`, etc.)
- Vite proxy configuration for seamless API routing
- Comprehensive TypeScript types for all service interfaces

#### Removed
- **BREAKING**: Dropped all legacy stored procedures in favor of microservices:
  - `sp_register`, `sp_login`, `sp_verify_email` (replaced by Auth Service)
  - `sp_upsert_user`, `sp_upsert_user_role` (replaced by User Service)
  - `sp_get_client_goals`, `sp_upsert_client_goals` (replaced by Goals Service)
  - `sp_get_configuration`, `sp_upsert_configuration` (replaced by Config Service)
  - `sp_create_tenant`, `sp_update_tenant`, `sp_get_all_tenants` (replaced by Tenant Service)
  - `sp_process_twilio_webhook`, `sp_handle_twilio_event` (replaced by Twilio Service)

#### Changed
- Frontend now uses REST API calls instead of Supabase RPC calls
- All service communication follows OpenAPI specifications
- Authentication flow migrated to JWT-based tokens
- Database access patterns updated for microservices architecture

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- Access to microservices infrastructure

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd therapist-client-portal
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork** the repository and create a feature branch
2. **Follow** the existing code style and conventions
3. **Write** tests for new functionality
4. **Update** documentation as needed
5. **Submit** a pull request with a clear description

### Development Setup
1. Ensure all microservices are running locally or accessible via `MS_API_URL`
2. Run database migrations: `flyway migrate`
3. Start the Vite development server: `npm run dev`

### Code Standards
- Use TypeScript for all new code
- Follow the existing file structure and naming conventions
- Ensure all API calls use the service layer pattern
- Write unit tests for utility functions and hooks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏥 HIPAA Compliance

This application handles Protected Health Information (PHI) and implements security measures for HIPAA compliance:

- End-to-end encryption for all data transmission
- Role-based access control with audit logging
- Secure file storage with access controls
- Regular security assessments and updates

For detailed security and compliance information, see [SECURITY.md](SECURITY.md).

---

Built with ❤️ using modern web technologies and microservices architecture.
