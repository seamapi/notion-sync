import type { BlockObjectRequest } from '@notionhq/client/build/src/api-endpoints'
import { markdownToBlocks } from '@tryfabric/martian'

import { deleteBlock } from './delete-block.js'
import { getNotionClient } from './get-notion-client.js'

export class FailedAddingBlocksException extends Error {
  page_id: string
  constructor(page_id: string, error: Error) {
    super('Failed to add blocks.')
    this.stack = error.stack
    this.page_id = page_id
  }
}

interface CreatePageParams {
  title: string
  content: string
  page_id: string
  attempt?: number
}

export default async function createPage(
  params: CreatePageParams
): Promise<void> {
  const { attempt = 1 } = params

  try {
    await tryCreatePage(params)
  } catch (error) {
    // If a page was created, deleted it to try again.
    if (error instanceof FailedAddingBlocksException) {
      await deleteBlock(error.page_id)
    }

    if (attempt < 3) {
      await createPage({ ...params, attempt: attempt + 1 })
    } else {
      throw error
    }
  }
}

async function tryCreatePage(params: CreatePageParams): Promise<void> {
  const { title, page_id, content } = params

  const notion = getNotionClient()

  const page = await notion.pages.create({
    parent: {
      page_id,
    },
    properties: {
      title: {
        title: [
          {
            text: {
              content: title,
            },
          },
        ],
      },
    },
    children: [],
  })

  const blocks = markdownToBlocks(content) as BlockObjectRequest[]

  try {
    await addContent(page.id, blocks)
  } catch (error) {
    if (error instanceof Error) {
      throw new FailedAddingBlocksException(page.id, error)
    }

    throw error
  }
}

async function addContent(
  page_id: string,
  blocks: BlockObjectRequest[]
): Promise<void> {
  const notion = getNotionClient()

  const chunks = getChunks(blocks)

  for (const chunk of chunks) {
    await notion.blocks.children.append({
      block_id: page_id,
      children: chunk,
    })
  }
}

/**
 * Max. block limit per API call
 * Reference: https://developers.notion.com/reference/request-limits#size-limits
 */
const max_chunk_size = 100

function getChunks(blocks: BlockObjectRequest[]): BlockObjectRequest[][] {
  const all_sections: BlockObjectRequest[][] = []

  for (let i = 0; i < blocks.length; i += max_chunk_size) {
    const chunk = blocks.slice(i, i + max_chunk_size)
    all_sections.push(chunk)
  }

  return all_sections
}
