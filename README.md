# Healthcare Scheduler API

This is the backend for a healthcare scheduling system.  
Simple, practical, and built to behave like a real appointment service.

---

## Quick Facts

- **Node.js + TypeScript** – Type-safe backend
- **Apollo GraphQL** – Flexible API with schema directives
- **Prisma (Postgres)** – Type-safe ORM with migrations
- **Redis** – Distributed locks & caching utilities
- **Pino logger** – Fast structured logging
- **Dayjs** – Date/time logic (slots, availability)
- **Zod** – Runtime validation
- **JWT auth** – Secure token-based authentication
- **Jest + Supertest** – Comprehensive E2E testing
- **Docker** – Containerized with Docker Compose

---

## Project Layout

```
brandie-backend/
├── prisma/
│   ├── schema.prisma              # Database schema & models
│   └── migrations/                # Prisma migration history
├── src/
│   ├── app.ts                     # Express + Apollo setup
│   ├── index.ts                   # Server entrypoint
│   ├── config/                    # Environment & service configs
│   │   ├── env.ts                 # Environment variables
│   │   ├── prisma.ts              # Prisma client singleton
│   │   └── redis.ts               # Redis client setup
│   ├── core/                      # Framework utilities
│   │   ├── directives/            # GraphQL custom directives
│   │   │   ├── auth.directive.ts  # @auth & @role directives
│   │   │   └── rateLimit.directive.ts
│   │   ├── errors/                # Error handling patterns
│   │   │   ├── AppError.ts        # Custom error class
│   │   │   └── PrismaHandler.ts   # Prisma error parser
│   │   ├── middleware/            # Express & Apollo middleware
│   │   │   ├── authMiddleware.ts  # JWT verification
│   │   │   └── errorHandler.ts    # Global error handler
│   │   └── utils/                 # Shared utilities
│   │       ├── jwt.ts             # Token generation/verification
│   │       ├── logger.ts          # Pino logger instance
│   │       └── password.ts        # Argon2 hashing
│   ├── modules/                   # Feature modules
│   │   ├── auth/                  # Authentication module
│   │   │   ├── graphql/
│   │   │   │   ├── auth.schema.graphql
│   │   │   │   ├── auth.schema.ts
│   │   │   │   └── auth.resolver.ts
│   │   │   ├── repository/        # Data access layer
│   │   │   ├── services/          # Business logic
│   │   │   │   ├── loginUser.ts
│   │   │   │   ├── signupUser.ts
│   │   │   │   ├── logoutUser.ts
│   │   │   │   └── refreshToken.ts
│   │   │   └── validation/        # Zod schemas
│   │   ├── post/                  # Post management module
│   │   │   ├── services/
│   │   │   │   ├── createPost.ts
│   │   │   │   ├── getMyPosts.ts
│   │   │   │   ├── getUserPosts.ts
│   │   │   │   └── getFeed.ts
│   │   │   └── [graphql, repository, validation]
│   │   ├── follow/                # Follow/Unfollow module
│   │   │   ├── services/
│   │   │   │   ├── followUser.ts
│   │   │   │   ├── unfollowUser.ts
│   │   │   │   ├── getFollowers.ts
│   │   │   │   ├── getFollowing.ts
│   │   │   │   └── isFollowing.ts
│   │   │   └── [graphql, repository, validation]
│   │   ├── like/                  # Like/Unlike module
│   │   │   ├── services/
│   │   │   │   ├── likePost.ts
│   │   │   │   ├── unlikePost.ts
│   │   │   │   ├── getPostLikes.ts
│   │   │   │   ├── getPostLikeCount.ts
│   │   │   │   └── hasLiked.ts
│   │   │   └── [graphql, repository, validation]
│   │   ├── comment/               # Comment module
│   │   │   ├── services/
│   │   │   │   ├── addComment.ts
│   │   │   │   ├── deleteComment.ts
│   │   │   │   └── getComments.ts
│   │   │   └── [graphql, repository, validation]
│   │   └── feed/                  # Home feed with ranking
│   │       ├── services/
│   │       │   └── getHomeFeed.ts
│   │       └── [graphql, repository, validation]
│   ├── schema/                    # GraphQL schema aggregator
│   │   └── index.ts               # Merges all typeDefs & resolvers
│   └── tests/                     # E2E test suites
│       ├── auth.test.ts
│       ├── post.test.ts
│       ├── follow.test.ts
│       ├── like.test.ts
│       └── feed.test.ts
├── docker-compose.yml             # Local dev stack (API, Postgres, Redis)
├── Dockerfile                     # Production container image
├── package.json                   # Dependencies & scripts
├── tsconfig.json                  # TypeScript configuration
└── jest.config.js                 # Jest test configuration
```

---

## What's Implemented

### Post Module

- Create posts with text and media URLs
- Retrieve authenticated user's posts
- Fetch posts from any user by userId
- Pagination support with limit and offset parameters

### Follow Module

- Follow and unfollow users
- List followers and following for any user
- Check if authenticated user follows another user
- Prevents users from following themselves

### Like Module

- Like and unlike posts
- List all users who liked a specific post
- Get total like count for posts
- Check if authenticated user has liked a post

### Comment Module

- Add comments to posts
- Delete comments (author only)
- Fetch comments with cursor-based pagination

### Feed Module

The home feed implements an intelligent ranking algorithm:

- Shows posts from followed users
- Ranks posts by engagement (likes and comments)
- Time decay ensures newer posts stay relevant
- Redis sorted sets for fast retrieval
- Cursor-based pagination for infinite scroll
- Real-time score updates on engagement events

### Authentication & Security

- JWT-based authentication with access and refresh tokens
- Argon2 password hashing
- Protected GraphQL resolvers via `@auth` directive
- Rate limiting via `@rateLimit` directive
- Role-based access control (NORMAL, ADMIN)

### Logging & Error Handling

- Structured JSON logging with Pino
- Custom AppError class for consistent error responses
- Prisma error transformation to user-friendly messages
- Request tracing throughout the application

### Testing

End-to-end tests using Jest and Supertest:

- Authentication flow (signup, login, token refresh, logout)
- Post operations (create, fetch, pagination)
- Follow system (follow, unfollow, lists)
- Like functionality (like, unlike, counts)
- Feed ranking and pagination

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm, npm, or yarn
- PostgreSQL 15 or higher
- Redis 7 or higher

### Local Development with Docker

1. Clone the repository

   ```bash
   git clone <repo-url>
   cd brandie-backend
   ```

2. Create a `.env` file

   ```bash
   cp .env.example .env
   ```

   Example configuration:

   ```env
   PORT=4000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/brandie"
   REDIS_URL="redis://localhost:6379"
   JWT_SECRET="your-super-secret-jwt-key"
   REFRESH_SECRET="your-super-secret-refresh-key"
   ```

3. Start services with Docker Compose

   ```bash
   docker-compose up -d
   ```

   This starts the API server on `http://localhost:4000`, PostgreSQL on `localhost:5432`, and Redis on `localhost:6379`.

4. Run database migrations

   ```bash
   pnpm install
   pnpm prisma migrate dev
   ```

5. Access the GraphQL Playground at `http://localhost:4000/graphql`

### Local Development without Docker

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start PostgreSQL and Redis

   ```bash
   # macOS with Homebrew
   brew services start postgresql@15
   brew services start redis
   ```

3. Run database migrations

   ```bash
   pnpm prisma migrate dev
   ```

4. Start the development server
   ```bash
   pnpm dev
   ```

### Running Tests

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run specific test file
pnpm test auth.test.ts
```

### Production Build

```bash
# Build TypeScript
pnpm build

# Start production server
pnpm start
```

---

## API Examples

### Authentication

Sign Up

```graphql
mutation {
  SignUpUser(
    email: "user@example.com"
    password: "securepass123"
    name: "John Doe"
  ) {
    accessToken
    refreshToken
    user {
      id
      email
      name
      role
    }
  }
}
```

Login

```graphql
mutation {
  LoginUser(email: "user@example.com", password: "securepass123") {
    accessToken
    refreshToken
    user {
      id
      email
      name
    }
  }
}
```

Refresh Token

```graphql
mutation {
  RefreshToken(refreshToken: "your-refresh-token") {
    accessToken
    refreshToken
  }
}
```

### Posts

Create Post

```graphql
mutation {
  CreatePost(
    text: "Hello World! 🌍"
    mediaUrl: "https://example.com/image.jpg"
  ) {
    post {
      id
      text
      mediaUrl
      author {
        id
        name
        email
      }
      createdAt
    }
    status
    message
  }
}
```

Get My Posts

```graphql
query {
  MyPosts(limit: 20, offset: 0) {
    id
    text
    mediaUrl
    createdAt
  }
}
```

Get User Posts

```graphql
query {
  UserPosts(userId: "user-id-here", limit: 20) {
    id
    text
    mediaUrl
    author {
      name
      email
    }
  }
}
```

### Follow System

Follow User

```graphql
mutation {
  FollowUser(userId: "user-id-to-follow") {
    status
    message
  }
}
```

Unfollow User

```graphql
mutation {
  UnfollowUser(userId: "user-id-to-unfollow") {
    status
    message
  }
}
```

Get Followers

```graphql
query {
  Followers(userId: "user-id") {
    id
    name
    email
  }
}
```

Check if Following

```graphql
query {
  IsFollowing(userId: "user-id")
}
```

### Likes

Like Post

```graphql
mutation {
  LikePost(postId: "post-id") {
    status
    message
  }
}
```

Unlike Post

```graphql
mutation {
  UnlikePost(postId: "post-id") {
    status
    message
  }
}
```

Get Like Count

```graphql
query {
  GetPostLikeCount(postId: "post-id")
}
```

Check if User Liked

```graphql
query {
  HasLiked(postId: "post-id")
}
```

### Comments

Add Comment

```graphql
mutation {
  AddComment(postId: "post-id", text: "Nice work!") {
    comment {
      id
      text
      author {
        name
      }
      createdAt
    }
    status
  }
}
```

Get Comments

```graphql
query {
  GetComments(postId: "post-id", limit: 20) {
    edges {
      id
      text
      author {
        name
        email
      }
      createdAt
    }
    nextCursor
  }
}
```

Delete Comment

```graphql
mutation {
  DeleteComment(commentId: "comment-id") {
    status
    message
  }
}
```

### Home Feed

Get Home Feed

```graphql
query {
  GetHomeFeed(limit: 10, cursor: null) {
    edges {
      id
      text
      mediaUrl
      author {
        id
        name
        email
      }
      createdAt
    }
    nextCursor
  }
}
```

Paginated Feed

```graphql
query {
  GetHomeFeed(limit: 10, cursor: "10") {
    edges {
      id
      text
    }
    nextCursor
  }
}
```

---

## Environment Variables

| Variable         | Description                      | Example                                    |
| ---------------- | -------------------------------- | ------------------------------------------ |
| `PORT`           | Server port                      | `4000`                                     |
| `NODE_ENV`       | Environment mode                 | `development` / `production`               |
| `DATABASE_URL`   | PostgreSQL connection string     | `postgresql://user:pass@localhost:5432/db` |
| `REDIS_URL`      | Redis connection string          | `redis://localhost:6379`                   |
| `JWT_SECRET`     | Secret for access tokens         | `your-secret-key`                          |
| `REFRESH_SECRET` | Secret for refresh tokens        | `your-refresh-secret`                      |
| `ALLOWED_ORIGIN` | CORS allowed origin (production) | `https://domain.com`                       |

---

## Architecture Decisions

### Modular Structure

Each feature module is self-contained with its own GraphQL schemas, resolvers, business logic services, data access repositories, and validation schemas.

### Custom Directives

The `@auth` directive protects routes and requires valid JWT authentication. The `@rateLimit` directive provides field-level rate limiting to prevent abuse.

### Error Handling

All application errors extend the custom AppError class with status codes and error codes. Prisma database errors are parsed and transformed into user-friendly messages. GraphQL errors are properly formatted with appropriate codes in production.

### Feed Ranking Algorithm

The feed ranking system uses engagement scoring where likes and comments boost post visibility. A time decay function ensures newer posts naturally rank higher. Redis sorted sets provide fast feed retrieval with O(log N) complexity. Feed scores update in real-time when users engage with posts. Cursor-based pagination enables efficient infinite scrolling without the performance issues of offset-based pagination.

### Testing Strategy

End-to-end tests use Supertest to test GraphQL endpoints directly. Tests cover complete user flows from signup through various operations. A separate test database ensures isolation between test runs.

---

## Database Schema

Key models:

- **User** – email, name, password (hashed), role (NORMAL/ADMIN)
- **Post** – text, mediaUrl, authorId, createdAt
- **Follow** – followerId, followingId (self-referential User relationship)
- **Like** – userId, postId (many-to-many with composite unique constraint)
- **Comment** – text, authorId, postId, createdAt

### Relationships

- User → Posts (one-to-many)
- User → Followers (many-to-many via Follow)
- User → Following (many-to-many via Follow)
- Post → Likes (many-to-many via Like)
- Post → Comments (one-to-many)
- User → Likes (many-to-many via Like)
- User → Comments (one-to-many)

See `prisma/schema.prisma` for full schema.

---

## Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Compile TypeScript to dist/
pnpm start            # Run production build

# Database
pnpm prisma migrate dev       # Create & apply migration
pnpm prisma migrate deploy    # Apply migrations (production)
pnpm prisma studio            # Open Prisma Studio (DB GUI)
pnpm prisma generate          # Generate Prisma Client

# Testing
pnpm test                     # Run all tests
pnpm test --watch             # Run tests in watch mode
pnpm test --coverage          # Run with coverage report

# Docker
docker compose up -d          # Start all services (local dev)
docker compose down           # Stop all services
docker compose logs -f api    # View API logs
```

---

## Deployment

**Production API**: https://brandie.mayank.engineer/graphql

Deploy directly on your server using Docker:

```bash
# Clone the repository on your server
git clone <repository-url>
cd brandie_backend

# Create .env file with your configuration
cp .env.example .env
nano .env

# Start services with Docker Compose
docker compose up -d --build

# View logs
docker compose logs -f api

# Stop services
docker compose down
```

---

## License

This project is licensed under the ISC License.
