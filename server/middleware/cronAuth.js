/**
 * Bearer-token auth for cron-job.org endpoints. Compares Authorization header
 * against EMAIL_CRON_SECRET env var. No JWT, no user context.
 */
export function requireCronSecret(req, res, next) {
  const expected = process.env.EMAIL_CRON_SECRET;
  if (!expected) {
    return res.status(500).json({ success: false, error: 'EMAIL_CRON_SECRET not configured' });
  }
  const header = req.headers.authorization || '';
  const provided = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!provided || provided !== expected) {
    return res.status(401).json({ success: false, error: 'Invalid or missing cron secret' });
  }
  next();
}
