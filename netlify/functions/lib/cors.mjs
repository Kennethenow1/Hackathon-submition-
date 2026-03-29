export function corsHeaders() {
  const allow =
    process.env.CAPTURE_CORS_ORIGIN && process.env.CAPTURE_CORS_ORIGIN !== "*"
      ? process.env.CAPTURE_CORS_ORIGIN
      : "*";

  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}
