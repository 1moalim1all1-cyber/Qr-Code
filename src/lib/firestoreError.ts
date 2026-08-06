// Wraps a Firestore operation so failures surface a clear, labeled Arabic
// message in the UI instead of an unhandled/generic "Missing or
// insufficient permissions" error with no indication of which write failed.
export async function withFirestoreError<T>(label: string, fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`[${label}]`, err)
    throw new Error(`${label}: ${err instanceof Error ? err.message : String(err)}`)
  }
}
