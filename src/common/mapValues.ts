
export default function mapValues (
  obj: Record<string, unknown>,
  fn: (v: unknown) => unknown
): Record<string, unknown> {
  const copy: Record<string, unknown> = {}
  Object.keys(obj).forEach(k => {
    copy[k] = fn(obj[k])
  })
  return copy
}
