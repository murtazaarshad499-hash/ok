---
name: Object Storage Path Convention
description: How objectPath from presigned URL upload maps to serving URLs
---

## Rules
- `POST /api/storage/uploads/request-url` returns `{ uploadURL, objectPath }` where objectPath = `/objects/uploads/<uuid>`
- Serving route: `GET /api/storage/objects/*path` — handler prepends `/objects/` to wildcard, so URL `/api/storage/objects/uploads/uuid` looks up `/objects/uploads/uuid` in storage
- `objectPathToUrl(objectPath)` = `objectPath.replace(/^\/objects/, '/api/storage/objects')`

**Why:** The storage route uses wildcard and prepends `/objects/` internally. The full objectPath starts with `/objects/`, so stripping it and using `/api/storage/objects` prefix gives the correct serving URL.
