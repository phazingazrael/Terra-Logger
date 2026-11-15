export type ErrorDetails = {
  name: string;
  message: string;
  stack?: string;
  code?: string;
  cause?: ErrorDetails;
  errors?: ErrorDetails[];
};

/** Keep worker errors and nested causes readable without serializing map data. */
export function errorDetails(error: unknown, seen = new Set<unknown>()): ErrorDetails {
  if (seen.has(error)) return { name: "Error", message: "Repeated or circular error reference" };
  if (error === null || typeof error !== "object") {
    return { name: "Error", message: String(error) };
  }
  seen.add(error);
  const value = error as Record<string, unknown>;
  return {
    name: typeof value.name === "string" ? value.name : "Error",
    message: typeof value.message === "string" ? value.message : String(error),
    stack: typeof value.stack === "string" ? value.stack : undefined,
    code: value.code == null ? undefined : String(value.code),
    cause: value.cause === undefined ? undefined : errorDetails(value.cause, seen),
    errors: Array.isArray(value.errors) ? value.errors.map((item) => errorDetails(item, seen)) : undefined,
  };
}

export function restoreError(details: ErrorDetails): Error {
  return Object.assign(new Error(details.message), details);
}
