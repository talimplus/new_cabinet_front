---
name: api-integration
description: MUST run before writing ANY new backend API integration (a new *.api.ts function, its interfaces, or a page that consumes an endpoint) in cabinet_front_new. Inspect the real Swagger/OpenAPI contract — query params, request body, and the ACTUAL response shape — and write interfaces from that, never from guesses. Trigger before typing an http.get/post/put/delete for an endpoint you haven't already verified this session.
---

# API integration — verify the real contract first (never guess)

Guessing a response shape is a defect. Before writing an endpoint's interfaces or
`*.api.ts` function, confirm the real request/response against the backend.

## 1. Read the OpenAPI spec for the endpoint

The dev backend serves the full OpenAPI JSON at **`${VITE_API_URL}/api-json`**
(dev = `http://localhost:3004/api-json`). Extract the operation you need:

```bash
curl -s http://localhost:3004/api-json -o /tmp/talim-openapi.json
node --input-type=module -e "
import fs from 'node:fs';
const spec = JSON.parse(fs.readFileSync('/tmp/talim-openapi.json','utf8'));
const P='/students'; const M='get';            // <-- set path + method
const op = spec.paths[P][M];
console.log('PARAMS', JSON.stringify(op.parameters,null,1));
const rb = op.requestBody?.content?.['application/json']?.schema;
console.log('BODY', JSON.stringify(resolve(rb),null,1));
const r = op.responses?.['200']||op.responses?.['201'];
console.log('RESP', JSON.stringify(resolve(r?.content?.['application/json']?.schema),null,1));
function resolve(s){ if(!s) return s; if(s['\$ref']){const n=s['\$ref'].split('/').pop(); return spec.components.schemas[n];} return s; }
"
```

- **GET** → read every **query param** (name, required, type, example). These are
  your `*Params` interface. Note which filters exist (search, status, centerId,
  pagination, month ranges, etc.).
- **POST/PUT/PATCH** → read the **request body** schema → your `*Form` interface.

## 2. Get the REAL response shape (the spec often omits it)

NestJS frequently ships **no response schema** (`responses.200` has no content).
When the spec doesn't give the shape, get it for real — do NOT invent field names:

**a) Call the live endpoint** with a token and read the JSON:
```bash
TOKEN=$(curl -s -X POST http://localhost:3004/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"claude.test.talim@gmail.com","password":"password123"}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).access_token))")
curl -s "http://localhost:3004/<endpoint>?<params>" -H "Authorization: Bearer $TOKEN" \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.stringify(JSON.parse(s),null,1)))"
```
(A test admin account exists: `claude.test.talim@gmail.com` / `password123`, with a
default center. Create the parent resource first if the endpoint needs data.)

**b) Cross-check the old project.** `/Users/nematoff/Developer/Active/Lazizbek/cabinet_front`
(read access is enabled) is the original app that consumed these endpoints — look at
how its view/store reads the response to confirm every field path and how it's
displayed. This also shows what the page is SUPPOSED to look like.

## 3. Write interfaces from the real shape, then the function

- One interface per response entity, `*Form` for bodies, `*Params` for queries,
  `*Response` for non-paginated responses (conventions.md §4).
- Model **exactly** the fields the backend returns — real names, real casing.
  Fixed value sets → **enum** with backend-exact values.
- Then write the `*.api.ts` function, typed on both ends, returning `response.data`.

## 4. Checklist before you write code
- [ ] Read the endpoint's params/body from `/api-json`.
- [ ] Confirmed the response shape from a live call **or** the old project (not guessed).
- [ ] Interfaces reflect the real field names/casing; enums for fixed sets.
- [ ] For a page: checked how the old `cabinet_front` displayed this data.
