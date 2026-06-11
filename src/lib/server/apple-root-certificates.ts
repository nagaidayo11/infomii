import { readFileSync } from "fs";
import { join } from "path";

const CERT_FILES = [
  "AppleRootCA-G3.cer",
  "AppleIncRootCertificate.cer",
  "AppleRootCA-G2.cer",
] as const;

let cached: Buffer[] | null = null;

/** DER-encoded Apple root CAs for App Store Server Library JWS verification. */
export function loadAppleRootCertificates(): Buffer[] {
  if (cached) return cached;
  const certDir = join(process.cwd(), "certs", "apple");
  cached = CERT_FILES.map((name) => readFileSync(join(certDir, name)));
  return cached;
}
