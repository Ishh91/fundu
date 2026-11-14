/**
 * Shapes and groups error reports for the error tracker.
 *
 * Reports come from any visitor's browser, so every field is treated as
 * untrusted: text is cut to a fixed length, extra details are capped in size,
 * and who the user is comes only from the verified login, never from the body.
 */

const MAX_TYPE = 50;
const MAX_MESSAGE = 1000;
const MAX_STACK = 5000;
const MAX_URL = 500;
const MAX_USER_AGENT = 300;
const MAX_IP = 50;
const MAX_METADATA_JSON = 2000;

const text = (value, max) => (value === null || value === undefined ? '' : String(value)).slice(0, max);

/** Keeps small plain-object metadata; anything else (or anything large) is dropped. */
export const limitMetadata = (metadata) => {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
  try {
    const json = JSON.stringify(metadata);
    if (json.length <= MAX_METADATA_JSON) return JSON.parse(json);
    return { truncated: true, preview: json.slice(0, MAX_METADATA_JSON) };
  } catch {
    return {};
  }
};

/**
 * @param {object} body the reported error as sent by the browser
 * @param {{ auth?: object, ip?: string, userAgent?: string }} caller facts the server knows itself
 * @returns {{ ok: true, record: object } | { ok: false, error: string }}
 */
export const buildClientErrorRecord = (body, { auth = null, ip = '', userAgent = '' } = {}) => {
  const message = body?.message;
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { ok: false, error: 'Error message is required.' };
  }

  return {
    ok: true,
    record: {
      type: text(body.type || 'client_error', MAX_TYPE),
      message: text(message, MAX_MESSAGE),
      stack: text(body.stack, MAX_STACK),
      url: text(body.url, MAX_URL),
      path: text(body.path, MAX_URL),
      component_stack: text(body.component_stack, MAX_STACK),
      user_id: auth?.sub ? String(auth.sub) : null,
      user_email: auth?.email ? String(auth.email) : null,
      user_agent: text(userAgent, MAX_USER_AGENT),
      ip: text(ip, MAX_IP),
      metadata: limitMetadata(body.metadata),
      created_at: new Date().toISOString(),
    },
  };
};

/**
 * Groups raw error rows so the admin sees each distinct problem once, with how
 * often and how recently it happened. Rows are grouped by type + message + page.
 *
 * @param {Array<object>} rows newest first or in any order
 * @returns {Array<{ key: string, type: string, message: string, path: string, count: number,
 *   lastSeen: string, firstSeen: string, users: number, sample: object }>} most recent first
 */
export const groupErrors = (rows) => {
  const groups = new Map();
  for (const row of rows) {
    const key = `${row.type || 'client_error'}|${row.message || ''}|${row.path || ''}`;
    const seenAt = row.created_at ? new Date(row.created_at).toISOString() : '';
    const existing = groups.get(key);
    if (!existing) {
      groups.set(key, {
        key,
        type: row.type || 'client_error',
        message: row.message || '',
        path: row.path || '',
        count: 1,
        lastSeen: seenAt,
        firstSeen: seenAt,
        visitors: new Set([row.user_id || row.ip || 'unknown']),
        sample: row,
      });
      continue;
    }
    const isNewer = seenAt > existing.lastSeen;
    existing.visitors.add(row.user_id || row.ip || 'unknown');
    groups.set(key, {
      ...existing,
      count: existing.count + 1,
      lastSeen: isNewer ? seenAt : existing.lastSeen,
      firstSeen: seenAt && seenAt < existing.firstSeen ? seenAt : existing.firstSeen,
      sample: isNewer ? row : existing.sample,
    });
  }

  return [...groups.values()]
    .map(({ visitors, ...group }) => ({ ...group, users: visitors.size }))
    .sort((a, b) => (a.lastSeen < b.lastSeen ? 1 : -1));
};
