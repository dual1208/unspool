# Unspool: product philosophy

Unspool is a minimal AI harness concept built around one promise: **see what you send**. Context engineering should be an ordinary, visible editing task. The user can inspect the instructions, sources, conversation history, and tool definitions that make up a request before sending it.

The web app is an interactive demonstrator of a future terminal interface. It uses a deterministic local simulation; it does not call a live model. A simulated response illustrates the relationship between selected context and the resulting answer, rather than demonstrating model quality.

## One workspace, three panes

1. **Sources:** the available context blocks, their origin, and whether each is included. Users can select, edit, and toggle individual blocks.
2. **Session:** the conversation, composer, and run status. History is an explicit input that can be included or excluded.
3. **Exact request:** the assembled request body in its actual order, including message roles and enabled tool schemas. This view updates as the user edits the next request.

The request preview is the primary interface contract. Its content should come from the same assembly function that produces the dispatched request. The future runtime must preserve that relationship, including any provider-specific normalization. A readable source list alone is insufficient evidence of what was sent.

## Context is a choice

Every source has a clear purpose and visible contents. Nothing becomes persistent context merely because it exists in the workspace. Instruction blocks, files, history, and tool definitions remain individually inspectable. Exclusion should be as easy as inclusion.

Token counts in this demo are **estimates**, not provider tokenizer measurements. Show them to communicate relative context size, and label the approximation wherever it could be mistaken for an exact count. Avoid claiming budget enforcement based on an estimate.

## A request is a record

Before each simulated run, preserve an immutable snapshot of the assembled request. Later source edits affect the next request, not the previous snapshot. The user should be able to return to a run and inspect its original input. Copying or exporting a request provides a useful boundary between the harness and other tools.

The running session and the next request are related but distinct views. Any compaction, history removal, or source change should be explicit and reflected in the preview. No invisible memory or background context enrichment belongs in the minimal product.

## Small interface, complete paths

The main path is: select sources, inspect or edit them, compose, review the assembled request, and run. Keyboard navigation should cover the same actions as pointer navigation, with discoverable shortcuts and visible focus. The eventual TUI should support pane switching, source selection and toggling, editing, request inspection, and dispatch without a mouse.

Minimalism means fewer concepts to hold in mind. It does not mean hiding essential state. Favor plain text, stable pane positions, concise status, and a small set of reversible actions.

## The first terminal implementation

Build a single-session TUI with one context assembler, one model transport, and a local request log. Start with manually selected text files, editable instructions, explicit history, and an inspectable serialized request. Add tools only when their schemas and results can be shown clearly in the same workflow.

Keep dispatch, context assembly, and presentation separate enough to preserve the preview contract. Defer autonomous orchestration, subagent graphs, implicit retrieval, background memory, and elaborate workflow configuration until a concrete user need justifies them.
