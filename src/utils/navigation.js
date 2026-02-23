// filepath: src/utils/navigation.js
export const fullPathFromLocation = (loc) =>
  `${loc.pathname}${loc.search}${loc.hash}`;

