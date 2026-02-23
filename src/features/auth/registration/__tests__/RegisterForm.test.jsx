// filepath: src/features/auth/registration/__tests__/RegisterForm.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RegisterForm from "../components/RegisterForm";

/*
  RegisterForm Testing Suite
  Focuses on verifying UI rendering, validation feedback, and interaction states.
 */
describe("RegisterForm Component", () => {
  // Common initial state for testing empty forms
  const defaultValues = {
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  /*
    Test 1: Accessibility & Structure
    Ensures all required inputs are present and linked to their labels properly.
   */
  it("renders all input fields correctly with accessible labels", () => {
    render(
      <RegisterForm
        values={defaultValues}
        errors={{}}
        isBusy={false}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  /*
    Test 2: Validation UI
    Checks if the component correctly displays error messages passed from the logic hook.
   */
  it("displays inline validation errors when provided by the logic hook", () => {
    const mockErrors = {
      fullName: "Full Name is required.",
      email: "Invalid email format.",
    };

    render(
      <RegisterForm
        values={defaultValues}
        errors={mockErrors}
        isBusy={false}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );

    expect(screen.getByText(mockErrors.fullName)).toBeInTheDocument();
    expect(screen.getByText(mockErrors.email)).toBeInTheDocument();
  });

  /*
    Test 3: Submission Protection
    Ensures the button is disabled during API calls to prevent duplicate submissions.
   */
  it("disables the submit button and enters loading state when isBusy is true", () => {
    render(
      <RegisterForm
        values={defaultValues}
        errors={{}}
        isBusy={true}
        onChange={() => {}}
        onSubmit={() => {}}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /register/i });
    expect(submitBtn).toBeDisabled();
    
    // Checks if the 'Creating Account...' text (or spinner) appears during loading
    expect(screen.getByText(/creating account/i)).toBeInTheDocument();
  });

  /*
    Test 4: Form Interaction
    Verifies that the submit function is triggered correctly when the user clicks 'Register'.
   */
  it("triggers the onSubmit handler exactly once when the form is submitted", async () => {
    const onSubmitMock = vi.fn((e) => e.preventDefault());
    
    render(
      <RegisterForm
        values={{
          fullName: "John Doe",
          email: "john@example.com",
          password: "Password123!",
          confirmPassword: "Password123!",
        }}
        errors={{}}
        isBusy={false}
        onChange={() => {}}
        onSubmit={onSubmitMock}
      />
    );

    const submitBtn = screen.getByRole("button", { name: /register/i });
    fireEvent.click(submitBtn);

    expect(onSubmitMock).toHaveBeenCalledTimes(1);
  });
});
