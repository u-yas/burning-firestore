#  🔥🔥🔥Burning Firestore🔥🔥🔥

## Speed up your Firestore development！！！！



Burning Firestore is a powerful TypeScript tool that automatically generates Firestore Client Code and Firebase Security Rules, and More(Planned) based on your burning typescript schemas.

## Features

| Feature | Status | Notes |
|---------|--------|-------|
| Web TypeScript | ✅ Supported | |
| Security Rules | ✅ Supported | Basic format only(nested object not working) |
| Flutter | 🚧 Planned | |
| Firestore Indexes | 🚧 Planned | |
| Validation Helper | 🚧 Planned | |

## Installation

```bash
npm install -D burning-firestore
pnpm install -D burning-firestore
```

## Usage

1. Define your typescript file

e.g. burning.ts
```typescript
import {
  Collection,
  generateFirestoreClientCode,
  generateFirestoreSecurityRules,
} from "burning-firestore";
import path from "path";

const userCollection: Collection = {
  name: "user",
  collectionName: "users",
  security: {
    read: [{ preset: "isPublic" }],
    write: [{ rule: "false" }],
    create: [{ preset: "isAuthenticated" }, { preset: "isValidData" }],
    update: [
      { rule: "request.auth.uid == documentId" },
      { preset: "isValidData" },
    ],
    delete: [{ rule: "request.auth.uid == documentId" }],
  },
  document: {
    data: {
      name: { type: "string", required: true },
      email: { type: "string", required: true },
      age: { type: "number", required: false },
      isActive: { type: "boolean", required: true },
      createdAt: { type: "timestamp", required: true },
      preferences: {
        type: "object",
        required: false,
        fields: {
          theme: { type: "string", required: false },
          notifications: { type: "boolean", required: false },
        },
      },
    },
  },
};

const postCollection: Collection = {
  name: "post",
  collectionName: "posts",
  parent: userCollection,
  security: {
    read: [{ preset: "isPublic" }],
    write: [{ rule: "false" }],
    create: [{ preset: "isAuthenticated" }, { preset: "isValidData" }],
    update: [
      { rule: "request.auth.uid == documentId" },
      { preset: "isValidData" },
    ],
    delete: [{ rule: "request.auth.uid == documentId" }],
  },
  document: {
    data: {
      title: { type: "string", required: true },
      content: { type: "string", required: true },
      publishedAt: { type: "timestamp", required: true },
      body: {
        type: "object",
        required: false,
        fields: {
          images: {
            type: "array",
            required: false,
            fields: { type: "string", required: true },
          },
          text: { type: "string", required: true },
        },
      },

      tags: {
        type: "array",
        required: false,
        fields: { type: "string", required: true },
      },
      likes: { type: "number", required: true },
      author: { type: "reference", required: true, collection: "users" },
    },
  },
};

const commentCollection: Collection = {
  name: "comment",
  collectionName: "comments",
  parent: postCollection,
  security: {
    read: [{ preset: "isPublic" }],
    write: [{ rule: "false" }],
    create: [{ preset: "isAuthenticated" }, { preset: "isValidData" }],
    update: [
      { rule: "request.auth.uid == documentId" },
      { preset: "isValidData" },
    ],
    delete: [{ rule: "request.auth.uid == documentId" }],
  },
  document: {
    data: {
      content: { type: "string", required: true },
      createdAt: { type: "timestamp", required: true },
      author: { type: "reference", required: true, collection: "users" },
      likes: { type: "number", required: true },
      isApproved: { type: "boolean", required: true },
      replies: {
        type: "array",
        required: false,
        fields: {
          type: "object",
          required: true,
          fields: {
            content: { type: "string", required: true },
            createdAt: { type: "timestamp", required: true },
            author: { type: "reference", required: true, collection: "users" },
          },
        },
      },
    },
  },
};

const allCollections = [userCollection, postCollection, commentCollection];

// node cwd
const scriptDir = process.cwd();

const generatedDir = path.join(scriptDir, "./generated");
generateFirestoreClientCode(
  {
    lang: "web-ts",
    outputDir: generatedDir,
  },
  ...allCollections
);

generateFirestoreSecurityRules(
  {
    outputDir: scriptDir,
  },
  ...allCollections
);

```

2. run 

```
npx tsx burning.ts
```

3. finished!! code, security-rules, and more is generated

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.