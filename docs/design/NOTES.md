# Design reference and verification

The visual direction is warm paper, charcoal ink, a forest-green accent, fine rules, an editorial serif headline, and monospace interface text. A single framed workbench contains sources, conversation, and the actual request. There are no decorative images or runtime image dependencies.

The full [concept](concept.png) was generated using the built-in Image Gen tool from the [saved brief](BRIEF.md). The [implemented preview](preview.png) is a JS-Reverse browser screenshot. The concept is a visual reference, not a screenshot masquerading as the app; every interface element is native HTML/CSS/React.

## Visual comparison

The concept and rendered implementation were inspected with `view_image` in the same review pass.

| Aspect | Concept / implementation review |
| --- | --- |
| Layout | Preserved masthead, compact introduction, single three-pane workbench, bottom composer, and quiet footer. Reduced the workbench height to keep the footer within the 1536 × 1024 reference viewport. |
| Typography | Preserved serif headline and compact monospace controls. Bundled DM Mono and DM Sans keep rendering independent of external font services. |
| Palette | Warm paper `#f6f5ef`, near-paper panels `#fbfaf7`, charcoal `#242722`, forest green `#44674c`, and fine gray rules. No shadows or gradients added. |
| Containers and icons | One framed workspace, thin pane dividers, square controls, small outline icons. No extra dashboard cards. |
| Copy | Main headline, supporting line, navigation, source list, pane labels, and footer follow the reference. The intentional changes below make the demonstrator truthful and usable. |
| Responsive behavior | Verified at the current 1422 × 891 browser viewport, a 1536 × 1024 same-origin iframe matching the concept, and a 390 × 844 iframe. The mobile document has no horizontal overflow; source, session, and request panes stack vertically. |

The initial generated image implies a prior assistant answer. The implementation starts with a genuine empty session and a ready prompt. A real local run produces the simulated transcript. Actual request delimiters, the model field, full tool JSON, an explicit session-history checkbox, JSON download, and source-edit guidance are intentional functional additions. Counts and budget usage derive from actual state rather than the illustration's sample numbers. Plain text replaces decorative syntax coloring so no request content is elided or reinterpreted.

The implementation follows the concept's composition and design language with these documented functional deviations. No material clipping or horizontal overflow remained in the reviewed layouts.

## Functional checks

Browser verification used the user's JS-Reverse MCP exclusively. It checked source exclusion and restoration; source editing; live preview updates; exact pre-run/saved-request equality; unchanged historical snapshots after edits; explicit history removal; custom prompts; returning from snapshot inspection to the live request before another run; readable/JSON switching; and reset. The browser reported no warnings or errors during the flow.

The production build includes strict TypeScript checking. Eight unit tests cover source and tool exclusion, source ordering, verbatim prompts, empty requests, no hidden instructions, immutable request snapshots, invalid tool JSON, edited README contents, deterministic simulation, and token estimation. Tests are concentrated around the core transparency contract.

## Boundaries

The responsive iframe checks verify browser layout at those CSS viewport dimensions; they do not claim physical-device testing. The simulation is local and deterministic. There is no provider integration, terminal binary, real tool execution, or filesystem ingestion in this version.
