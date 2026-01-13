/**
 * Extract a 4-digit year from various date string formats
 * Examples: "November 11, 2024", "2024", "2024-11-11", "Nov 2024"
 * Validates that the year is reasonable (1450-2100)
 */
export function extractYear(dateString: string | number | undefined): number | undefined {
  if (!dateString) return undefined

  // Convert to string if it's a number
  const str = String(dateString)

  // Look for a 4-digit year in the string
  const yearMatch = str.match(/\b(1[4-9]\d{2}|20\d{2}|21[0-9]{2})\b/)
  if (yearMatch) {
    const year = parseInt(yearMatch[0])
    // Additional validation: year should be between 1450 (printing press) and 2100
    if (year >= 1450 && year <= 2100) {
      return year
    }
  }

  return undefined
}
