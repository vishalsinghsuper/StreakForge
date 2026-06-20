/**
 * StreakForge — Centralized API configuration
 *
 * In production (behind Nginx), VITE_API_BASE is left empty so all
 * fetch calls use relative URLs (e.g. /api/auth/login, /uploads/...).
 * Nginx then proxies /api/ and /uploads/ to the Express backend on port 8000.
 *
 * In local development, leave VITE_API_BASE unset too — Vite's dev server
 * proxies /api/ via vite.config.js, or you can set:
 *   VITE_API_BASE=http://localhost:8000
 * in frontend/.env.local if you prefer explicit targeting.
 */
export const API_BASE = import.meta.env.VITE_API_BASE || "";
