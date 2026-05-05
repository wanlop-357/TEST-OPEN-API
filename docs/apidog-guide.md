# Apidog Setup Guide

เอกสารนี้อธิบายวิธีเชื่อมโปรเจกต์ NestJS นี้กับ Apidog project เดิมของบริษัท

```text
https://app.apidog.com/project/1276414
```

หลักการสำคัญ:

```text
NestJS code -> openapi.yaml -> Apidog project 1276414
```

Apidog เป็นที่แสดงผล/ทดสอบ/แชร์ API contract แต่ source of truth ยังเป็น code ใน repository นี้

## Step 1: Generate OpenAPI จาก code

รัน:

```bash
npm run openapi:generate
```

ผลลัพธ์:

```text
openapi.yaml
openapi.json
```

## Step 2: Validate OpenAPI

รัน:

```bash
npm run openapi:validate
```

ควรเห็น:

```text
OpenAPI validation passed
```

## Step 3: เปิด Apidog project เดิม

เปิด:

```text
https://app.apidog.com/project/1276414
```

ถ้าต้องดู API list หลัง import ให้เข้าเมนู APIs ภายใน project นี้:

```text
https://app.apidog.com/project/1276414
```

## Step 4: เลือก branch ให้ถูก

ถ้า project มีหลาย branch ให้เลือก branch ที่ทีมใช้ก่อน import เช่น `main`, `dev`, `v1` หรือ branch production ของทีม

ถ้า project นี้เพิ่งสร้างใหม่และยังไม่มี branch เพิ่ม ให้ใช้ default branch ไปก่อน แล้วค่อยสร้าง branch strategy หลัง import สำเร็จ

## Step 5: Import OpenAPI แบบ manual

ใน Apidog:

1. เข้า Project Settings
2. เลือก Import Data
3. เลือก OpenAPI / Swagger
4. Upload `openapi.yaml`
5. Preview
6. ตั้งค่า import options
7. Confirm import

หรือใน sidebar APIs:

```text
+ -> Import -> OpenAPI / Swagger
```

## Step 6: Import Options ที่แนะนำ

ใช้ค่าประมาณนี้:

```text
Endpoint overwrite: OVERWRITE_EXISTING
Schema overwrite: OVERWRITE_EXISTING
Update folder of changed endpoint: false
Prepend base path: false
```

เหตุผล:

- `OVERWRITE_EXISTING`: ให้ Apidog ตรงกับ code ล่าสุด
- `Prepend base path: false`: เพราะ OpenAPI ของ NestJS มี path จาก global prefix อยู่แล้ว
- `Update folder`: ปิดไว้เพื่อลดการย้าย folder เองโดยไม่ตั้งใจ

## Step 7: ตรวจว่า List users เปลี่ยนแล้ว

เปิด endpoint:

```text
GET /api/v1/users
```

หรือค้นหา:

```text
List users
```

ดู section:

```text
Query Params / Parameters
Request Body
Responses
Schemas
```

ควรเห็น query ใหม่:

```text
role
```

รายละเอียด:

```text
name: role
type: string
required: false
example: admin
description: กรอง users ที่มี role นี้
```

ถ้าเพิ่งเพิ่ม field `profileImageUrl` ให้เปิด `POST /api/v1/users` แล้วดูที่ `Request Body` ว่ามี field นี้หรือไม่

## Step 8: Setup API Token สำหรับ Auto Sync

ต้องให้ admin หรือ backend lead สร้าง token ใน Apidog:

1. เข้า Account Settings หรือ Organization/Project Settings
2. ไปที่ API Access Token
3. Create token
4. Copy token เก็บใน secret manager

ห้าม commit token ลง git

## Step 9: ตั้งค่า local `.env`

เพิ่มค่าเหล่านี้ใน `.env`:

```env
APIDOG_PROJECT_ID=1276414
APIDOG_API_TOKEN=your_apidog_token
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml
APIDOG_LOCALE=en-US
APIDOG_API_VERSION=2024-03-28
APIDOG_ENDPOINT_FOLDER_ID=0
APIDOG_SCHEMA_FOLDER_ID=0
APIDOG_ENDPOINT_OVERWRITE_BEHAVIOR=OVERWRITE_EXISTING
APIDOG_SCHEMA_OVERWRITE_BEHAVIOR=OVERWRITE_EXISTING
APIDOG_UPDATE_FOLDER_OF_CHANGED_ENDPOINT=false
APIDOG_PREPEND_BASE_PATH=false
```

`APIDOG_OPENAPI_URL` ต้องเป็น direct raw URL ที่ Apidog server เข้าถึงได้

ตัวอย่าง GitHub raw URL:

```text
https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml
```

## Step 10: Manual sync ผ่าน CLI

ตรวจ config ก่อน:

```bash
npm run apidog:check
```

รัน:

```bash
npm run apidog:sync
```

คำสั่งนี้จะ:

1. Generate `openapi.yaml`
2. Call Apidog import API
3. Update project `1276414`

## Step 11: GitHub Actions Setup

ใน GitHub repository:

```text
Settings -> Secrets and variables -> Actions
```

เพิ่ม secrets:

```text
APIDOG_PROJECT_ID=1276414
APIDOG_API_TOKEN=your_apidog_token
```

ไม่ต้องเพิ่ม `APIDOG_OPENAPI_URL` สำหรับ GitHub Actions เพราะ workflow จะสร้าง raw URL จาก branch ที่เลือกให้อัตโนมัติ เช่นเลือก `dev` จะใช้ `https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml`

workflow อยู่ที่:

```text
.github/workflows/apidog-sync.yml
```

เมื่อ push เข้า `main` หรือ `dev` แล้ว workflow จะทำงานอัตโนมัติ:

```text
push -> npm ci -> generate OpenAPI -> validate -> diff -> sync Apidog
```

ข้อสำคัญ:

- ต้อง commit `openapi.yaml` และ `openapi.json` ไปพร้อม API change
- `APIDOG_OPENAPI_URL` ควรชี้ไปที่ raw URL ของ branch ที่ workflow ใช้
- ถ้าใช้ `main`: URL ควรเป็น raw URL ของ `main`
- ถ้าใช้ `dev`: URL ควรเป็น raw URL ของ `dev`

## Step 12: Pre-deploy Hook

ก่อน deploy production:

```bash
npm run predeploy
```

คำสั่งนี้จะ:

1. lint
2. test
3. generate OpenAPI
4. validate OpenAPI
5. check OpenAPI diff
6. sync เข้า Apidog

## Troubleshooting

### ไม่เห็น field ใหม่ใน Apidog

เช็ค:

1. Upload `openapi.yaml` ล่าสุดหรือยัง
2. เลือก branch ใน Apidog ถูกไหม
3. import ไป project `1276414` ถูกไหม
4. refresh browser หรือเปิด incognito
5. ค้นหา endpoint `List users`
6. ดู Query Params ว่ามี `role` หรือไม่

## Demo Test Cases: Users API

ใช้กับ Users API ทั้งชุด:

```text
POST /users
POST /users/bulk
GET /users
GET /users/{id}
PATCH /users/{id}
DELETE /users/{id}
```

โดยเลือก Environment ที่มี Base URL:

```text
http://localhost:3000/api/v1
```

ตัวอย่าง final URL:

```text
http://localhost:3000/api/v1/users
```

Headers กลางสำหรับ request ที่มี body:

```text
Content-Type: application/json
x-request-id: apidog-users-demo-001
```

หมายเหตุ:

- endpoint path ใน Apidog ให้ใช้ `/users` เพราะ Base URL มี `/api/v1` แล้ว
- email ต้องไม่ซ้ำ ถ้ายิงซ้ำจะได้ `409 Conflict`
- ข้อมูล users ตอนนี้เก็บใน memory ถ้า restart server ข้อมูลจะหาย
- หลัง create success ให้เก็บ `data.id` ไว้เป็นตัวแปร Apidog ชื่อ `userId` เพื่อใช้กับ get/update/delete

### Case 1: Create user success

Method:

```text
POST /users
```

Expected status:

```text
201 Created
```

Body:

```json
{
  "user_email": "demo.user.001@example.com",
  "user_password": "password123",
  "fullName": "Demo User 001",
  "profileImageUrl": "https://cdn.example.com/users/demo-user-001.png",
  "roles": ["user"]
}
```

Expected response:

```json
{
  "success": true,
  "requestId": "apidog-users-demo-001",
  "data": {
    "id": "uuid",
    "user_email": "demo.user.001@example.com",
    "fullName": "Demo User 001",
    "profileImageUrl": "https://cdn.example.com/users/demo-user-001.png",
    "roles": ["user"],
    "createdAt": "iso-date",
    "updatedAt": "iso-date"
  },
  "timestamp": "iso-date"
}
```

Apidog post processor:

```text
ตั้ง environment variable userId = response.data.id
```

### Case 2: Create admin user success

```text
POST /users
```

Expected status:

```text
201 Created
```

Body:

```json
{
  "user_email": "demo.admin.001@example.com",
  "user_password": "admin1234",
  "fullName": "Demo Admin 001",
  "profileImageUrl": "https://cdn.example.com/users/demo-admin-001.png",
  "roles": ["admin"]
}
```

### Case 3: Create user without optional fields

```text
POST /users
```

Expected status:

```text
201 Created
```

Body:

```json
{
  "user_email": "demo.minimal.001@example.com",
  "user_password": "password123",
  "fullName": "Demo Minimal"
}
```

Expected behavior:

```text
roles จะ default เป็น ["user"]
profileImageUrl จะเป็น null
```

### Case 4: Duplicate email

```text
POST /users
```

วิธีทดสอบ:

1. ยิง Case 1 ให้สำเร็จก่อน
2. ยิง Body เดิมซ้ำอีกครั้ง

Expected status:

```text
409 Conflict
```

Body:

```json
{
  "user_email": "demo.user.001@example.com",
  "user_password": "password123",
  "fullName": "Demo User 001",
  "profileImageUrl": "https://cdn.example.com/users/demo-user-001.png",
  "roles": ["user"]
}
```

Expected response:

```json
{
  "success": false,
  "requestId": "request-id",
  "statusCode": 409,
  "error": "Conflict",
  "message": "Email already exists",
  "path": "/api/v1/users",
  "timestamp": "iso-date"
}
```

### Case 5: Invalid email format

```text
POST /users
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "user_email": "demo-user-invalid-email",
  "user_password": "password123",
  "fullName": "Demo Invalid Email"
}
```

Expected message:

```text
Invalid email format
```

### Case 6: Password too short

```text
POST /users
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "user_email": "demo.short.password@example.com",
  "user_password": "pass1",
  "fullName": "Demo Short Password"
}
```

Expected message:

```text
Password must be at least 8 characters
```

### Case 7: Password has no number

```text
POST /users
```

Expected status:

```text
422 Unprocessable Entity
```

Body:

```json
{
  "user_email": "demo.password.no.number@example.com",
  "user_password": "passwordonly",
  "fullName": "Demo Password No Number"
}
```

Expected message:

```text
Password must contain at least one number
```

### Case 8: Invalid profile image URL

```text
POST /users
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "user_email": "demo.invalid.profile@example.com",
  "user_password": "password123",
  "fullName": "Demo Invalid Profile",
  "profileImageUrl": "cdn.example.com/users/demo.png",
  "roles": ["user"]
}
```

Expected message:

```text
Profile image URL must be a valid URL
```

### Case 9: Unknown field is rejected

```text
POST /users
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "user_email": "demo.unknown.field@example.com",
  "user_password": "password123",
  "fullName": "Demo Unknown Field",
  "nickname": "Demo"
}
```

Expected behavior:

```text
ระบบ reject field ที่ไม่มีใน DTO เพราะเปิด whitelist และ forbidNonWhitelisted
```

### Case 10: Missing required field

```text
POST /users
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "user_email": "demo.missing.password@example.com",
  "fullName": "Demo Missing Password"
}
```

Expected behavior:

```text
ระบบ reject เพราะไม่มี user_password
```

### Case 11: Roles exceed max size

```text
POST /users
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "user_email": "demo.roles.max@example.com",
  "user_password": "password123",
  "fullName": "Demo Roles Max",
  "roles": ["r1", "r2", "r3", "r4", "r5", "r6", "r7", "r8", "r9", "r10", "r11"]
}
```

Expected message:

```text
Roles must not exceed 10 items
```

### Case 12: Bulk create users success

```text
POST /users/bulk
```

Expected status:

```text
201 Created
```

Body:

```json
{
  "users": [
    {
      "user_email": "demo.bulk.001@example.com",
      "user_password": "password123",
      "fullName": "Demo Bulk 001",
      "roles": ["user"]
    },
    {
      "user_email": "demo.bulk.002@example.com",
      "user_password": "password123",
      "fullName": "Demo Bulk 002",
      "roles": ["admin"]
    }
  ]
}
```

Expected behavior:

```text
response.data เป็น array ของ users ที่สร้างสำเร็จ 2 รายการ
```

### Case 13: Bulk create duplicated email in payload

```text
POST /users/bulk
```

Expected status:

```text
422 Unprocessable Entity
```

Body:

```json
{
  "users": [
    {
      "user_email": "demo.bulk.duplicate@example.com",
      "user_password": "password123",
      "fullName": "Demo Bulk Duplicate A"
    },
    {
      "user_email": "demo.bulk.duplicate@example.com",
      "user_password": "password123",
      "fullName": "Demo Bulk Duplicate B"
    }
  ]
}
```

Expected message:

```text
Bulk payload contains duplicated email
```

### Case 14: Bulk create empty users array

```text
POST /users/bulk
```

Expected status:

```text
400 Bad Request
```

Body:

```json
{
  "users": []
}
```

Expected message:

```text
Users must contain at least 1 item
```

### Case 15: List users default pagination

```text
GET /users
```

Expected status:

```text
200 OK
```

Expected response shape:

```json
{
  "success": true,
  "requestId": "request-id",
  "data": {
    "items": [],
    "meta": {
      "page": 1,
      "limit": 20,
      "total": 0,
      "totalPages": 0
    }
  },
  "timestamp": "iso-date"
}
```

### Case 16: List users with pagination and sort

```text
GET /users?page=1&limit=10&sort=createdAt&order=desc
```

Expected status:

```text
200 OK
```

Expected behavior:

```text
response.data.meta.page เป็น 1 และ response.data.meta.limit เป็น 10
```

### Case 17: List users with search

```text
GET /users?search=Demo
```

Expected status:

```text
200 OK
```

Expected behavior:

```text
response.data.items มีเฉพาะรายการที่ user_email หรือ fullName มีคำว่า Demo
```

### Case 18: List users with user_email filter

```text
GET /users?user_email=demo.user.001@example.com
```

Expected status:

```text
200 OK
```

Expected behavior:

```text
ถ้ามี user email นี้อยู่ response.data.items ควรมี 1 รายการ
```

### Case 19: List users with role filter

```text
GET /users?role=admin
```

Expected status:

```text
200 OK
```

Expected behavior:

```text
response.data.items มีเฉพาะ users ที่ roles มี admin
```

### Case 20: List users invalid pagination

```text
GET /users?page=0&limit=101
```

Expected status:

```text
400 Bad Request
```

Expected behavior:

```text
page ต้องมากกว่าหรือเท่ากับ 1 และ limit ต้องไม่เกิน 100
```

### Case 21: List users invalid sort field

```text
GET /users?sort=passwordHash
```

Expected status:

```text
400 Bad Request
```

Expected behavior:

```text
sort ต้องเป็น createdAt, updatedAt, user_email หรือ fullName เท่านั้น
```

### Case 22: Get user by id success

```text
GET /users/{{userId}}
```

Expected status:

```text
200 OK
```

Expected behavior:

```text
ใช้ userId จาก Case 1 และ response.data.id ต้องตรงกับ userId
```

### Case 23: Get user by id not found

```text
GET /users/00000000-0000-4000-8000-000000000000
```

Expected status:

```text
404 Not Found
```

Expected message:

```text
User not found
```

### Case 24: Update user success

```text
PATCH /users/{{userId}}
```

Expected status:

```text
200 OK
```

Body:

```json
{
  "fullName": "Demo User 001 Updated",
  "profileImageUrl": "https://cdn.example.com/users/demo-user-001-updated.png",
  "roles": ["user", "editor"]
}
```

Expected behavior:

```text
response.data.fullName, profileImageUrl และ roles เปลี่ยนตาม body
```

### Case 25: Update user email success

```text
PATCH /users/{{userId}}
```

Expected status:

```text
200 OK
```

Body:

```json
{
  "user_email": "demo.user.001.updated@example.com"
}
```

Expected behavior:

```text
response.data.user_email เปลี่ยนเป็น email ใหม่
```

### Case 26: Update user duplicate email

```text
PATCH /users/{{userId}}
```

Expected status:

```text
409 Conflict
```

Body:

```json
{
  "user_email": "demo.admin.001@example.com"
}
```

Expected message:

```text
Email already exists
```

### Case 27: Update user password without number

```text
PATCH /users/{{userId}}
```

Expected status:

```text
422 Unprocessable Entity
```

Body:

```json
{
  "user_password": "passwordonly"
}
```

Expected message:

```text
Password must contain at least one number
```

### Case 28: Update user not found

```text
PATCH /users/00000000-0000-4000-8000-000000000000
```

Expected status:

```text
404 Not Found
```

Body:

```json
{
  "fullName": "Not Found User"
}
```

Expected message:

```text
User not found
```

### Case 29: Soft delete user success

```text
DELETE /users/{{userId}}
```

Expected status:

```text
204 No Content
```

Expected behavior:

```text
ไม่มี response body
```

### Case 30: Get deleted user should not found

```text
GET /users/{{userId}}
```

Expected status:

```text
404 Not Found
```

Expected message:

```text
User not found
```

### Case 31: List users include deleted

```text
GET /users?includeDeleted=true
```

Expected status:

```text
200 OK
```

Expected behavior:

```text
รายการที่ soft delete แล้วจะกลับมาใน response.data.items
```

### Case 32: Delete user not found

```text
DELETE /users/00000000-0000-4000-8000-000000000000
```

Expected status:

```text
404 Not Found
```

Expected message:

```text
User not found
```

### Case 33: Wrong path should return 404

```text
GET /api/v1/users แบบผิด Environment หรือ GET /users เมื่อ Base URL ไม่มี /api/v1
```

Expected status:

```text
404 Not Found
```

Expected behavior:

```text
ถ้า path เป็น /users โดยไม่มี /api/v1 แปลว่า Apidog Environment ยังตั้ง Base URL ผิด
```

### `APIDOG_API_TOKEN is required`

แปลว่ายังไม่ได้ตั้ง token ใน `.env` หรือ shell:

```env
APIDOG_API_TOKEN=your_apidog_token
```

### `APIDOG_OPENAPI_URL is required`

แปลว่ายังไม่ได้ตั้ง raw URL ของ OpenAPI file:

```env
APIDOG_OPENAPI_URL=https://raw.githubusercontent.com/wanlop-357/TEST-OPEN-API/dev/openapi.yaml
```

### Auto sync ไม่ผ่าน

เช็ค:

1. token ถูกไหม
2. token มีสิทธิ์ project `1276414` ไหม
3. `APIDOG_OPENAPI_URL` เป็น raw file URL หรือไม่
4. URL เปิดจาก internet ได้ไหม

## Checklist

### Backend Developer

- [ ] รัน `npm run openapi:generate`
- [ ] รัน `npm run openapi:validate`
- [ ] เห็น `openapi.yaml` เปลี่ยนตาม API
- [ ] Import เข้า Apidog branch ที่ถูกต้อง

### Backend Lead

- [ ] ตรวจ OpenAPI diff
- [ ] ตรวจ breaking changes
- [ ] Approve sync เข้า production branch

### Frontend/App

- [ ] เปิด Apidog project `1276414`
- [ ] ดู endpoint และ schema ล่าสุด
- [ ] ตรวจ query/body/response ที่เปลี่ยน

### Tester

- [ ] เปิด endpoint ใน Apidog
- [ ] ตรวจ examples
- [ ] ทดสอบ status code
- [ ] แจ้ง issue ถ้า docs กับ behavior ไม่ตรงกัน
