export function shouldRecommendSmartSearchImprove(
  courseUrls: string[],
  successfulRuns: Record<string, number>,
  now = new Date()
): boolean {
  if (courseUrls.length === 0) return false
  if (courseUrls.some((url) => !successfulRuns[url])) return true

  const month = now.getMonth()
  if ((month !== 3 && month !== 9) || now.getDate() > 7) return false

  const semesterStart = new Date(now.getFullYear(), month, 1).getTime()
  return courseUrls.some((url) => successfulRuns[url] < semesterStart)
}
