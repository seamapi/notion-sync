export function parseMarkdown(data: string): {
  title: string
  content: string
} | null {
  const [first_line, ...rest] = data.split('\n')
  if (first_line == null) {
    return null
  }

  const title = first_line.replace('#', '').trim()
  const content = rest.join('\n')

  // Notion errors on invalid links
  const without_page_links = content
    .replace(/\[([^\]]*)\]\(#[^)]*\)/g, '$1') // anchors
    .replace(/\[(.*)\]\(\.[^)]*\)/g, '$1') // relative pages
    .replace(/\[(.*)\]\[[^)]*\]/g, '$1') // page links

  return {
    title,
    content: without_page_links,
  }
}
