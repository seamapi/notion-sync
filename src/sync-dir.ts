import fs from 'fs'

import createPage from './create-page.js'
import { deleteChildPages } from './delete-child-page.js'
import { parseMarkdown } from './parse-markdown.js'

interface SyncDirParams {
  dir: string
  page_id: string
}

export async function syncDir(params: SyncDirParams): Promise<void> {
  const { page_id, dir } = params
  const files = fs.readdirSync(dir)

  // Clear existing pages
  await deleteChildPages(page_id)

  for (const file of files) {
    // Only read .md files
    if (!file.includes('.md')) {
      continue
    }

    const data = fs.readFileSync(`./${dir}/${file}`, 'utf-8')

    const markdown = parseMarkdown(data)

    if (markdown == null) {
      continue
    }

    await createPage({
      title: markdown.title,
      content: markdown.content,
      page_id,
    })
  }
}
