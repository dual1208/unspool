import assert from 'node:assert/strict'
import test from 'node:test'
import { buildRequest, estimateTokens, INITIAL_PROMPT, seedBlocks, simulateResponse } from './context.ts'

test('excludes disabled blocks completely, including disabled history', () => {
  const blocks = seedBlocks.map(block => ({ ...block, enabled: false }))
  assert.deepEqual(buildRequest(blocks, [], 'hello', 'demo-balanced'), {
    model: 'demo-balanced', messages: [{ role: 'user', content: 'hello' }],
  })
})

test('preserves source order then conversation then verbatim draft', () => {
  const blocks = [seedBlocks[2], seedBlocks[0], { ...seedBlocks[3], enabled: true }]
  const payload = buildRequest(blocks, [{ id: 'reply', role: 'assistant', content: 'Earlier answer' }], '  question  ', 'demo-balanced')
  assert.equal(payload.messages[0].content, `[BEGIN CONTEXT: src/hello.ts (file)]\n${seedBlocks[2].content}\n[END CONTEXT: src/hello.ts]`)
  assert.deepEqual(payload.messages[1], { role: 'system', content: seedBlocks[0].content })
  assert.ok(payload.messages[2].content.startsWith('[BEGIN CONTEXT: Recent conversation (history)]'))
  assert.deepEqual(payload.messages.slice(3), [
    { role: 'assistant', content: 'Earlier answer' }, { role: 'user', content: '  question  ' },
  ])
})

test('adds no hidden instructions and omits blank draft', () => {
  assert.deepEqual(buildRequest([], [], ' \n ', 'demo-concise'), { model: 'demo-concise', messages: [] })
  assert.deepEqual(buildRequest([], [{ id: 'u', role: 'user', content: 'visible only' }], '', 'demo-balanced'), {
    model: 'demo-balanced', messages: [{ role: 'user', content: 'visible only' }],
  })
})

test('request is a snapshot independent of subsequent context and message edits', () => {
  const blocks = seedBlocks.map(block => ({ ...block }))
  const messages = [{ id: 'u', role: 'user' as const, content: 'original' }]
  const payload = buildRequest(blocks, messages, '', 'demo-balanced')
  const snapshot = JSON.stringify(payload)
  blocks[0].content = 'changed'
  blocks[4].content = '{}'
  messages[0].content = 'changed'
  assert.equal(JSON.stringify(payload), snapshot)
})

test('uses the visible tool schema and excludes disabled tools', () => {
  const tool = { ...seedBlocks[4] }
  const parsed = JSON.parse(tool.content)
  parsed.function.name = 'custom_reader'
  tool.content = JSON.stringify(parsed)
  assert.equal(buildRequest([tool], [], '', 'demo-balanced').tools?.[0].function.name, 'custom_reader')
  tool.enabled = false
  tool.content = 'invalid JSON but excluded'
  assert.equal(buildRequest([tool], [], '', 'demo-balanced').tools, undefined)
  tool.enabled = true
  assert.throws(() => buildRequest([tool], [], '', 'demo-balanced'), /valid JSON/)
})

test('simulation reflects arbitrary prompts and only included context', () => {
  const payload = buildRequest([], [], 'Tell me about sea turtles', 'demo-balanced')
  assert.match(simulateResponse(payload), /sea turtles/)
  assert.match(simulateResponse(payload), /0 context sources \(none\), 0 system instructions, and 0 tool schemas/)
  assert.doesNotMatch(simulateResponse(payload), /terminal-first/)
  assert.equal(simulateResponse(payload), simulateResponse(payload))
  assert.match(simulateResponse(buildRequest([], [], INITIAL_PROMPT, 'demo-balanced')), /No project README/)
  assert.match(simulateResponse(buildRequest(seedBlocks, [], INITIAL_PROMPT, 'demo-balanced')), /supplied README/)
})

test('token count is explicitly a character approximation', () => {
  assert.equal(estimateTokens(''), 0)
  assert.equal(estimateTokens('hello'), 2)
  assert.equal(estimateTokens('12345678'), 2)
})

test('simulation describes edited README content rather than hardcoded project semantics', () => {
  const blocks = seedBlocks.map(block => block.id === 'readme' ? { ...block, content: '# Ocean\n\nSea turtles swim across oceans.' } : { ...block })
  const response = simulateResponse(buildRequest(blocks, [], INITIAL_PROMPT, 'demo-balanced'))
  assert.match(response, /Sea turtles swim across oceans/)
  assert.doesNotMatch(response, /terminal-first|small starting point/)
})
