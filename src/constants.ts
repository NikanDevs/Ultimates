// DB expiry calculations.

// 14 days - left member model
export const leftMemberExpiry = Date.now() + 1000 * 60 * 60 * 24 * 14;

// 1 day - automod warnings
export const automodWarningExpiry = Date.now() + 1000 * 60 * 60 * 24 * 1;

// 30 days - manual warnings
export const manualWarningExpiry = Date.now() + 1000 * 60 * 60 * 24 * 30;

// 3 months - Ban system
export const banSystemExpiry = Date.now() + 1000 * 60 * 60 * 24 * 90;
