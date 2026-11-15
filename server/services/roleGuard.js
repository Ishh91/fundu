/** True when an update would change role or staff access of the account making it. */
export const changesOwnAccess = (payload, targetIds, authSub) =>
  (payload?.role !== undefined || payload?.permissions !== undefined) &&
  targetIds.some((id) => String(id) === String(authSub));
