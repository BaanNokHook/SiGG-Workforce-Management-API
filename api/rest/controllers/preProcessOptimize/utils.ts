export function combinePathForResponse(
  date: string,
  outputPath: string | undefined,
  zoneName: string | undefined,
): string {
  if (outputPath && outputPath !== '') {
    return outputPath;
  }

  return `${zoneName || 'example_zone'}/input_${date}.json`;
}
