# Contributing

เอกสารนี้กำหนด workflow การเปลี่ยน API โดยยึดหลักว่า code เป็น source of truth และ apidoc.io เป็นพื้นที่ publish API documentation ของทีม

## API Change Workflow

1. สร้าง branch จาก `develop`
2. แก้ controller, DTO, service และ tests
3. ใส่ Swagger decorators ให้ครบทุก endpoint
4. รัน validation ในเครื่อง

```bash
npm run lint:check
npm test
npm run openapi:generate
npm run openapi:validate
npm run openapi:diff
```

5. ตรวจ `openapi.yaml` ว่าเปลี่ยนตรงกับ API change
6. เปิด PR พร้อมอธิบาย breaking change ถ้ามี
7. หลัง merge ให้ publish `openapi.yaml` เข้า apidoc.io ตาม workflow ของทีม

## Pre-flight Checklist

- [ ] ทุก endpoint มี `@ApiOperation`
- [ ] ทุก endpoint มี success response และ error response
- [ ] endpoint ที่ต้อง auth มี `@ApiBearerAuth('JWT-auth')`
- [ ] DTO ทุก field มี `@ApiProperty` หรือ `@ApiPropertyOptional`
- [ ] DTO ทุก field มี `class-validator` decorators
- [ ] Error message เป็นภาษาอังกฤษ
- [ ] Response ไม่ส่งข้อมูลลับ เช่น `passwordHash`
- [ ] Tests ผ่านครบ
- [ ] `openapi.yaml` regenerate แล้ว
- [ ] `npm run openapi:validate` ผ่าน
- [ ] `npm run openapi:diff` ผ่าน

## Pull Request Template

ใช้ template ใน `.github/pull_request_template.md`

## ApiDoc.io Publish

Prepare artifact:

```bash
npm run apidoc:prepare
```

จากนั้น upload `openapi.yaml` ที่ `https://apidoc.io/add/` และเลือก `OpenAPI (Swagger)`

Pre-deploy sync:

```bash
npm run predeploy
```

## Branch Rules

- `main`: production source สำหรับ publish docs
- `develop`: development source สำหรับ preview/review docs
- feature branches: generate OpenAPI เพื่อ review แต่ไม่ publish เป็น production docs โดยตรง

## Reviewer Notes

Reviewer ต้องดู 2 อย่างเสมอ:

- Code behavior: service/controller/tests
- API contract: `openapi.yaml` และ Swagger decorators
