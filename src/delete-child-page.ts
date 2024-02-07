import { deleteBlock } from './delete-block.js'
import { getNotionClient } from './get-notion-client.js'

export async function deleteChildPages(page_id: string): Promise<void> {
  const notion = getNotionClient()

  const res = await notion.blocks.children.list({
    block_id: page_id,
  })

  for (const block of res.results) {
    if ('type' in block && block.type === 'child_page') {
      await deleteBlock(block.id)
    }
  }
}
