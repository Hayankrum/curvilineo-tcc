export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

export function truncateHtml(html: string, maxLength: number): string {
  const text = stripHtml(html)
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
