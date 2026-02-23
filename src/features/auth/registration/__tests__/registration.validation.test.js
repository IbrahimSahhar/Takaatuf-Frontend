// filepath: src/features/auth/registration/__tests__/registration.validation.test.js
import { describe, it, expect } from "vitest";
import {
  validateFullName,
  validateEmail,
  validatePassword,
  validatePasswordConfirmation,
} from "../utils/registration.validation";

/*
  Registration Validation Suite
  Tests the core business logic for user input validation.
  Each function should return an error string if invalid, or an empty string if valid.
 */
describe("Registration Logic Validation", () => {

  /*
    Test: Full Name Validation
    Criteria: Must not be empty and should have a reasonable length.
   */
  it("should return an error for empty or too short full names", () => {
    expect(validateFullName(" ")).toBeTruthy(); // Invalid: whitespace only
    expect(validateFullName("A")).toBeTruthy(); // Invalid: too short
    expect(validateFullName("John")).toBe("");  // Valid
  });

  /*
    Test: Email Validation
    Criteria: Must follow standard email regex patterns.
   */
  it("should return an error for malformed email addresses", () => {
    expect(validateEmail("")).toBeTruthy();           // Invalid: empty
    expect(validateEmail("nope")).toBeTruthy();       // Invalid: missing @
    expect(validateEmail("name@domain.com")).toBe(""); // Valid
  });

  /*
    Test: Password Policy Validation
    Criteria: Minimum 8 characters, at least one uppercase, one number, and one special character.
   */
  it("should enforce a strong password policy (uppercase, number, special char)", () => {
    expect(validatePassword("short")).toBeTruthy();      // Invalid: too short
    expect(validatePassword("abcdefgh")).toBeTruthy();   // Invalid: weak (no diversity)
    expect(validatePassword("Abcdef1!")).toBe("");      // Valid: meets all criteria
  });

  /*
    Test: Password Confirmation Validation
    Criteria: The second password must match the first one exactly.
   */
  it("should ensure the confirmation password matches the original password", () => {
    // Invalid: empty confirmation
    expect(validatePasswordConfirmation("Abcdef1!", "")).toBeTruthy(); 
    
    // Invalid: mismatching characters
    expect(validatePasswordConfirmation("Abcdef1!", "Abcdef1?")).toBeTruthy(); 
    
    // Valid: exact match
    expect(validatePasswordConfirmation("Abcdef1!", "Abcdef1!")).toBe(""); 
  });
});