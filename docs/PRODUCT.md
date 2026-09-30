# Unspool

**See what you send.** By Bare Signal.

## One sentence

Unspool is a minimal AI harness concept that lets developers choose, edit, and inspect everything in a model request, then keep a record of each run.

## Product description

An AI harness is the software around a model that prepares its input, sends requests, and handles responses. Unspool makes preparing that input a visible editing task. It is designed for developers and people building or experimenting with AI tools who want to understand how instructions, source material, conversation history, and tool definitions shape a request. Three panes bring the work together: select and edit sources, compose a prompt, and inspect the complete assembled request in readable text or JSON. History is an explicit choice, and each run preserves its original request for later review, copying, or export.

Unspool keeps the workflow small: plain text, stable panes, and a few deliberate controls. Essential state stays visible, and context changes are explicit. The current browser prototype uses a deterministic local simulation, with editable sample text and browser-local storage. It makes no model calls and executes no tools. The planned terminal-first harness will begin with one session, manually selected text files, editable instructions, explicit history, one model connection, and a local request log. Its central promise is that the request you inspect is the request that gets sent.
