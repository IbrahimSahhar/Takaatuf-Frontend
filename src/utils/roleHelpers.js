// filepath: src/utils/roleHelpers.js
import { ROLES } from "@/constants/roles";

/** Role checks */
export const isGazaUser = (user) => user?.role === ROLES.KP; // kp = ط؛ط²ط§ظˆظٹ
export const isOutsideGazaUser = (user) => user?.role === ROLES.KR; // kr = ط¨ط±ط§ ط؛ط²ط©

/** Optional: direct checks */
export const hasRole = (user, role) => user?.role === role;

