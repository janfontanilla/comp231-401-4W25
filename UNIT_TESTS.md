# 🧪 Unit Tests Documentation - MyTracker

## Overview

This document describes the **5 unit tests** implemented for the MyTracker application as required by the COMP231 Software Release 1.0 assignment.

---

## 📁 Test File Location

```
__tests__/validation.test.ts
```

---

## 🚀 How to Run the Tests

### Quick Command (with detailed output)
```bash
npm test -- --verbose
```

### Expected Output
```
 PASS  __tests__/validation.test.ts
  METHOD 1: isValidEmail - Email Validation
    ✓ isValidEmail("user@example.com") should return true
    ✓ isValidEmail("test.user@domain.org") should return true
    ✓ isValidEmail("invalid") should return false
    ✓ isValidEmail("@nodomain.com") should return false
  METHOD 2: isValidPassword - Password Validation
    ✓ isValidPassword("password123") should return true
    ✓ isValidPassword("123456") should return true
    ✓ isValidPassword("12345") should return false
    ✓ isValidPassword("") should return false
  METHOD 3: isValidName - Name Validation
    ✓ isValidName("John") should return true
    ✓ isValidName("Jo") should return true
    ✓ isValidName("J") should return false
    ✓ isValidName("   ") should return false
  METHOD 4: isTokenExpired - Token Expiration Check
    ✓ isTokenExpired(pastDate) should return true for expired token
    ✓ isTokenExpired(futureDate) should return false for valid token
  METHOD 5: isAdmin - User Role Authorization
    ✓ isAdmin({id: "1", role: "admin"}) should return true
    ✓ isAdmin({id: "2", role: "user"}) should return false
    ✓ isAdmin(null) should return false
    ✓ isAdmin({id: "3", role: "guest"}) should return false

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

---

## 📋 The 5 Unit-Tested Methods

### 1. Email Validation (`isValidEmail`)

**Purpose**: Validates that email addresses follow the correct format.

**Method Logic**:
```typescript
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

**Test Cases**:
| Input | Expected Output |
|-------|-----------------|
| `user@example.com` | `true` |
| `test.user@domain.org` | `true` |
| `invalid` | `false` |
| `missing@domain` | `false` |
| `@nodomain.com` | `false` |

---

### 2. Password Validation (`isValidPassword`)

**Purpose**: Ensures passwords meet the minimum length requirement (6 characters).

**Method Logic**:
```typescript
const PASSWORD_MIN_LENGTH = 6;

const isValidPassword = (password: string): boolean => {
  return password.length >= PASSWORD_MIN_LENGTH;
};
```

**Test Cases**:
| Input | Expected Output |
|-------|-----------------|
| `password123` | `true` |
| `123456` | `true` |
| `12345` | `false` |
| `abc` | `false` |
| `` (empty) | `false` |

---

### 3. Name Validation (`isValidName`)

**Purpose**: Validates that user names meet the minimum length requirement (2 characters).

**Method Logic**:
```typescript
const NAME_MIN_LENGTH = 2;

const isValidName = (name: string): boolean => {
  return name.trim().length >= NAME_MIN_LENGTH;
};
```

**Test Cases**:
| Input | Expected Output |
|-------|-----------------|
| `John` | `true` |
| `Jo` | `true` |
| `J` | `false` |
| `` (empty) | `false` |
| `   ` (whitespace) | `false` |

---

### 4. Token Expiration Check (`isTokenExpired`)

**Purpose**: Determines if a password reset token has expired based on its expiration date.

**Method Logic**:
```typescript
const isTokenExpired = (expiresAt: Date): boolean => {
  return new Date() > expiresAt;
};
```

**Test Cases**:
| Input | Expected Output |
|-------|-----------------|
| Date 1 hour ago | `true` (expired) |
| Date 1 hour from now | `false` (valid) |

---

### 5. User Role Authorization (`isAdmin`)

**Purpose**: Checks if a user has administrator privileges.

**Method Logic**:
```typescript
interface User {
  id: string;
  role: string;
}

const isAdmin = (user: User | null): boolean => {
  return user !== null && user.role === 'admin';
};
```

**Test Cases**:
| Input | Expected Output |
|-------|-----------------|
| `{ id: '1', role: 'admin' }` | `true` |
| `{ id: '2', role: 'user' }` | `false` |
| `null` | `false` |
| `{ id: '3', role: 'guest' }` | `false` |

---

## 🛠️ Testing Framework

---

## 📊 Test Coverage Summary

| Method | Tests | Status |
|--------|-------|--------|
| METHOD 1: isValidEmail | 4 | ✅ Pass |
| METHOD 2: isValidPassword | 4 | ✅ Pass |
| METHOD 3: isValidName | 4 | ✅ Pass |
| METHOD 4: isTokenExpired | 2 | ✅ Pass |
| METHOD 5: isAdmin | 4 | ✅ Pass |
| **Total** | **18** | **✅ All Pass** |

---

## 👥 Contributing Developers

- Jan Rafael
- Ryan Massey
- Saeed Herzi
- Percy Osunde
- Kefah Abboud

---

## 📝 Notes

These unit tests verify the core validation logic used throughout the MyTracker application:

1. **Registration** uses email, password, and name validation
2. **Password Reset** uses token expiration checking
3. **Admin Features** use role authorization checking


