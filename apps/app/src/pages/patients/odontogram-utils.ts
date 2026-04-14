// The react-odontogram library only renders FDI quadrants 1-4. Primary
// (deciduous) teeth use FDI quadrants 5-8, so the app overlays a second
// Odontogram instance and remaps the raw FDI reported by the library.
// Example: "11" → "51", "25" → "65", "35" → "75", "45" → "85".
export function remapPrimaryFdi(rawFdi: string): string {
  if (rawFdi.length !== 2) return rawFdi
  const quadrant = Number(rawFdi[0])
  const position = rawFdi[1]
  if (!Number.isInteger(quadrant) || quadrant < 1 || quadrant > 4) return rawFdi
  return `${quadrant + 4}${position}`
}
