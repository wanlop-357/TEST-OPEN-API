# API Conventions

## Naming Convention

- Resource names use plural nouns: `users`, `orders`, `payments`
- Path params use `camelCase`: `/users/:userId`
- Query params use `camelCase`: `includeDeleted`, `createdFrom`
- DTO names follow action + resource: `CreateUserDto`, `UpdateUserDto`, `UserResponseDto`
- Response DTOs never expose secrets such as password hashes, tokens, or internal keys

## Versioning Strategy

Current API prefix:

```text
/api/v1
```

Rules:

- `v1` is production stable
- `v2` is development/next major contract
- Non-breaking changes can stay in the same version
- Breaking changes require a new version or explicit deprecation window

## Breaking Change Policy

Breaking changes include:

- Removing endpoint, field, enum value, or response status
- Renaming request/response fields
- Changing field type or validation rule in an incompatible way
- Changing auth requirement
- Changing pagination or error response format

Before merging a breaking change:

- [ ] Add migration note
- [ ] Update API documentation and release notes
- [ ] Notify frontend, app, tester, and backend lead
- [ ] Keep old field/endpoint during deprecation period when possible

## Deprecation Process

1. Add `deprecated: true` in Swagger decorator where applicable
2. Add replacement endpoint or field in docs
3. Announce deprecation date
4. Keep compatibility for at least one release cycle
5. Remove only after consumers confirm migration

## Error Response

All errors follow `ErrorResponseDto`:

```json
{
  "success": false,
  "requestId": "request-id",
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/v1/users",
  "timestamp": "2026-05-03T10:30:00.000Z"
}
```

## Pagination

Use:

- `page`: starts from `1`
- `limit`: default `20`, max `100`
- `sort`: whitelisted field only
- `order`: `asc` or `desc`

## Authentication

Protected endpoints must use:

```typescript
@ApiBearerAuth('JWT-auth')
```

Public endpoints must use:

```typescript
@Public()
```
