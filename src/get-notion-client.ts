import { Client } from '@notionhq/client'

export const getNotionClient = (): Client => {
  return new Client({
    auth: process.env['NOTION_API_KEY'],
  })
}
