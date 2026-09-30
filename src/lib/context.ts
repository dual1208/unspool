/** A deliberately small, inspectable request builder. It adds no hidden text. */
export type ContextBlock = {
  id: string
  name: string
  kind: 'system' | 'file' | 'history' | 'tool'
  content: string
  enabled: boolean
}

export type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
}

export type ModelId = 'demo-balanced' | 'demo-concise'

export type FunctionTool = {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, { type: string; description?: string }>
      required?: string[]
      additionalProperties?: boolean
    }
  }
}

export type RequestPayload = {
  model: ModelId
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  tools?: FunctionTool[]
}

const readFileTool: FunctionTool = {
  type: 'function',
  function: {
    name: 'read_file',
    description: 'Read a file explicitly selected by the user.',
    parameters: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Path of the selected file.' } },
      required: ['path'],
      additionalProperties: false,
    },
  },
}

export const INITIAL_PROMPT = 'Explain this project in three sentences.'

export const seedBlocks: ContextBlock[] = [
  {
    id: 'system', name: 'system.md', kind: 'system', enabled: true,
    content: 'You are helping design a minimal AI harness. Be concise. Use only the supplied context. Explain what evidence supports your answer. The interface must show every instruction, source, conversation message, and tool schema sent to the model.',
  },
  {
    id: 'readme', name: 'README.md', kind: 'file', enabled: true,
    content: '# hello-world\n\nA deliberately small starting point.\nOne function. One clear purpose.',
  },
  {
    id: 'source', name: 'src/hello.ts', kind: 'file', enabled: true,
    content: 'export function greet(name: string): string {\n  return `Hello, ${name}.`;\n}\n',
  },
  {
    id: 'history', name: 'Recent conversation', kind: 'history', enabled: false,
    content: 'User: Keep the harness small enough to understand in one sitting.\nAssistant: Make the selected context and the exact outgoing request visible together.',
  },
  {
    id: 'tool', name: 'read_file', kind: 'tool', enabled: true,
    content: JSON.stringify(readFileTool, null, 2),
  },
]

/** Tool content is the actual schema, so edits affect the outgoing request. */
function parseTool(block: ContextBlock): FunctionTool {
  let value: FunctionTool
  try {
    value = JSON.parse(block.content) as FunctionTool
  } catch {
    throw new Error(`${block.name}: tool schema must be valid JSON.`)
  }
  if (
    value?.type !== 'function' || !value.function ||
    typeof value.function.name !== 'string' || !value.function.name.trim() ||
    typeof value.function.description !== 'string' ||
    value.function.parameters?.type !== 'object' ||
    !value.function.parameters.properties ||
    typeof value.function.parameters.properties !== 'object'
  ) {
    throw new Error(`${block.name}: expected a function tool with an object parameter schema.`)
  }
  return value
}

export function buildRequest(
  blocks: ContextBlock[], messages: Message[], draft: string, model: ModelId,
): RequestPayload {
  const payload: RequestPayload = { model, messages: [] }
  const tools: FunctionTool[] = []
  for (const block of blocks) {
    if (!block.enabled) continue
    if (block.kind === 'tool') {
      tools.push(parseTool(block))
    } else {
      payload.messages.push({
        role: block.kind === 'system' ? 'system' : 'user',
        content: block.kind === 'system' ? block.content :
          `[BEGIN CONTEXT: ${block.name} (${block.kind})]\n${block.content}\n[END CONTEXT: ${block.name}]`,
      })
    }
  }
  payload.messages.push(...messages.map(({ role, content }) => ({ role, content })))
  if (draft.trim()) payload.messages.push({ role: 'user', content: draft })
  if (tools.length) payload.tools = tools
  return payload
}

/** Rough estimate only; this is not a model-specific tokenizer. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

/** Local deterministic preview. No inference, network request, or tool execution. */
export function simulateResponse(payload: RequestPayload): string {
  const lastUser = [...payload.messages].reverse().find(message =>
    message.role === 'user' && !message.content.startsWith('[BEGIN CONTEXT: '))
  const prompt = lastUser?.content ?? ''
  const sources = payload.messages.filter(message => message.content.startsWith('[BEGIN CONTEXT: '))
  const names = sources.map(message =>
    message.content.slice('[BEGIN CONTEXT: '.length).split(' (')[0])
  const systemCount = payload.messages.filter(message => message.role === 'system').length
  const tools = payload.tools?.map(tool => tool.function.name) ?? []
  const inventory = `${sources.length} context source${sources.length === 1 ? '' : 's'} (${names.join(', ') || 'none'}), ${systemCount} system instruction${systemCount === 1 ? '' : 's'}, and ${tools.length} tool schema${tools.length === 1 ? '' : 's'}`
  if (!prompt) return `Local simulation: no user prompt was included. The request contains ${inventory}.`
  if (prompt.trim() === INITIAL_PROMPT) {
    const readme = sources.find(message => message.content.includes('[BEGIN CONTEXT: README.md (file)]'))
    const readmeLines = readme?.content.split('\n').slice(1, -1).filter(line => line.trim()) ?? []
    const meaningfulLine = readmeLines.find(line => !line.startsWith('#')) ?? readmeLines[0] ?? '(empty file)'
    const excerpt = meaningfulLine.length > 180 ? `${meaningfulLine.slice(0, 180)}…` : meaningfulLine
    const description = readme ?
      `The supplied README begins: “${excerpt}”` :
      'No project README is present in this request, so this simulation cannot describe its philosophy from that source.'
    return `${description}\nThis request includes ${inventory}.\nThis is a local simulation; no model was contacted and no tools were executed.`
  }
  const excerpt = prompt.length > 240 ? `${prompt.slice(0, 240)}…` : prompt
  if (payload.model === 'demo-concise') {
    return `Local simulation received: “${excerpt}”\nIncluded: ${inventory}. No inference or tool execution occurred.`
  }
  const evidence = sources[0]?.content.split('\n').slice(1, -1).join('\n') ?? ''
  const snippet = evidence.length > 180 ? `${evidence.slice(0, 180)}…` : evidence
  return `Local simulation received your prompt: “${excerpt}”\n\nThe request includes ${inventory}.${snippet ? `\nFirst source excerpt: ${snippet}` : '\nNo source excerpts were supplied.'}\n\nA connected model would answer using this visible request. This preview only reports its contents; no inference or tool execution occurred.`
}
