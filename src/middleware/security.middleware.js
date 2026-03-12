import aj, { isArcjetConfigured } from '#config/arcjet';
import logger from '#config/logger';

const RATE_LIMIT_PER_MINUTE = Number(process.env.RATE_LIMIT_PER_MINUTE || 5);
const RATE_LIMIT_WINDOW_MS = Number(
  process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000
);
const PUBLIC_PATHS = new Set(['/health', '/favicon.ico']);
const requestLogByClient = new Map();
const BOT_UA_PATTERN = /\b(bot|crawler|spider|scraper|headless)\b/i;

const normalizeIp = (ip = '') => {
  if (!ip) return '127.0.0.1';
  if (ip === '::1') return '127.0.0.1';
  return ip.startsWith('::ffff:') ? ip.slice(7) : ip;
};

const getClientIp = req => {
  const forwarded = req.headers['x-forwarded-for'];
  const forwardedIp =
    typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : '';
  return normalizeIp(
    forwardedIp || req.ip || req.socket?.remoteAddress || '127.0.0.1'
  );
};

const isBotLikeUserAgent = (userAgent = '') => BOT_UA_PATTERN.test(userAgent);

const isRateLimited = (key, limit) => {
  const now = Date.now();
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const requestTimes = requestLogByClient.get(key) || [];
  const recentRequests = requestTimes.filter(timestamp => timestamp > cutoff);

  if (recentRequests.length >= limit) {
    requestLogByClient.set(key, recentRequests);
    return true;
  }

  recentRequests.push(now);
  requestLogByClient.set(key, recentRequests);
  return false;
};

const securityMiddleware = async (req, res, next) => {
  try {
    if (req.method === 'OPTIONS') {
      return next();
    }

    if (PUBLIC_PATHS.has(req.path)) {
      return next();
    }

    const role = req.user?.role || 'guest';
    const limit = RATE_LIMIT_PER_MINUTE;
    const ip = getClientIp(req);
    const userAgent = req.get('User-Agent') || '';
    const rateLimitKey = `${ip}:${role}`;

    if (isRateLimited(rateLimitKey, limit)) {
      logger.warn('Rate limit exceeded', {
        ip,
        userAgent,
        path: req.path,
      });

      res.set('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Too many requests, please try again later',
      });
    }

    if (!isArcjetConfigured && isBotLikeUserAgent(userAgent)) {
      logger.warn('Bot-like request blocked by local fallback', {
        ip,
        userAgent,
        path: req.path,
      });

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Automated requests are not allowed',
      });
    }

    if (!isArcjetConfigured) {
      return next();
    }

    const decision = await aj.protect(req, { role });

    if (decision.isDenied()) {
      const denialReason = decision.reason;

      if (denialReason?.isBot?.()) {
        logger.warn('Bot request blocked', {
          ip,
          userAgent,
          path: req.path,
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Automated requests are not allowed',
        });
      }

      if (denialReason?.isRateLimit?.()) {
        logger.warn('Rate limit exceeded', {
          ip,
          userAgent,
          path: req.path,
        });

        res.set('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Too many requests, please try again later',
        });
      }

      if (denialReason?.isShield?.()) {
        logger.warn('Shield request blocked', {
          ip,
          userAgent,
          path: req.path,
        });

        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request blocked by security rules',
        });
      }

      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied',
      });
    }

    next();
  } catch (e) {
    logger.error('ArcJet middleware error', {
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
      cause: e?.cause,
    });

    return next();
  }
};

export default securityMiddleware;
