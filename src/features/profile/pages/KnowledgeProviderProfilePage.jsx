// filepath: src/features/profile/kp/KPProfilePage.jsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, Button } from "react-bootstrap";

/**
 * KP Profile Page
 * Handles profile display, wallet/location editing, and payout requests.
 */

const MIN_PAYOUT = 15;
const AVATAR_STORAGE_KEY = "kp_profile_avatar_v1";

/* ===================== Helper Functions ===================== */

const currency = (amount, currencyCode = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: currencyCode }).format(
    Number.isFinite(amount) ? amount : 0
  );

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
};

const last4 = (wallet) => {
  const s = String(wallet || "").trim();
  if (!s) return "----";
  return s.slice(-4);
};

function validateWallet(wallet) {
  const w = String(wallet || "").trim();
  if (!w) return "Wallet address is required.";
  if (!/^0x[a-fA-F0-9]{40}$/.test(w)) return "Invalid wallet address format.";
  return null;
}

function sortByDateDesc(items, key) {
  return [...(items || [])].sort((a, b) => {
    const ta = new Date(a?.[key] || 0).getTime();
    const tb = new Date(b?.[key] || 0).getTime();
    return tb - ta;
  });
}

/* ===================== UI Components ===================== */

function Alert({ type = "info", title, children, onClose }) {
  return (
    <div className={`alert alert-${type} d-flex align-items-start justify-content-between`} role="alert">
      <div>
        {title ? <div className="fw-semibold mb-1">{title}</div> : null}
        {children}
      </div>
      {onClose ? (
        <button type="button" className="btn-close" aria-label="Close" onClick={onClose} />
      ) : null}
    </div>
  );
}

function CardShell({ children, className = "" }) {
  return <div className={`card shadow-sm ${className}`}>{children}</div>;
}

function SkeletonBlock({ lines = 3 }) {
  return (
    <div className="placeholder-glow">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="mb-2">
          <span className={`placeholder col-${i === 0 ? 6 : i === 1 ? 8 : 5}`} />
        </div>
      ))}
    </div>
  );
}

function Avatar({ name, src, onPick }) {
  const inputRef = useRef(null);
  const initial = (name || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="position-relative" style={{ width: 64, height: 64 }}>
      <div
        className="rounded-circle bg-light border overflow-hidden d-flex align-items-center justify-content-center"
        style={{ width: 64, height: 64 }}
      >
        {src ? (
          <img src={src} alt={name || "Profile photo"} className="w-100 h-100" style={{ objectFit: "cover" }} />
        ) : (
          <span className="fw-bold text-muted fs-4">{initial}</span>
        )}
      </div>
      <button
        type="button"
        className="btn btn-sm btn-light border position-absolute bottom-0 end-0"
        style={{ padding: "2px 6px", lineHeight: 1 }}
        onClick={() => inputRef.current?.click()}
        title="Change photo"
      >
        📷
      </button>
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={onPick} />
    </div>
  );
}

function ProfileHeader({ name, location, avatarSrc, onAvatarPick }) {
  return (
    <CardShell className="mb-4">
      <div className="card-body d-flex align-items-center gap-3">
        <Avatar name={name} src={avatarSrc} onPick={onAvatarPick} />
        <div>
          <div className="h5 mb-0">{name || "—"}</div>
          <div className="text-muted">{location || "—"}</div>
        </div>
      </div>
    </CardShell>
  );
}

function EditableFieldCard({ title, value, isEditing, onEdit, onCancel, onSave, saving, children, footerHint }) {
  return (
    <CardShell className="mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start gap-3 mb-2">
          <div className="fw-semibold">{title}</div>
          {!isEditing ? (
            <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onEdit}>
              ✏️ Edit
            </button>
          ) : (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onCancel} disabled={saving}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={onSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
        {!isEditing ? (
          <div className="text-muted" style={{ wordBreak: "break-all" }}>
            {value || "—"}
          </div>
        ) : (
          <div className="mt-2">{children}</div>
        )}
        {footerHint ? <div className="text-muted small mt-3">{footerHint}</div> : null}
      </div>
    </CardShell>
  );
}

function PayoutHistoryCard({ payouts, total }) {
  return (
    <CardShell className="mb-4">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="fw-semibold">Payout History</div>
          <div className="text-muted">
            <span className="fw-semibold text-dark">Total</span> <span className="ms-2">{currency(total)}</span>
          </div>
        </div>
        {payouts.length === 0 ? (
          <div className="text-muted">No payouts yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead className="table-light">
                <tr>
                  <th scope="col">Amount</th>
                  <th scope="col">Date</th>
                  <th scope="col">Wallet</th>
                  <th scope="col" className="text-end">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id}>
                    <td className="fw-semibold">{currency(p.amount)}</td>
                    <td className="text-muted">{formatDate(p.date)}</td>
                    <td className="text-muted">****{last4(p.wallet)}</td>
                    <td className="text-end">
                      <span
                        className={
                          "badge rounded-pill " +
                          (String(p.status).toLowerCase().includes("complete")
                            ? "bg-success"
                            : String(p.status).toLowerCase().includes("pending")
                            ? "bg-warning text-dark"
                            : "bg-danger")
                        }
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CardShell>
  );
}

/* ===================== Mock APIs ===================== */

async function mockFetchProfile() {
  await new Promise((r) => setTimeout(r, 500));
  return {
    name: "Shams Ahmad",
    workingLocation: "Deir Al-Balah",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f444",
    currentEarnings: 45.0,
    payouts: [
      { id: "p1", amount: 125.75, date: "2023-10-26T10:00:00Z", wallet: "0x...abcd", status: "Completed" },
      { id: "p2", amount: 80.0, date: "2023-09-15T10:00:00Z", wallet: "0x...efgh", status: "Pending" },
      { id: "p3", amount: 45.2, date: "2023-08-01T10:00:00Z", wallet: "0x...cdef", status: "Failed" },
      { id: "p4", amount: 200.0, date: "2023-07-10T10:00:00Z", wallet: "0x...3344", status: "Completed" },
    ],
  };
}

async function mockSaveWallet(newWallet) {
  await new Promise((r) => setTimeout(r, 450));
  return { walletAddress: newWallet };
}

async function mockSaveLocation(newLocation) {
  await new Promise((r) => setTimeout(r, 450));
  return { workingLocation: newLocation };
}

async function mockRequestPayout({ amount, wallet }) {
  await new Promise((r) => setTimeout(r, 650));
  return {
    payout: { id: `p_${Date.now()}`, amount, date: new Date().toISOString(), wallet, status: "Pending" },
    newCurrentEarnings: 0,
  };
}

/* ===================== Main Component ===================== */

export default function KPProfilePage() {
  const [loadState, setLoadState] = useState({ status: "loading", error: null });
  const [profile, setProfile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState(null);

  // Editable states
  const [editingWallet, setEditingWallet] = useState(false);
  const [walletInput, setWalletInput] = useState("");
  const [walletError, setWalletError] = useState(null);
  const [savingWallet, setSavingWallet] = useState(false);

  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [locationError, setLocationError] = useState(null);
  const [savingLocation, setSavingLocation] = useState(false);

  const [toast, setToast] = useState(null);
  const [requestingPayout, setRequestingPayout] = useState(false);

  // Load Avatar from storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved) setAvatarSrc(saved);
    } catch { /* ignore */ }
  }, []);

  // Fetch Profile Data
  const load = useCallback(async () => {
    setLoadState({ status: "loading", error: null });
    try {
      const data = await mockFetchProfile();
      setProfile(data);
      if (!editingWallet) setWalletInput(data.walletAddress || "");
      if (!editingLocation) setLocationInput(data.workingLocation || "");
      setLoadState({ status: "success", error: null });
    } catch (e) {
      setLoadState({ status: "error", error: e });
    }
  }, [editingWallet, editingLocation]);

  useEffect(() => { load(); }, [load]);

  // Avatar Picker
  const onAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type?.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      setAvatarSrc(dataUrl);
      try { localStorage.setItem(AVATAR_STORAGE_KEY, dataUrl); } catch { /* empty */ }
    };
    reader.readAsDataURL(file);
  };

  // Wallet Handlers
  const saveWallet = async () => {
    const err = validateWallet(walletInput);
    setWalletError(err);
    if (err) return;
    setSavingWallet(true);
    try {
      const res = await mockSaveWallet(walletInput.trim());
      setProfile((p) => ({ ...p, walletAddress: res.walletAddress }));
      setEditingWallet(false);
      setToast({ type: "success", title: "Saved", message: "Wallet updated." });
    } catch {
      setToast({ type: "danger", title: "Error", message: "Failed to save wallet." });
    } finally { setSavingWallet(false); }
  };

  // Location Handlers
  const saveLocation = async () => {
    const val = String(locationInput || "").trim();
    if (!val) return setLocationError("Required.");
    setSavingLocation(true);
    try {
      const res = await mockSaveLocation(val);
      setProfile((p) => ({ ...p, workingLocation: res.workingLocation }));
      setEditingLocation(false);
      setToast({ type: "success", title: "Saved", message: "Location updated." });
    } catch {
      setToast({ type: "danger", title: "Error", message: "Failed to save location." });
    } finally { setSavingLocation(false); }
  };

  // Payout Handlers
  const handleOpenConfirm = () => setShowConfirmModal(true);

  const confirmAndRequestPayout = async () => {
    setShowConfirmModal(false);
    if (!profile) return;
    setRequestingPayout(true);
    try {
      const amount = Number(profile.currentEarnings || 0);
      const wallet = profile.walletAddress;
      const res = await mockRequestPayout({ amount, wallet });
      setProfile((p) => ({
        ...p,
        currentEarnings: res.newCurrentEarnings,
        payouts: [res.payout, ...(p.payouts || [])],
      }));
      setToast({ type: "success", title: "Success", message: "Payout requested." });
    } catch {
      setToast({ type: "danger", title: "Error", message: "Payout failed." });
    } finally { setRequestingPayout(false); }
  };

  // Memoized Data
  const payoutsSorted = useMemo(() => sortByDateDesc(profile?.payouts, "date"), [profile]);
  const payoutTotal = useMemo(() => profile?.payouts?.reduce((sum, p) => sum + (Number(p.amount) || 0), 0) || 0, [profile]);
  const canRequestPayout = (profile?.currentEarnings ?? 0) >= MIN_PAYOUT;

  // Internal Component
  function EarningsCard({ amount, canRequest, helper, requesting }) {
    return (
      <CardShell className="mb-4">
        <div className="card-body d-flex align-items-center justify-content-between gap-3 flex-wrap">
          <div>
            <div className="fw-semibold">Current Earnings</div>
            <div className="display-6 fw-bold mb-0" style={{ lineHeight: 1.1 }}>{currency(amount)}</div>
            <div className="text-muted small">Total since last payout</div>
            {!canRequest ? <div className="text-muted small mt-1">{helper}</div> : null}
          </div>
          <button className="btn btn-primary" type="button" onClick={handleOpenConfirm} disabled={!canRequest || requesting}>
            {requesting ? "Requesting..." : "Request Payout"}
          </button>
        </div>
      </CardShell>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="mx-auto" style={{ maxWidth: 560 }}>
        <div className="text-center mb-4">
          <h3 className="mb-0">My Profile</h3>
        </div>

        {toast && (
          <Alert type={toast.type} title={toast.title} onClose={() => setToast(null)}>
            <div className="small">{toast.message}</div>
          </Alert>
        )}

        {loadState.status === "error" && (
          <Alert type="danger" title="Load failed">
            <button className="btn btn-outline-danger btn-sm mt-2" onClick={load}>Retry</button>
          </Alert>
        )}

        {loadState.status === "loading" ? (
          <CardShell className="mb-4 p-4"><SkeletonBlock lines={4} /></CardShell>
        ) : profile ? (
          <>
            <ProfileHeader name={profile.name} location={profile.workingLocation} avatarSrc={avatarSrc} onAvatarPick={onAvatarPick} />

            <EditableFieldCard
              title="Wallet Address"
              value={profile.walletAddress}
              isEditing={editingWallet}
              onEdit={() => setEditingWallet(true)}
              onCancel={() => setEditingWallet(false)}
              onSave={saveWallet}
              saving={savingWallet}
            >
              <input
                type="text"
                className={`form-control ${walletError ? "is-invalid" : ""}`}
                value={walletInput}
                onChange={(e) => { setWalletInput(e.target.value); setWalletError(null); }}
              />
              {walletError && <div className="invalid-feedback">{walletError}</div>}
            </EditableFieldCard>

            <EarningsCard
              amount={profile.currentEarnings}
              canRequest={canRequestPayout}
              helper={`Payouts require a minimum of ${currency(MIN_PAYOUT)}.`}
              requesting={requestingPayout}
            />

            <PayoutHistoryCard payouts={payoutsSorted} total={payoutTotal} />

            <EditableFieldCard
              title="Working Location"
              value={profile.workingLocation}
              isEditing={editingLocation}
              onEdit={() => setEditingLocation(true)}
              onCancel={() => setEditingLocation(false)}
              onSave={saveLocation}
              saving={savingLocation}
            >
              <input
                type="text"
                className={`form-control ${locationError ? "is-invalid" : ""}`}
                value={locationInput}
                onChange={(e) => { setLocationInput(e.target.value); setLocationError(null); }}
              />
              {locationError && <div className="invalid-feedback">{locationError}</div>}
            </EditableFieldCard>
          </>
        ) : null}
      </div>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Confirm Payout</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Request <strong className="text-dark">{currency(profile?.currentEarnings)}</strong> to:</p>
          <div className="p-3 bg-light rounded small text-break font-monospace">{profile?.walletAddress}</div>
          <p className="mt-3 mb-0 small text-warning">Please ensure your wallet address is correct.</p>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button variant="link" className="text-muted text-decoration-none" onClick={() => setShowConfirmModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={confirmAndRequestPayout}>Confirm & Request</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
