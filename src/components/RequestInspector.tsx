import { useState } from 'react'
import type { RequestPayload } from '../lib/context'

type Props = {
  payload: RequestPayload | null
  error: string | null
  sourceCount: number
  snapshotLabel?: string
  onLive: () => void
}

function Icon({ kind }: { kind: 'copy' | 'download' | 'check' }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {kind === 'copy' && <><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4" /></>}
    {kind === 'download' && <><path d="M12 3v12m-5-5 5 5 5-5M4 16v4h16v-4" /></>}
    {kind === 'check' && <path d="m5 12 4 4L19 6" />}
  </svg>
}

export function RequestInspector({ payload, error, sourceCount, snapshotLabel, onLive }: Props) {
  const [tab, setTab] = useState<'readable' | 'json'>('readable')
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const json = payload ? JSON.stringify(payload, null, 2) : ''

  async function copyRequest() {
    if (!payload) return
    try {
      await navigator.clipboard.writeText(json)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('failed')
    }
    window.setTimeout(() => setCopyStatus('idle'), 2500)
  }

  function exportRequest() {
    if (!payload) return
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = snapshotLabel ? 'request-snapshot.json' : 'next-request.json'
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return <section className="request-pane" aria-label="Exact model request">
    <header className="pane-header request-header">
      <h2>02 REQUEST</h2>
      <div className="request-tabs" role="tablist" aria-label="Request format" onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); const next = tab === 'json' ? 'readable' : 'json'; setTab(next); document.getElementById(`request-${next}-tab`)?.focus() } }}>
        <button type="button" role="tab" id="request-readable-tab" aria-selected={tab === 'readable'} aria-controls="request-preview" className={tab === 'readable' ? 'active' : ''} onClick={() => setTab('readable')}>Readable</button>
        <button type="button" role="tab" id="request-json-tab" aria-selected={tab === 'json'} aria-controls="request-preview" className={tab === 'json' ? 'active' : ''} onClick={() => setTab('json')}>JSON</button>
      </div>
    </header>

    <div className="request-meta">
      <div>
        <span className="eyebrow">{snapshotLabel ? 'RUN SNAPSHOT' : 'NEXT REQUEST'}</span>
        {snapshotLabel && <div className="snapshot-label">{snapshotLabel} <button type="button" className="back-to-live" onClick={onLive}>Back to live</button></div>}
      </div>
      <div className="request-actions">
        <button type="button" className="copy-button" disabled={!payload} onClick={copyRequest} title="Copy complete request JSON" aria-label="Copy complete request JSON">
          <Icon kind={copyStatus === 'copied' ? 'check' : 'copy'} />
          {copyStatus === 'copied' ? 'Copied' : copyStatus === 'failed' ? 'Copy failed' : 'Copy'}
        </button>
        <button type="button" className="icon-button" disabled={!payload} onClick={exportRequest} title="Download complete request JSON" aria-label="Download complete request JSON"><Icon kind="download" /></button>
      </div>
    </div>
    <span className="sr-only" role="status" aria-live="polite">{copyStatus === 'failed' ? 'Clipboard unavailable. Use Download to save the complete request.' : copyStatus === 'copied' ? 'Complete request JSON copied.' : ''}</span>

    <div className="request-preview" id="request-preview" role="tabpanel" aria-labelledby={tab === 'readable' ? 'request-readable-tab' : 'request-json-tab'}>
      {error && <div className="request-error" role="alert">{error}</div>}
      {!payload && !error && <p className="request-empty">Your request will appear here.</p>}
      {payload && (tab === 'json' ? <pre className="json-content">{json}</pre> : <>
        <div className="request-block request-model"><div className="request-block-header"><span className="request-role">model</span></div><pre className="code-content">{JSON.stringify(payload.model)}</pre></div>
        {payload.messages.length === 0 && <div className="request-block"><div className="request-block-header"><span className="request-role">messages</span></div><pre className="code-content">[]</pre></div>}
        {payload.messages.map((message, index) => {
          const source = /^\[BEGIN CONTEXT: (.+) \((?:file|history)\)\]/.exec(message.content)?.[1]
          return <div className="request-block" key={index}>
            <div className="request-block-header"><span className="request-role">{message.role}</span><span className="request-source">{source ?? `messages[${index}]`}</span></div>
            <pre className="code-content">{message.content}</pre>
          </div>
        })}
        {payload.tools !== undefined && <div className="request-block request-tools"><div className="request-block-header"><span className="request-role">tools</span><span className="request-source">{payload.tools.length} available</span></div><pre className="code-content">{JSON.stringify(payload.tools, null, 2)}</pre></div>}
      </>)}
    </div>

    <footer className="request-footer"><Icon kind="check" /><span>{sourceCount} sources · exact request preview</span></footer>
  </section>
}

export default RequestInspector
