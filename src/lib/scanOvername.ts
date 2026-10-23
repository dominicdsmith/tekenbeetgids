/** Photo processing consent is never consent to adopt a questionnaire answer. */
export function bevestigdeScan<T>(resultaat: T | null, bevestigd: boolean): T | null {
  return bevestigd ? resultaat : null;
}