import arcjet, { shield, detectBot } from '@arcjet/node';

const ARCJET_API_KEY = process.env.ARCJET_API_KEY || process.env.ARJECT_API_KEY;
const BOT_MODE = process.env.ARCJET_BOT_MODE || 'LIVE';
const SHIELD_MODE = process.env.ARCJET_SHIELD_MODE || 'LIVE';
const isArcjetConfigured = Boolean(ARCJET_API_KEY);

if (!isArcjetConfigured) {
  // Keep startup non-fatal, middleware has local fallbacks.
  console.warn(
    '[security] Arcjet API key missing. Set ARCJET_API_KEY (or ARJECT_API_KEY for backward compatibility).'
  );
}

const aj = arcjet({
  key: ARCJET_API_KEY,
  rules: [
    shield({ mode: SHIELD_MODE }),
    detectBot({
      mode: BOT_MODE,
      allow: ['CATEGORY:SEARCH_ENGINE'],
    }),
  ],
});

export { isArcjetConfigured };
export default aj;
