import { Buffer } from "node:buffer";

/** Netlify / Lambda can use different event shapes; normalize method. */
export function netlifyHttpMethod(event) {
  const raw =
    event?.httpMethod ??
    event?.requestContext?.http?.method ??
    event?.requestContext?.requestMethod ??
    "";
  return String(raw).toUpperCase();
}

/** Decode body when API gateway marks it base64. */
export function netlifyRawBody(event) {
  const b = event?.body;
  if (b == null || b === "") return "";
  if (event.isBase64Encoded) {
    return Buffer.from(b, "base64").toString("utf8");
  }
  return typeof b === "string" ? b : String(b);
}
