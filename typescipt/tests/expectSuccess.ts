export function expectSuccess<T>(result: { state: "success", result: T } | { state: "failed", errorMessage: string }) {
  if (result.state == "failed") {
    throw new Error(result.errorMessage)
  }
  return result.result;
}