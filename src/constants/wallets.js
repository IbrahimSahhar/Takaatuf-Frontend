// filepath: src/constants/wallets.js

/*
  Wallet Type Identifiers
  Consistent keys for validation and API communication.
 */
export const WALLET_TYPES = Object.freeze({
  ETHEREUM: "ethereum",
  SOLANA: "solana",
  BITCOIN: "bitcoin",
});

/*
  UI-Friendly Wallet Options
  Ready-to-use array for form selectors and dropdowns.
 */
export const WALLET_TYPE_OPTIONS = [
  { value: WALLET_TYPES.ETHEREUM, label: "Ethereum" },
  { value: WALLET_TYPES.SOLANA, label: "Solana" },
  { value: WALLET_TYPES.BITCOIN, label: "Bitcoin" },
];
