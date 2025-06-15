
/**
 * Recursively finds and returns the first .output string in any object or array.
 */
export function extractOutput(obj: any): string | null {
  if (!obj || typeof obj !== "object") return null;
  if (typeof obj.output === "string" && obj.output.trim()) return obj.output;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const res = extractOutput(item);
      if (res) return res;
    }
  } else {
    for (const key of Object.keys(obj)) {
      const res = extractOutput(obj[key]);
      if (res) return res;
    }
  }
  return null;
}
