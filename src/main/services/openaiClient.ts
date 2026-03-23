import OpenAI from 'openai'

let client: OpenAI | null = null
let currentApiKey: string | null = null

export function initOpenAI(apiKey: string): void {
  client = new OpenAI({ apiKey })
  currentApiKey = apiKey
}

export function getOpenAIClient(): OpenAI {
  if (!client) throw new Error('OpenAI 클라이언트가 초기화되지 않았습니다. API 키를 먼저 설정해주세요.')
  return client
}

export function isOpenAIReady(): boolean {
  return client !== null && !!currentApiKey
}

export async function testOpenAIConnection(): Promise<{ ok: boolean; error?: string }> {
  if (!client) return { ok: false, error: 'API 키가 설정되지 않았습니다.' }
  try {
    await client.models.list()
    return { ok: true }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? '연결 실패' }
  }
}
