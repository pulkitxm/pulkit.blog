# Prisma ORM with PostgreSQL

> Prisma ORM with PostgreSQL setup in Node.js and TypeScript, covering schema, migrations, and type-safe CRUD operations for fewer runtime errors

- URL: https://pulkit.blog/prisma-with-postgresql/
- Published: August 17, 2024
- Tags: Prisma, Prisma ORM, PostgreSQL, ORM, Node.js, TypeScript, Database, Backend

Title: Setting Up Prisma ORM with PostgreSQL

Content: ORM stands for Object-Relational Mapping. It is a technique that allows developers to interact with a database using an object-oriented approach. Instead of writing raw SQL queries, you can use an ORM to work with database records as if they were regular objects in your programming language. This simplifies database operations and makes the code more maintainable.

Prisma is a modern ORM that works seamlessly with PostgreSQL, among other databases. It provides a type-safe database client, which means you get autocompletion and type-checking in your code editor, reducing the likelihood of runtime errors. Prisma also includes a powerful migration system to manage your database schema changes.

### Starting with a Fresh Node.js Project

To begin, let's set up a new Node.js project. First, initialize a new Node.js project by running the following command in your terminal:

```bash
pnpm init
```

Next, install TypeScript and the necessary type definitions:

```bash
pnpm add -D typescript @types/node
```

Create a `tsconfig.json` file to configure TypeScript:

```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

Now, let's add Prisma as a dependency:

```bash
pnpm add @prisma/client
pnpm add -D prisma
```

Initialize Prisma in your project:

```bash
npx prisma init
```

This command will create a new `prisma` directory with a `schema.prisma` file inside it. The `schema.prisma` file is where you define your database schema.

### Configuring the Database Connection

Next, let's configure the database connection in the `schema.prisma` file. Open the file and add the following user schema:

```typescript
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id    Int     @id @default(uuid())
  name  String
  email String  @unique
}
```

Ensure you have a PostgreSQL database running and set the `DATABASE_URL` environment variable in a `.env` file:

You can run a postgres instance using docker also

```bash
docker run --name some-postgres -e POSTGRES_PASSWORD=mysecretpassword -p 5432:5432 -d postgres
```

```bash
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

### Making a Database Migration

To apply this schema to the database, let's create a migration:

```bash
npx prisma migrate dev --name init
```

This command will generate the necessary SQL to create the `User` table in your database and apply the migration. You should see output indicating that the migration was successful.

### Prisma Client

**Prisma Client** is an auto-generated and type-safe query builder for your database. After defining your schema and running a migration, Prisma Client is created to help you interact with your database in a type-safe way. It allows you to perform CRUD operations and more, using a simple and intuitive API. This ensures that your database queries are validated at compile time, reducing runtime errors and improving overall developer productivity.

You can also generate the Prisma Client manually using:

```bash
npx prisma generate
```

### Database Operations Using Prisma Client

Let's start coding by creating a `/src/index.ts` file:

```typescript
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const users = await getUsers();
  console.log(users);
}

main();

async function getUsers() {
  return await prisma.user.findMany();
}
```

Create a new instance of `PrismaClient` in your code. This instance will allow you to interact with your database using the Prisma Client's type-safe API.

Let's start by defining the `getUsers()` function:

```typescript
async function getUsers() {
  return await prisma.user.findMany();
}
```

And let's call it and see it in action. Add the following scripts in `package.json`:

```json
"scripts": {
  "start": "ts-node src/index.ts" or "tsc -b && node dist/index.js"
}
```

Run `npm start` to see the result. Of course, we have not created any users yet, so we will see an empty array.

Let's add a `createUser()` function:

```typescript
async function createUser(name: string, email: string) {
  return await prisma.user.create({
    data: {
      name,
      email,
    },
  });
}
```

After running `await createUser("Alice", "alice@xyz.com");`, we see the following output:

```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@xyz.com"
}
```

We can also update user details:

```typescript
async function updateUser(id: number, name: string) {
  return await prisma.user.update({
    where: { id },
    data: { name },
  });
}
```

To delete a user, we can simply use:

```typescript
async function deleteUser(id: number) {
  return await prisma.user.delete({
    where: { id },
  });
}
```

By following these steps, you can easily set up Prisma ORM with PostgreSQL and perform various database operations in a type-safe and efficient manner. With this powerful combination, you can streamline your database interactions and boost your productivity. Happy coding! 🚀

## Related writing

- [BullMQ Cron Jobs with Redis in Node.js](https://pulkit.blog/cron-jobs-with-bullmq.md): March 29, 2026
- [AWS S3 with Node.js: Upload Files with SDK v3](https://pulkit.blog/aws-s3-with-nodejs.md): August 8, 2024
- [Branded Types in TypeScript](https://pulkit.blog/branded-types-in-typescript.md): December 26, 2025
