/**
 * Which MongoDB database a command is about to use, in a form that is safe to print.
 * Maintenance scripts show this first so nobody changes the wrong database by accident
 * (a local .env often points at a different cluster than the live server uses).
 */

const DEFAULT_DB_NAME = 'fundu';

/** The database name the server uses: MONGODB_DB_NAME, or `fundu`. */
export const resolveDbName = (env = process.env) => String(env.MONGODB_DB_NAME || '').trim() || DEFAULT_DB_NAME;

/** "cluster0.abc.mongodb.net / fundu" - the host and database, never the user name or password. */
export const describeDbTarget = (uri, dbName) => {
  let host = 'unknown host';
  try {
    host = new URL(String(uri).replace(/^mongodb(\+srv)?:\/\//, 'https://')).host || host;
  } catch {
    // keep the placeholder
  }
  return `${host} / ${dbName}`;
};
