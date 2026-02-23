// filepath: src/features/payments/pages/PaymentPage.jsx
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * PaymentPage (Bootstrap)
 * - Amount (USD)
 * - Fee (read-only)
 *   - System fee fixed at $5.00
 *   - Payment fee = 3% of (amount + system fee) + $0.49
 * - Total (read-only)
 * - "Debit or Credit Card" button opens modal
 * - Modal validations + close (X/Escape) + focus restore
 * - Mock submit with success/fail + reference id
 *
 * Notes:
 * - PayPal gateway integration is NOT implemented here (UI only).
 * - Turnstile captcha is a UI placeholder here.
 */

// ===== Config (single place) =====
const USD = "USD";
const SYSTEM_FEE = 5.0;
const PAYMENT_FEE_RATE = 0.03; // 3%
const PAYMENT_FEE_FIXED = 0.49;

const MOBILE_REQUIRED = false; // configurable

const formatUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: USD }).format(
    Number.isFinite(n) ? n : 0
  );

function isValidMoney(val) {
  const s = String(val ?? "").trim();
  if (!s) return false;
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return false;
  const n = Number(s);
  return Number.isFinite(n) && n > 0;
}

function parseMoney(val) {
  const n = Number(String(val ?? "").trim());
  return Number.isFinite(n) ? n : NaN;
}

function calcFees(amount) {
  // If amount invalid => fees 0.00
  if (!Number.isFinite(amount) || amount <= 0) {
    return { systemFee: 0, paymentFee: 0, total: 0 };
  }
  const systemFee = SYSTEM_FEE;
  const paymentFeeRaw = PAYMENT_FEE_RATE * (amount + systemFee) + PAYMENT_FEE_FIXED;

  // display 2 decimals
  const paymentFee = Math.round(paymentFeeRaw * 100) / 100;
  const total = Math.round((amount + systemFee + paymentFee) * 100) / 100;

  return { systemFee, paymentFee, total };
}

function validateEmail(email) {
  const s = String(email || "").trim();
  if (!s) return "Email is required.";
  // simple email check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return "Please enter a valid email.";
  return null;
}

function validateCardNumber(card) {
  const s = String(card || "").replace(/\s+/g, "");
  if (!s) return "Card number is required.";
  if (!/^\d{12,19}$/.test(s)) return "Please enter a valid card number.";
  return null;
}

function validateExpiry(exp) {
  const s = String(exp || "").trim();
  if (!s) return "Expiration date is required.";
  // Accept MM/YY or MM/YYYY
  const m = s.match(/^(\d{2})\s*\/\s*(\d{2}|\d{4})$/);
  if (!m) return "Use MM/YY format.";
  const mm = Number(m[1]);
  let yy = Number(m[2]);
  if (!Number.isFinite(mm) || mm < 1 || mm > 12) return "Invalid month.";
  if (!Number.isFinite(yy)) return "Invalid year.";
  if (m[2].length === 2) yy += 2000;

  // Not expired check (rough, end of month)
  const now = new Date();
  const expDate = new Date(yy, mm, 0, 23, 59, 59); // last day of month
  if (expDate < now) return "Card is expired.";
  return null;
}

function validateCVC(cvc) {
  const s = String(cvc || "").trim();
  if (!s) return "CVC/CSC is required.";
  if (!/^\d{3,4}$/.test(s)) return "Please enter a valid CVC/CSC.";
  return null;
}

function validateRequiredText(val, label) {
  const s = String(val || "").trim();
  if (!s) return `${label} is required.`;
  return null;
}

function validateZip(zip) {
  const s = String(zip || "").trim();
  if (!s) return "ZIP/postal code is required.";
  // simple: allow alnum+space/hyphen, 3-10
  if (!/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(s)) return "Please enter a valid ZIP/postal code.";
  return null;
}

function validateMobile(mobile) {
  const s = String(mobile || "").trim();
  if (!s) return MOBILE_REQUIRED ? "Mobile phone is required." : null;
  // simple: allow + and digits 7-15
  if (!/^\+?\d{7,15}$/.test(s.replace(/\s+/g, ""))) return "Please enter a valid mobile phone number.";
  return null;
}

function TurnstilePlaceholder() {
  return (
    <div className="border rounded p-3 bg-light">
      <div className="small fw-semibold mb-1">Captcha</div>
      <div className="small text-muted">
        Cloudflare Turnstile placeholder (integrate keys later).
      </div>
    </div>
  );
}

function SuccessCard({ receipt, onClose }) {
  return (
    <div className="alert alert-success" role="alert">
      <div className="fw-semibold mb-1">Payment successful</div>
      <div className="small">
        <div className="d-flex justify-content-between">
          <span>Amount</span>
          <span className="fw-semibold">{formatUSD(receipt.amount)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>System Fee</span>
          <span className="fw-semibold">{formatUSD(receipt.systemFee)}</span>
        </div>
        <div className="d-flex justify-content-between">
          <span>Payment Fee</span>
          <span className="fw-semibold">{formatUSD(receipt.paymentFee)}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between">
          <span className="fw-semibold">Total</span>
          <span className="fw-bold">{formatUSD(receipt.total)}</span>
        </div>
        <div className="mt-2">
          <span className="text-muted">Reference ID:</span>{" "}
          <span className="fw-semibold">{receipt.referenceId}</span>
        </div>
      </div>

      <div className="mt-3">
        <button type="button" className="btn btn-success btn-sm" onClick={onClose}>
          Done
        </button>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  // Amount
  const [amount, setAmount] = useState("");
  const [amountTouched, setAmountTouched] = useState(false);

  // Modal open
  const [open, setOpen] = useState(false);
  const triggerBtnRef = useRef(null);
  const modalRef = useRef(null);
  const firstFieldRef = useRef(null);

  // Provider/mocks
  const [isPaying, setIsPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [receipt, setReceipt] = useState(null);

  // Idempotency key for this attempt
  const [attemptKey, setAttemptKey] = useState(() => `pay_${Date.now()}`);

  // Modal fields
  const [email, setEmail] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [country, setCountry] = useState("United States");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [zip, setZip] = useState("");
  const [mobile, setMobile] = useState("");

  const [fieldErrors, setFieldErrors] = useState({});

  const amountNumber = useMemo(() => (isValidMoney(amount) ? parseMoney(amount) : NaN), [amount]);
  const fees = useMemo(() => calcFees(amountNumber), [amountNumber]);

  const amountError = useMemo(() => {
    if (!amountTouched) return null;
    if (!String(amount || "").trim()) return "Amount is required.";
    if (!/^\d+(\.\d{1,2})?$/.test(String(amount).trim())) return "Enter a valid amount (up to 2 decimals).";
    const n = parseMoney(amount);
    if (!Number.isFinite(n) || n <= 0) return "Amount must be greater than 0.";
    return null;
  }, [amount, amountTouched]);

  const canOpenModal = !amountError && Number.isFinite(amountNumber) && amountNumber > 0;

  // Open/close behavior + Escape
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    // focus first field
    setTimeout(() => firstFieldRef.current?.focus(), 0);

    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const openModal = () => {
    setPayError("");
    setReceipt(null);
    setFieldErrors({});
    setAttemptKey(`pay_${Date.now()}`);
    setOpen(true);
  };

  const closeModal = () => {
    if (isPaying) return; // prevent close mid-submit
    setOpen(false);
    setPayError("");
    setFieldErrors({});
    // restore focus
    setTimeout(() => triggerBtnRef.current?.focus(), 0);
  };

  const validateModalFields = () => {
    const next = {};
    const e1 = validateEmail(email);
    if (e1) next.email = e1;

    const e2 = validateCardNumber(cardNumber);
    if (e2) next.cardNumber = e2;

    const e3 = validateExpiry(expiry);
    if (e3) next.expiry = e3;

    const e4 = validateCVC(cvc);
    if (e4) next.cvc = e4;

    const e5 = validateRequiredText(country, "Country");
    if (e5) next.country = e5;

    const e6 = validateRequiredText(firstName, "First name");
    if (e6) next.firstName = e6;

    const e7 = validateRequiredText(lastName, "Last name");
    if (e7) next.lastName = e7;

    const e8 = validateZip(zip);
    if (e8) next.zip = e8;

    const e9 = validateMobile(mobile);
    if (e9) next.mobile = e9;

    return next;
  };

  const handlePay = async () => {
    setPayError("");
    setReceipt(null);

    // fee/total consistency check at pay time
    const latestAmount = isValidMoney(amount) ? parseMoney(amount) : NaN;
    const latestFees = calcFees(latestAmount);

    if (!Number.isFinite(latestAmount) || latestAmount <= 0) {
      setPayError("We couldn’t validate your amount. Please check and try again.");
      return;
    }
    if (!(latestFees.total > 0)) {
      setPayError("We couldn’t validate fees/total. Please retry.");
      return;
    }

    const nextErrors = validateModalFields();
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setIsPaying(true);

    try {
      // MOCK provider call
      await new Promise((r) => setTimeout(r, 900));

      // random fail simulation (10%)
      const fail = Math.random() < 0.1;
      if (fail) throw new Error("provider_error");

      // success receipt
      const referenceId = `REF-${Math.random().toString(16).slice(2, 10).toUpperCase()}`;

      setReceipt({
        referenceId,
        attemptKey,
        amount: Math.round(latestAmount * 100) / 100,
        systemFee: latestFees.systemFee,
        paymentFee: latestFees.paymentFee,
        total: latestFees.total,
      });

      // Keep modal open to show success card, user can close.
    } catch {
      setPayError("Payment failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="mx-auto" style={{ maxWidth: 980 }}>
        <div className="card shadow-sm">
          <div className="card-body p-4">
            <div className="fw-semibold mb-3">Deposit</div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Select a Payment Option:</label>
              <select className="form-select" defaultValue="USD">
                <option value="USD">US Dollar</option>
              </select>
            </div>

            <div className="row g-3 align-items-end">
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Amount:</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    className={`form-control ${amountError ? "is-invalid" : ""}`}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={() => setAmountTouched(true)}
                    inputMode="decimal"
                    placeholder="100"
                    aria-label="Amount"
                  />
                  {amountError ? <div className="invalid-feedback">{amountError}</div> : null}
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Fee:</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    className="form-control"
                    value={formatUSD(fees.systemFee + fees.paymentFee).replace("$", "")}
                    readOnly
                    aria-label="Fee"
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">Total:</label>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    className="form-control"
                    value={formatUSD(fees.total).replace("$", "")}
                    readOnly
                    aria-label="Total"
                  />
                </div>
              </div>
            </div>

            <div className="d-flex justify-content-center my-4">
              <button
                ref={triggerBtnRef}
                type="button"
                className="btn btn-dark px-5"
                style={{ minWidth: 420, height: 56, borderRadius: 8, fontWeight: 600 }}
                onClick={() => {
                  setAmountTouched(true);
                  if (!canOpenModal) return;
                  openModal();
                }}
                disabled={!canOpenModal}
              >
                <span className="me-2" aria-hidden>
                  💳
                </span>
                Debit or Credit Card
              </button>
            </div>

            <div className="text-center small text-muted">Powered by PayPal</div>
          </div>
        </div>

        {/* Modal */}
        {open ? (
          <>
            <div
              className="modal fade show"
              style={{ display: "block" }}
              tabIndex={-1}
              role="dialog"
              aria-modal="true"
              onMouseDown={(e) => {
                // click outside closes
                if (e.target === modalRef.current) closeModal();
              }}
              ref={modalRef}
            >
              <div className="modal-dialog modal-dialog-centered" role="document" style={{ maxWidth: 520 }}>
                <div className="modal-content" style={{ borderRadius: 14 }}>
                  <div className="modal-header border-0 pb-0">
                    <div className="w-100 d-flex justify-content-center">
                      <div
                        className="btn btn-dark text-white"
                        style={{
                          pointerEvents: "none",
                          width: "100%",
                          height: 46,
                          borderRadius: 8,
                          fontWeight: 600,
                          marginTop:30
                        }}
                      >
                        💳&nbsp;&nbsp;Debit or Credit Card
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn-close position-absolute"
                      aria-label="Close"
                      style={{ top: 14, right: 14,  fontSize:20}}
                      onClick={closeModal}
                      disabled={isPaying}
                    />
                  </div>

                  <div className="modal-body pt-3 pb-4 px-4">
                    {/* Payment details card like screenshot */}
                    <div
                      className="border rounded-3 p-4 mb-4"
                      style={{ borderColor: "#B7A9FF", borderWidth: 2 }}
                    >
                      <div className="h4 fw-bold mb-2">Payment Details</div>
                      <div className="text-muted mb-4">
                        Review your amount, fees, and total before proceeding to payment. All values are in USD.
                      </div>

                      <hr className="my-4" />

                      <div className="d-flex justify-content-between mb-3">
                        <div className="h5 text-muted mb-0">Amount</div>
                        <div className="h5 fw-bold mb-0">{formatUSD(Number.isFinite(amountNumber) ? amountNumber : 0)}</div>
                      </div>

                      <div className="d-flex justify-content-between mb-3">
                        <div className="h5 text-muted mb-0">System Fee</div>
                        <div className="h5 fw-bold mb-0">{formatUSD(Number.isFinite(amountNumber) ? SYSTEM_FEE : 0)}</div>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <div className="h5 text-muted mb-0">Payment Fee</div>
                        <div className="h5 fw-bold mb-0">{formatUSD(fees.paymentFee)}</div>
                      </div>

                      <div className="text-muted small">
                        <div>System fee fixed at {formatUSD(SYSTEM_FEE)}</div>
                        <div>
                          payment fee = {Math.round(PAYMENT_FEE_RATE * 100)}% of (amount + system fee) +{" "}
                          {formatUSD(PAYMENT_FEE_FIXED)}
                        </div>
                      </div>

                      <hr className="my-4" />

                      <div className="d-flex justify-content-between align-items-center">
                        <div className="h4 fw-bold mb-0">Total</div>
                        <div className="h4 fw-bold mb-0">{formatUSD(fees.total)}</div>
                      </div>

                      <button
                        type="button"
                        className="btn w-100 mt-3"
                        style={{
                          height: 54,
                          borderRadius: 10,
                          fontWeight: 700,
                          background: "#A9C9FF",
                          borderColor: "#A9C9FF",
                          color: "rgba(255,255,255,0.85)",
                        }}
                        disabled
                      >
                        💳&nbsp;&nbsp;Debit or Credit Card
                      </button>
                    </div>

                    {/* Card form */}
                    {receipt ? (
                      <SuccessCard
                        receipt={receipt}
                        onClose={() => {
                          closeModal();
                          setReceipt(null);
                        }}
                      />
                    ) : null}

                    {payError ? (
                      <div className="alert alert-danger" role="alert">
                        {payError}
                      </div>
                    ) : null}

                    <div className="mb-3">
                      <input
                        ref={firstFieldRef}
                        className={`form-control ${fieldErrors.email ? "is-invalid" : ""}`}
                        placeholder="Email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: null }));
                        }}
                        disabled={isPaying || !!receipt}
                      />
                      {fieldErrors.email ? <div className="invalid-feedback">{fieldErrors.email}</div> : null}
                    </div>

                    <div className="mb-3">
                      <input
                        className={`form-control ${fieldErrors.cardNumber ? "is-invalid" : ""}`}
                        placeholder="Card number"
                        value={cardNumber}
                        onChange={(e) => {
                          setCardNumber(e.target.value);
                          if (fieldErrors.cardNumber) setFieldErrors((p) => ({ ...p, cardNumber: null }));
                        }}
                        disabled={isPaying || !!receipt}
                      />
                      {fieldErrors.cardNumber ? <div className="invalid-feedback">{fieldErrors.cardNumber}</div> : null}
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <input
                          className={`form-control ${fieldErrors.expiry ? "is-invalid" : ""}`}
                          placeholder="Expires"
                          value={expiry}
                          onChange={(e) => {
                            setExpiry(e.target.value);
                            if (fieldErrors.expiry) setFieldErrors((p) => ({ ...p, expiry: null }));
                          }}
                          disabled={isPaying || !!receipt}
                        />
                        {fieldErrors.expiry ? <div className="invalid-feedback">{fieldErrors.expiry}</div> : null}
                      </div>
                      <div className="col-6">
                        <input
                          className={`form-control ${fieldErrors.cvc ? "is-invalid" : ""}`}
                          placeholder="CSC"
                          value={cvc}
                          onChange={(e) => {
                            setCvc(e.target.value);
                            if (fieldErrors.cvc) setFieldErrors((p) => ({ ...p, cvc: null }));
                          }}
                          disabled={isPaying || !!receipt}
                        />
                        {fieldErrors.cvc ? <div className="invalid-feedback">{fieldErrors.cvc}</div> : null}
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <div className="fw-semibold">Billing address</div>
                      <div className="d-flex align-items-center gap-2">
                        <span aria-hidden>🇺🇸</span>
                        <select
                          className={`form-select form-select-sm ${fieldErrors.country ? "is-invalid" : ""}`}
                          style={{ width: 160 }}
                          value={country}
                          onChange={(e) => {
                            setCountry(e.target.value);
                            if (fieldErrors.country) setFieldErrors((p) => ({ ...p, country: null }));
                          }}
                          disabled={isPaying || !!receipt}
                        >
                          <option>United States</option>
                          <option>Canada</option>
                          <option>United Kingdom</option>
                          <option>Palestine</option>
                        </select>
                      </div>
                    </div>

                    <div className="row g-2 mb-3">
                      <div className="col-6">
                        <input
                          className={`form-control ${fieldErrors.firstName ? "is-invalid" : ""}`}
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => {
                            setFirstName(e.target.value);
                            if (fieldErrors.firstName) setFieldErrors((p) => ({ ...p, firstName: null }));
                          }}
                          disabled={isPaying || !!receipt}
                        />
                        {fieldErrors.firstName ? <div className="invalid-feedback">{fieldErrors.firstName}</div> : null}
                      </div>
                      <div className="col-6">
                        <input
                          className={`form-control ${fieldErrors.lastName ? "is-invalid" : ""}`}
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => {
                            setLastName(e.target.value);
                            if (fieldErrors.lastName) setFieldErrors((p) => ({ ...p, lastName: null }));
                          }}
                          disabled={isPaying || !!receipt}
                        />
                        {fieldErrors.lastName ? <div className="invalid-feedback">{fieldErrors.lastName}</div> : null}
                      </div>
                    </div>

                    <div className="mb-3">
                      <input
                        className={`form-control ${fieldErrors.zip ? "is-invalid" : ""}`}
                        placeholder="ZIP code"
                        value={zip}
                        onChange={(e) => {
                          setZip(e.target.value);
                          if (fieldErrors.zip) setFieldErrors((p) => ({ ...p, zip: null }));
                        }}
                        disabled={isPaying || !!receipt}
                      />
                      {fieldErrors.zip ? <div className="invalid-feedback">{fieldErrors.zip}</div> : null}
                    </div>

                    <div className="mb-3">
                      <input
                        className={`form-control ${fieldErrors.mobile ? "is-invalid" : ""}`}
                        placeholder="Mobile +1"
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value);
                          if (fieldErrors.mobile) setFieldErrors((p) => ({ ...p, mobile: null }));
                        }}
                        disabled={isPaying || !!receipt}
                      />
                      {fieldErrors.mobile ? <div className="invalid-feedback">{fieldErrors.mobile}</div> : null}
                    </div>

                    <div className="text-muted small mb-3">
                      By continuing, you confirm you’re 18 years or older.
                    </div>

                    <div className="mb-3">
                      <TurnstilePlaceholder />
                    </div>

                    <button
                      type="button"
                      className="btn btn-primary w-100"
                      style={{ borderRadius: 999, height: 52, fontWeight: 700 }}
                      onClick={handlePay}
                      disabled={isPaying || !!receipt}
                    >
                      {isPaying ? "Processing..." : `Pay ${formatUSD(fees.total)}`}
                    </button>

                    <div className="small text-muted mt-3">
                      Attempt key: <span className="fw-semibold">{attemptKey}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Backdrop */}
            <div className="modal-backdrop fade show" />
          </>
        ) : null}
      </div>
    </div>
  );
}
