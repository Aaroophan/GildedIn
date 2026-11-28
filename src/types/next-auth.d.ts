/** Only the short-lived Auth.js OAuth handshake carries these server-issued claim names.
 * They are not accepted as account-API authorization credentials.
 * Actual compatibility must be verified against the pinned next-auth v5 package.
 */
import type {DefaultSession} from 'next-auth';
declare module 'next-auth' {
  interface Session {
    user: {id:string} & NonNullable<DefaultSession['user']>;
    gildedinProvider?: 'google'|'github'|null;
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    gildedinAccountId?:string;
    gildedinProvider?:'google'|'github';
  }
}
