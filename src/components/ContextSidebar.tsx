import type { ContextBlock } from '../lib/context'
import { Icon } from './Icon'

type Props = {
  blocks: ContextBlock[]; tokens: number; selectedId: string | null;
  onToggle: (id: string) => void; onEdit: (id: string) => void; onAdd: () => void;
}
export function ContextSidebar({ blocks, tokens, selectedId, onToggle, onEdit, onAdd }: Props) {
  const enabled = blocks.filter(block => block.enabled).length
  const percent = Math.min(100, tokens / 8192 * 100)
  return <aside className="context-pane" aria-label="Context sources">
    <div className="context-heading"><h2>CONTEXT</h2><span>{String(enabled).padStart(2, '0')} / {String(blocks.length).padStart(2, '0')}</span></div>
    <p className="pane-description">You decide what gets sent.</p>
    <div className="source-list">
      {blocks.map(block => <div className={`source-row ${!block.enabled ? 'source-excluded' : ''} ${selectedId === block.id ? 'source-selected' : ''}`} key={block.id}>
        <input type="checkbox" checked={block.enabled} onChange={() => onToggle(block.id)} aria-label={`Include ${block.name}`} />
        <button className="source-button" onClick={() => onEdit(block.id)} title={`Edit ${block.name}`}><Icon name={block.kind === 'tool' ? 'terminal' : 'file'} /><span className="source-name">{block.name}</span><span className="source-kind">{block.kind}</span></button>
      </div>)}
    </div>
    <button className="outline-button add-context" onClick={onAdd}><Icon name="plus" />Add context</button>
    <div className="context-budget">
      <h3>CONTEXT BUDGET</h3>
      <div className={`budget-track ${tokens > 8192 ? 'budget-over' : ''}`} role="meter" aria-label="Estimated context usage" aria-valuemin={0} aria-valuemax={8192} aria-valuenow={Math.min(tokens, 8192)} aria-valuetext={`${tokens} estimated tokens of 8192 demonstration budget`}><span style={{ width: `${percent}%` }} /></div>
      <p>~{tokens.toLocaleString()} <span>/ 8,192 tokens</span></p>
      <p className="muted">Estimates, not a tokenizer.</p>
      {tokens > 8192 ? <p className="budget-warning">Demo budget exceeded. Nothing is silently trimmed.</p> : null}
    </div>
    <p className="context-motto">Explicit in. Explicit out.</p>
  </aside>
}
