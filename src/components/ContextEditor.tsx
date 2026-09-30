import { useState } from 'react'
import type { ContextBlock } from '../lib/context'
import { Modal } from './Modal'
import { Icon } from './Icon'

export function ContextEditor({ block, onSave, onClose, onDelete, position, total }: {
  block: ContextBlock; onSave: (block: ContextBlock, position: number) => void; onClose: () => void;
  onDelete?: () => void; position: number; total: number;
}) {
  const [edited, setEdited] = useState(block)
  const [order, setOrder] = useState(position)
  return <Modal title={onDelete ? `Edit context / ${block.name}` : 'Add context'} onClose={onClose} wide>
    <form onSubmit={event => { event.preventDefault(); if (edited.name.trim()) { onSave({ ...edited, name: edited.name.trim() }, order); onClose() } }}>
      <p className="modal-description">This is the actual source. Your changes appear in the next request.</p>
      <div className="form-row"><label>Source name<input autoFocus value={edited.name} required maxLength={100} onChange={event => setEdited({ ...edited, name: event.target.value })} placeholder="notes.md" /></label><label>Type<select value={edited.kind} onChange={event => setEdited({ ...edited, kind: event.target.value as ContextBlock['kind'] })}><option value="file">File</option><option value="system">System</option><option value="history">History</option><option value="tool">Tool schema</option></select></label></div>
      <label className="content-label">{edited.kind === 'tool' ? 'Full function tool schema · JSON' : 'Source content'}<textarea className="source-editor" spellCheck={false} value={edited.content} onChange={event => setEdited({ ...edited, content: event.target.value })} /></label>
      <div className="editor-options"><label className="checkbox-label"><input type="checkbox" checked={edited.enabled} onChange={event => setEdited({ ...edited, enabled: event.target.checked })} />Include in request</label>{onDelete ? <div className="order-buttons"><span>Position {order + 1} / {total}</span><button type="button" className="icon-button" aria-label="Move source earlier" disabled={order === 0} onClick={() => setOrder(order - 1)}><Icon name="up" /></button><button type="button" className="icon-button" aria-label="Move source later" disabled={order === total - 1} onClick={() => setOrder(order + 1)}><Icon name="down" /></button></div> : null}</div>
      <div className="modal-actions">{onDelete ? <button type="button" className="text-button danger" onClick={onDelete}>Remove source</button> : <span /> }<div><button type="button" className="text-button" onClick={onClose}>Cancel</button><button type="submit" className="primary-button">{onDelete ? 'Save changes' : 'Add source'}<Icon name="check" /></button></div></div>
    </form>
  </Modal>
}
