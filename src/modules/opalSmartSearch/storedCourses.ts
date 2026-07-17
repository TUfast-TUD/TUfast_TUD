import type { OpalStoredCourse } from './types'
import { normalizeAllowedOpalUrl } from './urlPolicy'

export function readStoredCourses(value: unknown): OpalStoredCourse[] {
  if (Array.isArray(value)) return value as OpalStoredCourse[]
  if (typeof value !== 'string') return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function readStoredCourseTitle(course: OpalStoredCourse): string {
  if (typeof course.title === 'string' && course.title.trim()) return course.title
  if (typeof course.name === 'string' && course.name.trim()) return course.name
  return ''
}

export function readStoredCourseUrl(course: OpalStoredCourse): string | null {
  const rawUrl =
    typeof course.href === 'string' && course.href.trim()
      ? course.href
      : typeof course.link === 'string' && course.link.trim()
        ? course.link
        : undefined

  return rawUrl ? normalizeAllowedOpalUrl(rawUrl) : null
}

export function uniqueStoredCourses(courses: OpalStoredCourse[]): OpalStoredCourse[] {
  const seen = new Set<string>()
  const unique: OpalStoredCourse[] = []

  for (const course of courses) {
    const title = readStoredCourseTitle(course)
    const url = readStoredCourseUrl(course)
    if (!title || !url || seen.has(url)) continue
    seen.add(url)
    unique.push({ ...course, title, href: url })
  }

  return unique
}
