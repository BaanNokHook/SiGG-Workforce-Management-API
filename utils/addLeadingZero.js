export function addLeadingZero(seq: string, len: number): string {
  let result = String(seq)

  while (result.length < len) {
    result = `0${result}`
  }

  return result
}
