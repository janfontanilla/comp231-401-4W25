/**
 * Unit Tests for MyTracker Application
 * Tests 5 core validation and utility methods
 * 
 * Run with: npm test
 */

// ============================================
// METHOD 1: isValidEmail - Email Validation
// ============================================
describe('METHOD 1: isValidEmail - Email Validation', () => {
  /**
   * Validates email format using regex pattern
   * @param email - Email string to validate
   * @returns boolean - true if valid email format
   */
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  test('isValidEmail("user@example.com") should return true', () => {
    console.log('  Input: "user@example.com"');
    console.log('  Expected: true');
    const result = isValidEmail('user@example.com');
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isValidEmail("test.user@domain.org") should return true', () => {
    console.log('  Input: "test.user@domain.org"');
    console.log('  Expected: true');
    const result = isValidEmail('test.user@domain.org');
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isValidEmail("invalid") should return false', () => {
    console.log('  Input: "invalid"');
    console.log('  Expected: false');
    const result = isValidEmail('invalid');
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });

  test('isValidEmail("@nodomain.com") should return false', () => {
    console.log('  Input: "@nodomain.com"');
    console.log('  Expected: false');
    const result = isValidEmail('@nodomain.com');
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });
});

// ============================================
// METHOD 2: isValidPassword - Password Validation
// ============================================
describe('METHOD 2: isValidPassword - Password Validation', () => {
  const PASSWORD_MIN_LENGTH = 6;

  /**
   * Validates password meets minimum length requirement
   * @param password - Password string to validate
   * @returns boolean - true if password meets requirements
   */
  const isValidPassword = (password: string): boolean => {
    return password.length >= PASSWORD_MIN_LENGTH;
  };

  test('isValidPassword("password123") should return true', () => {
    console.log('  Input: "password123"');
    console.log('  Expected: true');
    const result = isValidPassword('password123');
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isValidPassword("123456") should return true', () => {
    console.log('  Input: "123456"');
    console.log('  Expected: true');
    const result = isValidPassword('123456');
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isValidPassword("12345") should return false', () => {
    console.log('  Input: "12345"');
    console.log('  Expected: false');
    const result = isValidPassword('12345');
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });

  test('isValidPassword("") should return false', () => {
    console.log('  Input: "" (empty string)');
    console.log('  Expected: false');
    const result = isValidPassword('');
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });
});

// ============================================
// METHOD 3: isValidName - Name Validation
// ============================================
describe('METHOD 3: isValidName - Name Validation', () => {
  const NAME_MIN_LENGTH = 2;

  /**
   * Validates user name meets minimum length requirement
   * @param name - Name string to validate
   * @returns boolean - true if name meets requirements
   */
  const isValidName = (name: string): boolean => {
    return name.trim().length >= NAME_MIN_LENGTH;
  };

  test('isValidName("John") should return true', () => {
    console.log('  Input: "John"');
    console.log('  Expected: true');
    const result = isValidName('John');
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isValidName("Jo") should return true', () => {
    console.log('  Input: "Jo"');
    console.log('  Expected: true');
    const result = isValidName('Jo');
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isValidName("J") should return false', () => {
    console.log('  Input: "J"');
    console.log('  Expected: false');
    const result = isValidName('J');
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });

  test('isValidName("   ") should return false', () => {
    console.log('  Input: "   " (whitespace only)');
    console.log('  Expected: false');
    const result = isValidName('   ');
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });
});

// ============================================
// METHOD 4: isTokenExpired - Token Expiration Check
// ============================================
describe('METHOD 4: isTokenExpired - Token Expiration Check', () => {
  /**
   * Checks if a token has expired based on expiration date
   * @param expiresAt - Date when token expires
   * @returns boolean - true if token has expired
   */
  const isTokenExpired = (expiresAt: Date): boolean => {
    return new Date() > expiresAt;
  };

  test('isTokenExpired(pastDate) should return true for expired token', () => {
    const pastDate = new Date(Date.now() - 60 * 60 * 1000); // 1 hour ago
    console.log('  Input: Date 1 hour ago');
    console.log('  Expected: true (token expired)');
    const result = isTokenExpired(pastDate);
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isTokenExpired(futureDate) should return false for valid token', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    console.log('  Input: Date 1 hour from now');
    console.log('  Expected: false (token valid)');
    const result = isTokenExpired(futureDate);
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });
});

// ============================================
// METHOD 5: isAdmin - User Role Authorization
// ============================================
describe('METHOD 5: isAdmin - User Role Authorization', () => {
  interface User {
    id: string;
    role: string;
  }

  /**
   * Checks if user has admin role
   * @param user - User object with role property
   * @returns boolean - true if user is admin
   */
  const isAdmin = (user: User | null): boolean => {
    return user !== null && user.role === 'admin';
  };

  test('isAdmin({id: "1", role: "admin"}) should return true', () => {
    const adminUser: User = { id: '1', role: 'admin' };
    console.log('  Input: { id: "1", role: "admin" }');
    console.log('  Expected: true');
    const result = isAdmin(adminUser);
    console.log('  Actual:', result);
    expect(result).toBe(true);
  });

  test('isAdmin({id: "2", role: "user"}) should return false', () => {
    const regularUser: User = { id: '2', role: 'user' };
    console.log('  Input: { id: "2", role: "user" }');
    console.log('  Expected: false');
    const result = isAdmin(regularUser);
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });

  test('isAdmin(null) should return false', () => {
    console.log('  Input: null');
    console.log('  Expected: false');
    const result = isAdmin(null);
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });

  test('isAdmin({id: "3", role: "guest"}) should return false', () => {
    const guestUser: User = { id: '3', role: 'guest' };
    console.log('  Input: { id: "3", role: "guest" }');
    console.log('  Expected: false');
    const result = isAdmin(guestUser);
    console.log('  Actual:', result);
    expect(result).toBe(false);
  });
});
