/** @param {string} urlString */
export function assertSafeHttpUrl(urlString) {
  let u;
  try {
    u = new URL(urlString);
  } catch {
    throw new Error("Invalid URL");
  }

  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http(s) URLs are allowed");
  }

  if (u.username || u.password) {
    throw new Error("Credentials in URL are not allowed");
  }

  const host = u.hostname.toLowerCase();

  if (
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "0.0.0.0" ||
    host === "[::1]" ||
    host === "::1"
  ) {
    throw new Error("Local addresses are not allowed");
  }

  if (host.endsWith(".local") || host.endsWith(".localhost")) {
    throw new Error("Local hostnames are not allowed");
  }

  if (host === "metadata.google.internal" || host.endsWith(".internal")) {
    throw new Error("Internal hostnames are not allowed");
  }

  // Link-local / metadata
  if (host === "169.254.169.254" || host.startsWith("169.254.")) {
    throw new Error("Link-local / metadata targets are not allowed");
  }

  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const m = host.match(ipv4);
  if (m) {
    const [, a, b] = m.map(Number);
    if (a === 10) throw new Error("Private network ranges are not allowed");
    if (a === 127) throw new Error("Loopback ranges are not allowed");
    if (a === 0) throw new Error("Invalid address");
    if (a === 172 && b >= 16 && b <= 31) {
      throw new Error("Private network ranges are not allowed");
    }
    if (a === 192 && b === 168) {
      throw new Error("Private network ranges are not allowed");
    }
    if (a === 100 && b >= 64 && b <= 127) {
      throw new Error("CGNAT ranges are not allowed");
    }
  }

  return u;
}

const MAX_REDIRECTS = 6;

/**
 * Fetch with manual redirects so each hop is validated (SSRF hardening).
 * @param {string} urlString
 * @param {RequestInit} [init]
 */
export async function fetchSafe(urlString, init = {}) {
  let current = assertSafeHttpUrl(urlString).href;
  let redirects = 0;

  const headers = {
    "User-Agent":
      "AiSlopMachineCapture/1.0 (+https://github.com/) Mozilla/5.0 compatible",
    Accept: "text/html,application/xhtml+xml,text/css;q=0.9,*/*;q=0.8",
    ...init.headers,
  };

  for (;;) {
    const res = await fetch(current, {
      ...init,
      headers,
      redirect: "manual",
    });

    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) {
        throw new Error("Redirect without Location header");
      }
      if (redirects >= MAX_REDIRECTS) {
        throw new Error("Too many redirects");
      }
      redirects += 1;
      current = new URL(loc, current).href;
      assertSafeHttpUrl(current);
      continue;
    }

    return res;
  }
}
