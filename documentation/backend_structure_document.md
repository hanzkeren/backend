# Backend Structure Document

## 1. Backend Architecture

Overall, the backend follows a **layered, modular design** built on Node.js and Express.js. Each module focuses on a single responsibility: handling HTTP requests, executing business logic, or accessing the database. This approach makes the code easy to read, test, and extend.

- Design patterns and frameworks
  - **Model-View-Controller (MVC):** Separates routing (controllers), business rules (services), and data access (repositories).  
  - **Repository Pattern:** Abstracts database operations behind interfaces, so the service layer doesn’t depend on raw SQL or ORM specifics.  
  - **Express.js:** Lightweight HTTP framework for defining routes, middleware, and error handling.

- How this supports key goals
  - **Scalability:**  
    - Stateless controllers and services allow horizontal scaling (add more instances behind a load balancer).  
    - Containerization (Docker) ensures consistent environments when scaling out.  
  - **Maintainability:**  
    - Clear folder structure (controllers, services, models) means new team members can onboard quickly.  
    - Dependency injection and well-defined interfaces make it easy to swap or mock components for testing.  
  - **Performance:**  
    - Caching frequently read data in Redis.  
    - Using connection pooling in PostgreSQL for efficient query handling.  

---

## 2. Database Management

We use a SQL database for structured data and a small key-value store for caching:

- Primary database: **PostgreSQL** (relational)  
- Cache & session store: **Redis** (in-memory key-value)

How data is handled

- **Relational storage:** Tables represent entities—users, roles, sessions, etc.  
- **Access patterns:**  
  - Read-heavy data (user profiles, permissions) are cached in Redis with a short TTL (time to live).  
  - All writes go through PostgreSQL to guarantee consistency.  
- **Best practices:**  
  - Connection pooling via `pg-pool` keeps connections reused and under control.  
  - Database migrations with a tool like `knex` or `TypeORM` to version schema changes.  
  - Regular backups and point-in-time recovery (PITR) configured on the production database.  

---

## 3. Database Schema

### Human-readable overview

- **User**: Holds authentication details and profile info.  
- **Role**: Defines user roles (e.g., Admin, User).  
- **User_Role**: Many-to-many relationship between users and roles.  
- **Session**: Tracks active JWT refresh tokens or session IDs.  

### SQL schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roles
CREATE TABLE roles (
  id SERIAL PRIMARY KEY,
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT
);

-- Junction table for many-to-many
CREATE TABLE user_roles (
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, role_id)
);

-- Sessions (for refresh token tracking)
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_token VARCHAR(500) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
``` 

---

## 4. API Design and Endpoints

We follow a **RESTful** approach with JSON payloads and standard HTTP verbs.

Key endpoints:

- **Authentication**  
  - `POST /api/auth/register` — Create a new user account.  
    - Body: `{ email, password, full_name }`  
    - Returns: `201 Created` with user ID or error.  
  - `POST /api/auth/login` — Validate credentials and issue JWT access & refresh tokens.  
    - Body: `{ email, password }`  
    - Returns: `{ accessToken, refreshToken }`  
  - `POST /api/auth/refresh` — Exchange a valid refresh token for a new access token.  

- **User Management**  
  - `GET /api/users` — List all users (Admin only).  
  - `GET /api/users/:id` — Fetch one user’s profile (self or Admin).  
  - `PUT /api/users/:id` — Update profile fields (name, etc.).  
  - `DELETE /api/users/:id` — Remove a user account (Admin or self).  

- **Roles & Permissions**  
  - `GET /api/roles` — List available roles.  
  - `POST /api/users/:id/roles` — Assign a role to a user (Admin only).  
  - `DELETE /api/users/:id/roles/:roleId` — Remove a role.  

Each endpoint returns appropriate status codes (200, 201, 400, 401, 403, 404) and consistent error objects with `{ code, message }`.

---

## 5. Hosting Solutions

We deploy in **AWS** to leverage proven reliability and global reach.

- **Compute**: AWS Elastic Container Service (ECS) on Fargate for serverless containers  
- **Storage**: Amazon RDS (PostgreSQL) with Multi-AZ for high availability  
- **Cache**: Amazon ElastiCache for Redis  

Benefits:
- **Reliability:** AWS SLA-backed services with automated failover  
- **Scalability:** Fargate auto scales tasks, RDS scales up read replicas  
- **Cost-effectiveness:** Pay-as-you-go for compute and storage  

---

## 6. Infrastructure Components

These work together to ensure fast, reliable responses to every user:

- **Load Balancer:**  Application Load Balancer (ALB) distributes traffic across container instances.  
- **Caching:** Redis handles session data and common lookups to reduce database load.  
- **CDN:** Amazon CloudFront caches static assets or API responses at edge locations.  
- **Service Discovery:** ECS Service Discovery helps containers find each other via DNS.  
- **VPC & Subnets:** Secure network isolation with public and private subnets.  

---

## 7. Security Measures

We follow industry best practices to guard user data and prevent unauthorized access:

- **Authentication & Authorization**  
  - OAuth2-style JWT tokens for stateless auth.  
  - Refresh tokens stored and revoked in the sessions table.  
  - Role-Based Access Control (RBAC) enforced in middleware.  
- **Data Encryption**  
  - TLS (HTTPS) enforced site-wide via ALB certificates.  
  - At-rest encryption enabled on RDS and ElastiCache.  
- **Input Validation & Sanitization**  
  - All incoming data passes through validation middleware (e.g., Joi).  
- **Secrets Management**  
  - Environment variables stored in AWS Secrets Manager or Parameter Store, never committed to code.  
- **Penetration Testing & Audits**  
  - Regular security scans (Snyk, AWS Inspector) and annual third-party penetration tests.  

---

## 8. Monitoring and Maintenance

To keep the system healthy and spot issues early:

- **Logging**:  
  - Structured logs via Winston, sent to Amazon CloudWatch Logs  
- **Metrics & Alerts**:  
  - Prometheus scrapes container metrics; Grafana dashboards for CPU, memory, and request latency  
  - CloudWatch Alarms notify via SNS on error rates or high resource usage  
- **Error Tracking**:  
  - Sentry captures uncaught exceptions and performance issues  
- **Maintenance**:  
  - Automated database backups nightly, with point-in-time restores  
  - Dependency updates and patching via Dependabot or Renovate  
  - Blue/green deployments in ECS ensure zero-downtime releases  

---

## 9. Conclusion and Overall Backend Summary

This backend is designed as a clear, maintainable, and scalable service that:

- Uses a **layered MVC structure** with Express.js for rapid development and easy testing.  
- Stores critical data in **PostgreSQL** with Redis caching for speed.  
- Exposes **RESTful APIs** for user management, authentication, and role assignments.  
- Leverages **AWS-managed services** (ECS, RDS, ElastiCache, CloudFront) to maximize uptime and performance.  
- Enforces **strong security** through TLS, JWT, RBAC, and secrets management.  
- Implements **comprehensive monitoring** and **automated maintenance** for reliability.

By following these components and practices, the backend meets the project’s goals of reliability, security, and user-focused performance, while remaining flexible for future features and growth.
