// filepath: src/features/auth/utils/status.js

/*
  Default empty state for UI alerts and status messages.
  Used to reset notifications or initialize status state in hooks.
 */
export const emptyStatus = { 
  type: "", // can be 'success', 'danger', 'warning', 'info'
  msg: "" 
};