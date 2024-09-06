export function isError(error: any): error is Error {
  const name = error?.constructor?.name;
  return name ? name.includes("Error") : false;
}
