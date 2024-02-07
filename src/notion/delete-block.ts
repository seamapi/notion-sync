import type { DeleteBlockResponse } from '@notionhq/client/build/src/api-endpoints'

import { getNotionClient } from './get-notion-client.js'

export async function deleteBlock(
  block_id: string
): Promise<DeleteBlockResponse> {
  const notion = getNotionClient()
  return await notion.blocks.delete({ block_id })
}
