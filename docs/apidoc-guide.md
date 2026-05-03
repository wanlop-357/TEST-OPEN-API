# ApiDoc.io Guide

เอกสารนี้อธิบาย workflow การใช้ `apidoc.io` กับ project นี้ โดยยังคงหลักการเดิมว่า code เป็น source of truth และ `openapi.yaml` เป็น contract กลาง

## Supported Import

ตรวจจากหน้า:

```text
https://apidoc.io/add/
```

หน้า Create Project มีตัวเลือก:

- API Blueprint
- OpenAPI (Swagger)

เมื่อเลือก OpenAPI จะมี upload field ที่รับ:

- `.json`
- `.yaml`
- `.yml`

ดังนั้น project นี้สามารถใช้ `openapi.yaml` หรือ `openapi.json` ที่ generate จาก NestJS ได้โดยตรง

## Manual Publish Workflow

1. Generate OpenAPI จาก code

```bash
npm run openapi:generate
npm run openapi:validate
```

2. เตรียมไฟล์และดูขั้นตอน upload

```bash
npm run apidoc:prepare
```

3. เปิดหน้า

```text
https://apidoc.io/add/
```

4. กรอกข้อมูล project

- Project Name: `TEST Open API`
- Project ID: slug ที่จะกลายเป็น `https://<project-id>.apidoc.io`
- Description: คำอธิบาย API

5. เลือก

```text
Specification Format: OpenAPI (Swagger)
```

6. Upload

```text
openapi.yaml
```

7. Create Project หรือ update project ตาม workflow ของทีม

## Recommended Configuration

- ใช้ `openapi.yaml` เป็นไฟล์หลัก เพราะอ่านง่ายและ review diff ง่าย
- ใช้ `openapi.json` เป็น fallback สำหรับ tool ที่อ่าน YAML ไม่ได้
- ตั้ง Project ID ให้ตรงกับชื่อระบบ เช่น `test-open-api`
- ใช้ branch/release ใน Git เป็น version source แทน ถ้า apidoc.io project ไม่มี branch/version workflow

## GitHub Actions Workflow

Workflow นี้จะ generate และ validate OpenAPI แล้ว upload เป็น artifact:

```text
.github/workflows/apidoc-openapi-artifact.yml
```

ทีมสามารถ download artifact `openapi-for-apidoc` แล้ว upload เข้า `apidoc.io`

## Pre-deploy Hook

ใช้:

```bash
npm run predeploy
```

คำสั่งนี้จะ:

1. lint
2. test
3. generate OpenAPI
4. validate OpenAPI
5. check OpenAPI diff
6. prepare apidoc.io upload artifact

## Team Workflow

### Backend Developer

1. แก้ controller/DTO/service
2. รัน tests
3. Generate OpenAPI
4. Commit `openapi.yaml` และ `openapi.json`
5. เปิด PR

### Backend Lead

1. Review code behavior
2. Review `openapi.yaml`
3. Approve breaking change หรือ reject
4. Publish artifact เข้า apidoc.io หลัง merge

### Frontend/App Developer

1. เปิด docs ที่ `https://<project-id>.apidoc.io`
2. ดู endpoint/request/response schema
3. ใช้ mock หรือ client generation จากเครื่องมือภายในทีม ถ้า apidoc.io plan รองรับ

### Tester

1. เปิด docs ที่ publish แล้ว
2. ตรวจ status code และ error schema
3. เทียบกับ acceptance criteria
4. แจ้ง issue ใน PR หรือ tracker ของทีม

## Limitations ที่ต้องยืนยันกับบริษัท

จากหน้า public ที่ตรวจได้ ยืนยันได้เฉพาะ manual upload OpenAPI เท่านั้น ยังไม่พบหลักฐาน public สำหรับ:

- API token
- auto-sync endpoint
- import จาก URL
- branch compare เช่น `v1`/`v2`
- mock server
- TypeScript/Dart client generation

ถ้าบริษัทมี plan หรือ internal docs ที่รองรับฟีเจอร์เหล่านี้ ให้เพิ่ม endpoint/token เข้ามา แล้วค่อยทำ `apidoc:sync` แบบ automation ได้

## Checklist

### Backend Developer Onboarding

- [ ] รัน `npm run openapi:generate` ได้
- [ ] รัน `npm run openapi:validate` ได้
- [ ] เข้าใจว่า code เป็น source of truth
- [ ] Commit `openapi.yaml` ทุกครั้งที่ API contract เปลี่ยน

### Frontend Developer Integration

- [ ] เข้า `https://<project-id>.apidoc.io` ได้
- [ ] อ่าน request/response schema ได้
- [ ] ตรวจ breaking change จาก PR หรือ release note
- [ ] มีวิธี generate client ภายในทีม ถ้าต้องใช้

### App Developer Integration

- [ ] เข้า docs ได้
- [ ] ตรวจ DTO และ error response ได้
- [ ] Sync API contract กับ mobile release cycle
- [ ] ทดสอบ backward compatibility ก่อน release

### Tester Verification

- [ ] เห็น endpoint ครบตาม `openapi.yaml`
- [ ] ตรวจ 2xx/4xx response examples
- [ ] ตรวจ `requestId` ใน error response
- [ ] แจ้ง issue ถ้า docs กับ behavior ไม่ตรงกัน
