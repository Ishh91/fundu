/**
 * Escapes text so it matches itself inside a RegExp. A brand name such as "Ai+" holds a regex symbol: without this `^Ai+$` matches
 * "Aii" and never "Ai+", so a price saved for the brand would miss its own rows and create a duplicate.
 */
export const escapeRegex = (text) => String(text ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
