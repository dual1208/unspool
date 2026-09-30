import { useEffect, useRef, useState } from 'react'
import { buildRequest, estimateTokens, INITIAL_PROMPT, seedBlocks, simulateResponse } from './lib/context'
import type { ContextBlock, Message, ModelId, RequestPayload } from './lib/context'
import { ContextSidebar } from './components/ContextSidebar'
import { ContextEditor } from './components/ContextEditor'
import { RequestInspector } from './components/RequestInspector'
import { Modal } from './components/Modal'
import { Icon } from './components/Icon'

type Run = { id: string; payload: RequestPayload; sourceCount: number; prompt: string; response: string }
type Workspace = { blocks: ContextBlock[]; messages: Message[]; runs: Run[]; draft: string; model: ModelId; includeHistory: boolean }
const STORAGE_KEY = 'unspool.workspace.v1'
const REPOSITORY = 'https://github.com/dual1208/unspool'
const freshWorkspace = (): Workspace => ({ blocks: structuredClone(seedBlocks), messages: [], runs: [], draft: INITIAL_PROMPT, model: 'demo-balanced', includeHistory: true })

function loadWorkspace(): Workspace {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return freshWorkspace()
    const saved = JSON.parse(raw)
    if (!Array.isArray(saved.blocks) || !saved.blocks.every((b: ContextBlock) => typeof b.id === 'string' && typeof b.name === 'string' && typeof b.content === 'string' && ['file', 'system', 'history', 'tool'].includes(b.kind) && typeof b.enabled === 'boolean') || !Array.isArray(saved.messages) || !saved.messages.every((m: Message) => ['user', 'assistant'].includes(m.role) && typeof m.content === 'string') || !Array.isArray(saved.runs) || !saved.runs.every((r: Run) => typeof r.id === 'string' && typeof r.prompt === 'string' && typeof r.response === 'string' && Array.isArray(r.payload?.messages)) || typeof saved.draft !== 'string' || typeof saved.includeHistory !== 'boolean' || !['demo-balanced', 'demo-concise'].includes(saved.model)) return freshWorkspace()
    return saved
  } catch { return freshWorkspace() }
}

export function App() {
  const [workspace, setWorkspace] = useState(loadWorkspace)
  const [selectedRun, setSelectedRun] = useState<string | null>(null)
  const [editor, setEditor] = useState<string | null>(null)
  const [newBlock, setNewBlock] = useState<ContextBlock | null>(null)
  const [modal, setModal] = useState<'philosophy' | 'reset' | 'new' | 'shortcuts' | null>(null)
  const [notice, setNotice] = useState('')
  const [storageError, setStorageError] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const transcriptRef = useRef<HTMLDivElement>(null)
  const { blocks, messages, runs, draft, model, includeHistory } = workspace
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace)); setStorageError(false) } catch { setStorageError(true) } }, [workspace])
  useEffect(() => { transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }) }, [runs.length])
  useEffect(() => { if (notice) { const timer = setTimeout(() => setNotice(''), 4000); return () => clearTimeout(timer) } }, [notice])

  let livePayload: RequestPayload | null = null
  let error: string | null = null
  try { livePayload = buildRequest(blocks, includeHistory ? messages : [], draft, model) } catch (cause) { error = cause instanceof Error ? cause.message : 'Unable to build request.' }
  const activeRun = runs.find(run => run.id === selectedRun)
  const payload = activeRun?.payload ?? livePayload
  const sourceCount = blocks.filter(block => block.enabled).length
  const tokens = livePayload ? estimateTokens(JSON.stringify(livePayload)) : 0
  const editBlock = editor === 'add' ? newBlock : blocks.find(block => block.id === editor)
  const change = (patch: Partial<Workspace>) => { setWorkspace(current => ({ ...current, ...patch })); setSelectedRun(null) }
  const run = () => {
    if (activeRun) { setSelectedRun(null); setNotice('Review the next request, then press Run.'); return }
    if (!draft.trim() || !livePayload) return
    const id = crypto.randomUUID()
    const response = simulateResponse(livePayload)
    const newRun: Run = { id, payload: structuredClone(livePayload), sourceCount, prompt: draft, response }
    setWorkspace(current => ({ ...current, draft: '', messages: [...current.messages, { id: `${id}-user`, role: 'user', content: draft }, { id: `${id}-assistant`, role: 'assistant', content: response }], runs: [...current.runs, newRun] }))
    setSelectedRun(id)
    setNotice('Simulation complete. The exact request is preserved on the right.')
  }
  const newSession = () => { change({ messages: [], runs: [], draft: INITIAL_PROMPT }); setModal(null); setNotice('New session. Your context sources are retained.') }

  return <div className="app-shell">
    <header className="masthead"><a className="wordmark" href="#playground" aria-label="Unspool home">unspool<span>_</span></a><span className="company">by BARE SIGNAL</span><nav aria-label="Main navigation"><a className="active" href="#playground">Playground</a><button className="nav-button" onClick={() => setModal('philosophy')}>Philosophy</button><a href={REPOSITORY} target="_blank" rel="noreferrer">GitHub <span aria-hidden="true">↗</span></a></nav></header>
    <main id="playground">
      <section className="intro"><div><h1>Less magic. More signal.</h1><p>A minimal harness. An open context. Nothing up its sleeve.</p></div><div className="demo-label"><span className="status-ring" /><div>Interactive demo<small>Local simulation · no API key needed</small></div></div></section>
      <section className="workbench" aria-label="Interactive harness playground">
        <div className="workspace-toolbar"><div className="workspace-name"><Icon name="terminal" size={24} /><span>workspace <span className="muted">/</span> hello-world</span></div><div className="workspace-status"><span className="status-dot" /><span>All context visible</span><button className="icon-button reset-button" aria-label="Reset demo" title="Reset demo" onClick={() => setModal('reset')}><Icon name="reset" size={18} /></button></div></div>
        <div className="workspace-grid">
          <ContextSidebar blocks={blocks} tokens={tokens} selectedId={editor ?? 'readme'} onToggle={id => change({ blocks: blocks.map(block => block.id === id ? { ...block, enabled: !block.enabled } : block) })} onEdit={setEditor} onAdd={() => { setNewBlock({ id: crypto.randomUUID(), name: '', kind: 'file', content: '', enabled: true }); setEditor('add') }} />
          <section className="session-pane" aria-label="Session">
            <div className="pane-header"><h2><span>01</span> SESSION</h2><button className="text-button" onClick={() => runs.length ? setModal('new') : newSession()}><Icon name="plus" />New session</button></div>
            <div className="session-meta"><span>hello-world / {runs.length ? `run ${String(runs.length).padStart(2, '0')}` : 'first look'}</span><label title="Include this session's user and assistant messages in the next request"><input type="checkbox" checked={includeHistory} onChange={event => change({ includeHistory: event.target.checked })} />Session history{messages.length ? ` (${messages.length})` : ''}</label></div>
            <div className="transcript" ref={transcriptRef}>
              <div className="welcome"><span className="role-label">unspool</span><h3>Start with a little context.</h3><p>Choose your sources on the left.<br />Inspect the exact request on the right.</p></div>
              {!runs.length ? <div className="empty-session"><span className="empty-symbol" aria-hidden="true">[ <span>_</span> ]</span><p>A good conversation starts<br />with knowing what goes in.</p><button className="text-button" onClick={() => { inputRef.current?.focus(); setNotice('Your first prompt is ready. Edit it, or press Run.') }}>Your first prompt is ready<Icon name="arrow" /></button></div> : runs.map((item, index) => <article className="exchange" key={item.id}><div className="message"><div className="message-heading"><span className="role-label">you</span><span className="turn-index">{String(index + 1).padStart(2, '0')}</span></div><p>{item.prompt}</p></div><div className="message assistant-message"><div className="message-heading"><span className="role-label">unspool</span><span className="simulation-tag">SIMULATED RESPONSE</span></div><p>{item.response}</p><button className={`inspect-run text-button ${selectedRun === item.id ? 'selected' : ''}`} onClick={() => setSelectedRun(item.id)}><Icon name="file" />Inspect this request<Icon name="arrow" /></button></div></article>)}
            </div>
            <form className="composer-wrap" onSubmit={event => { event.preventDefault(); run() }}><div className="composer"><textarea ref={inputRef} aria-label="Your prompt" placeholder="What would you like to explore?" value={draft} onChange={event => change({ draft: event.target.value })} onKeyDown={event => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) { event.preventDefault(); run() } }} /><div className="composer-actions"><select aria-label="Simulation model" value={model} onChange={event => change({ model: event.target.value as ModelId })}><option value="demo-balanced">demo / balanced</option><option value="demo-concise">demo / concise</option></select><button className="primary-button" disabled={!draft.trim() || !!error} type="submit">{activeRun ? 'Review next' : 'Run'} <span aria-hidden="true">↵</span></button></div></div><div className="composer-help"><button type="button" onClick={() => setModal('shortcuts')}>⌘ / Ctrl Enter to run</button><span>{storageError ? 'Session saving unavailable' : 'Runs stay in this browser'}</span></div></form>
          </section>
          <RequestInspector payload={payload} error={activeRun ? null : error} sourceCount={activeRun?.sourceCount ?? sourceCount} snapshotLabel={activeRun ? `Run ${String(runs.indexOf(activeRun) + 1).padStart(2, '0')} · preserved` : undefined} onLive={() => setSelectedRun(null)} />
        </div>
      </section>
      <div className="workspace-footnote"><span><span className="small-bracket">[ ]</span> Click any source to edit it. Uncheck to leave it out.</span><span>No hidden prompts. No silent truncation.</span></div>
    </main>
    <footer className="site-footer"><span>Less machinery. More understanding.</span><span>Browser prototype <span className="footer-dot">·</span> v0.1</span></footer>
    <div className={`toast ${notice ? 'visible' : ''}`} role="status">{notice}</div>
    {editBlock ? <ContextEditor key={editBlock.id} block={editBlock} position={editor === 'add' ? blocks.length : blocks.findIndex(block => block.id === editor)} total={blocks.length} onClose={() => setEditor(null)} onSave={(updated, position) => { const next = blocks.filter(block => block.id !== updated.id); next.splice(position, 0, updated); change({ blocks: next }); setNotice('Context updated. The live request reflects your changes.') }} onDelete={editor !== 'add' ? () => { change({ blocks: blocks.filter(block => block.id !== editor) }); setEditor(null); setNotice('Source removed from the next request.') } : undefined} /> : null}
    {modal === 'philosophy' ? <Modal title="The Bare Signal philosophy" onClose={() => setModal(null)} wide><div className="philosophy"><p className="philosophy-headline">See what you send.</p><p>Unspool is a minimal AI harness for developers who want to control exactly what a model receives. Choose your context, inspect the complete request, and keep a record of every run. A harness prepares model inputs and manages the conversation; this browser demo simulates that workflow locally.</p><ol><li><strong>Context is the interface.</strong><p>Every instruction, source, conversation message, and tool schema is visible before a run. The preview is built from the same object used by the simulation.</p></li><li><strong>Nothing slips in.</strong><p>You select the sources. You can edit them, reorder them, or leave them out. Conversation history has an explicit switch. Nothing is silently summarized or truncated.</p></li><li><strong>Leave a readable trail.</strong><p>Every run preserves its request. Later edits cannot rewrite what happened. Copy or download it to see for yourself.</p></li><li><strong>Keep the machinery small.</strong><p>One session, one context list, one request. A keyboard-friendly browser sketch of a future terminal UI.</p></li></ol><div className="philosophy-note">This prototype uses a deterministic local simulation. It does not contact a model, execute tools, or read your filesystem. Token counts are character-based estimates. Your workspace is saved in this browser.</div><p className="naming-note">Bare Signal and Unspool are working brand names. Naming rationale and existing uses are documented on GitHub.</p></div></Modal> : null}
    {modal === 'reset' || modal === 'new' ? <Modal title={modal === 'reset' ? 'Reset the playground?' : 'Start a new session?'} onClose={() => setModal(null)}><p className="modal-description">{modal === 'reset' ? 'This removes your local edits and run history, then restores the original example.' : 'This clears the current conversation and request snapshots. Your context sources stay as they are.'}</p><div className="modal-actions"><span /><div><button className="text-button" onClick={() => setModal(null)}>Keep working</button><button className="primary-button" onClick={() => { if (modal === 'new') newSession(); else { setWorkspace(freshWorkspace()); setSelectedRun(null); setModal(null); setNotice('Original example restored.') } }}>{modal === 'reset' ? 'Reset demo' : 'New session'}<Icon name="arrow" /></button></div></div></Modal> : null}
    {modal === 'shortcuts' ? <Modal title="A little less mouse" onClose={() => setModal(null)}><dl className="shortcuts"><div><dt>Run your prompt</dt><dd>⌘ / Ctrl + Enter</dd></div><div><dt>Move between controls</dt><dd>Tab / Shift + Tab</dd></div><div><dt>Toggle selected context</dt><dd>Space</dd></div><div><dt>Close a dialog</dt><dd>Esc</dd></div></dl></Modal> : null}
  </div>
}
