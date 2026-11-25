const formatMeta = (meta) => {
  if (!meta || Object.keys(meta).length === 0) return '';
  try {
    return ` ${JSON.stringify(meta)}`;
  } catch {
    return '';
  }
};

const logger = {
  info(message, meta) {
    console.log(`[${new Date().toISOString()}] INFO: ${message}${formatMeta(meta)}`);
  },
  warn(message, meta) {
    console.warn(`[${new Date().toISOString()}] WARN: ${message}${formatMeta(meta)}`);
  },
  error(message, meta) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}${formatMeta(meta)}`);
  },
};

module.exports = logger;
