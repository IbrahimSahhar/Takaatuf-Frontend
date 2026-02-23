// filepath: src/constants/roles.js

/*
  Application Roles
  Strictly frozen to prevent accidental modifications.
 */
export const ROLES = Object.freeze({
  /* KP (Key Person): 
    Service providers located inside Gaza who fulfill requests.
  */
  KP: "kp",

  /* KR (Key Requester): 
    Users who create and fund service requests.
  */
  KR: "kr",

  /* ADMIN: 
    System administrators managing payouts, audits, and applications.
  */
  ADMIN: "admin",
});