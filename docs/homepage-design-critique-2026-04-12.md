# Homepage Design Critique

Date: 2026-04-12

Scope: homepage and adjacent entry surfaces that shape first impression and task routing, primarily [`pages/index.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/pages/index.vue), [`components/TclHeader.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclHeader.vue), [`components/TclTopNavigation.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclTopNavigation.vue), [`components/TclShowcase.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclShowcase.vue), [`components/TclPostCard.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclPostCard.vue), [`components/TclSearchbox.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclSearchbox.vue), [`pages/chat.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/pages/chat.vue), [`components/TclPromptInput.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclPromptInput.vue), and [`components/TclChatOverview.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclChatOverview.vue).

Intent inferred from code and design context: help people learn about the dangers of COVID, stay informed through curated reporting and research, and ask the chatbot practical questions in a calm, credible, vigilant, hopeful way.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Loading exists, but the homepage does little to signal primary path, current priority, or chat availability clearly. |
| 2 | Match System / Real World | 3 | Editorial buckets are familiar, but labels like "Scientific Library" and premium lock cues introduce product-language friction. |
| 3 | User Control and Freedom | 2 | Users can navigate freely, but there is no strong simplification path when the homepage and nav present too many equal-weight choices. |
| 4 | Consistency and Standards | 3 | The system is visually consistent, though it feels split between editorial content and default component-library chrome. |
| 5 | Error Prevention | 2 | Some guardrails exist in chat, but search results rely on click-only rows and gating is revealed late rather than prevented clearly. |
| 6 | Recognition Rather Than Recall | 2 | Users must mentally map many categories, menus, and destination types before taking a confident first step. |
| 7 | Flexibility and Efficiency | 2 | Search helps, but there is no fast, obvious path for the two core jobs: learn quickly or ask a practical question. |
| 8 | Aesthetic and Minimalist Design | 2 | The page is orderly but too repetitive; repeated card grids and generic typography flatten the hierarchy. |
| 9 | Error Recovery | 2 | Recovery is adequate in chat toasts, but homepage utility states like no-results offer little next-step guidance. |
| 10 | Help and Documentation | 2 | Help exists elsewhere, and chat has FAQ support, but the homepage does not surface guidance contextually. |
| **Total** |  | **22/40** | **Acceptable** |

## Anti-Patterns Verdict

### Does this look AI-generated?

Not in the obvious 2024 sense. This is not neon-dark, gradient-heavy, or glassy. It avoids the loudest AI tells. The problem is subtler: it still reads as a competent but template-shaped Tailwind/Shadcn editorial build rather than a sharply opinionated product. If someone said "AI helped make this," that would feel plausible.

### LLM Assessment

The homepage is functional and credible, but it is not yet distinctive enough for the stated brand. The current stack shows through visually:

- The font system in [`tailwind.config.js`](/Users/shortwavlabs/Workspace/tcl/tcl-web/tailwind.config.js) uses Inter, Oswald, and PT Serif, which produces a familiar, over-seen startup-editorial mix rather than an opinionated, modern, scientific voice.
- The page rhythm in [`pages/index.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/pages/index.vue) is highly repetitive: heading, grid, centered "See all" button, repeat. That makes every content category feel equally important.
- [`components/TclPostCard.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclPostCard.vue) is solid but generic. Standard card shell, image, title, meta, excerpt, tags. It communicates information, but not a strong editorial thesis.
- [`components/TclTopNavigation.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclTopNavigation.vue) and [`components/TclMobileNavigation.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclMobileNavigation.vue) present too many destination types without a stronger opinion about what a first-time user should do first.
- The brand red is present in tokens but not used with enough strategic intent. Meanwhile search category icons introduce emerald, amber, and rose accents in [`components/TclSearchbox.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclSearchbox.vue), which dilutes the main brand signal.

### Deterministic Scan

Command run:

```bash
npx impeccable --json pages/index.vue components/TclHeader.vue components/TclTopNavigation.vue components/TclShowcase.vue components/TclPostCard.vue components/TclMoreButton.vue components/TclSearchbox.vue pages/chat.vue components/TclPromptInput.vue components/TclChatOverview.vue
```

Result: `[]`

The detector found 0 flagged anti-patterns in the scanned files. That means the current implementation avoids the specific structural issues the tool targets. It does not mean the design is strong. The CLI is good at catching bad tells; it is less useful for diagnosing bland hierarchy, generic typography, or weak brand expression.

False positives: none.

Visual overlays: not used. Browser automation was not available in this environment.

## Overall Impression

The site already feels serious enough to be trusted, which matters for the subject matter. The main weakness is that it behaves more like a categorized content inventory than a sharply directed editorial product for people trying to understand risk and act on it. The single biggest opportunity is to make the homepage lead users decisively into its two core jobs instead of treating every content type as an equal peer.

## Cognitive Load Assessment

Checklist failures: 5/8. Rating: critical.

Failed checks:

- Single focus: the homepage asks users to parse many equal-weight sections before a primary path becomes obvious.
- Visual hierarchy: the showcase is strong, but the rest of the page settles into repeated same-volume section patterns.
- One thing at a time: users are offered content browsing, search, chat, locale switching, account actions, and category selection all at once.
- Minimal choices: the desktop header and mobile sheet exceed working-memory limits.
- Progressive disclosure: content categories and routes are revealed mostly as a full catalog rather than staged by need.

Decision points that exceed safe working-memory limits:

- Desktop header: top-level nav plus search, mode toggle, locale, contact, and user menu create roughly 8 to 9 simultaneous choices.
- Mobile navigation: the sheet exposes 11+ links in one list with minimal grouping.
- Homepage scan: users see five major content blocks after the showcase, each framed as equally deserving attention.

## What’s Working

- The showcase mosaic in [`components/TclShowcase.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclShowcase.vue) gives the homepage some editorial energy and prevents a completely flat hero.
- The content taxonomy is sensible. News, events, videos, library, and public health watch are easy to understand and support the site's credibility.
- Utility is real. Search, multilingual support, and the existence of a practical chatbot make the product feel useful beyond passive reading.

## Priority Issues

### [P1] No dominant entry point for the two core user jobs

Why it matters: the design context says users come here to stay informed and ask practical questions. The homepage does not make either path dominant. Instead, it presents a broad catalog of sections and asks users to self-sort.

Fix: make the opening screen lead with one editorial action and one practical action. For example, pair a strong "What matters now" editorial lead with an immediately visible chatbot prompt or guided question starter.

Suggested command: `/layout`

### [P1] The visual language is too template-driven for an opinionated, modern, scientific brand

Why it matters: the current typography and component treatment look competent but generic. That weakens memorability and makes the site feel assembled from defaults rather than authored.

Fix: replace the current font stack with a more specific pairing, reduce uppercase shouting, create a clearer scale, and redesign card/title treatments so the interface feels editorial rather than component-library-first.

Suggested command: `/typeset`

### [P1] Navigation and choice architecture overload first-time users

Why it matters: the header and mobile sheet expose too many parallel destinations. People coming to learn about COVID risk should not have to decode the site map before they can act.

Fix: reduce top-level choices, make one route primary, group secondary destinations more aggressively, and simplify the mobile menu into clearer clusters.

Suggested command: `/distill`

### [P2] Brand red is not carrying enough semantic or emotional weight

Why it matters: red is required, but right now it behaves mostly like a standard primary token. Meanwhile other accents in search and UI details compete with it. The result is a weaker brand signature.

Fix: build a red-led system with tinted neutrals, remove unnecessary competing accent colors, and reserve red for meaningful emphasis such as urgency, source credibility, or key calls to action.

Suggested command: `/colorize`

### [P2] Utility surfaces weaken trust through small interaction and clarity gaps

Why it matters: credibility in this domain comes from detail. Search results in [`components/TclSearchbox.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclSearchbox.vue) are click-only `div` rows rather than obvious keyboard-focusable actions, and the chatbot's availability is visually framed as premium/locked in navigation, which can create hesitation.

Fix: make search results fully semantic and keyboard-friendly, clarify chatbot access and purpose in plain language, and add more contextual guidance around practical question asking.

Suggested command: `/harden`

## Persona Red Flags

### Jordan (Confused First-Timer)

- The first action is not obvious within five seconds. The page says "here is everything" rather than "start here."
- "Chat" appears as just another nav item and is visually coupled with premium lock semantics, which weakens confidence instead of inviting questions.
- Category terms like "Scientific Library" read like internal taxonomy rather than warm user-facing guidance.
- Repeated "See all" buttons tell Jordan there are many archives, but not which archive matters first.

### Sam (Accessibility-Dependent User)

- Search results in [`components/TclSearchbox.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclSearchbox.vue) are rendered as clickable `div` elements, which is a weak pattern for keyboard and assistive-tech users.
- Important meaning is reinforced through color in search result icons, but those category distinctions are not strongly conveyed otherwise.
- The homepage relies on visual scanning patterns and large image-led cards; when hierarchy is weak visually, screen-reader users get even less benefit from the intended emphasis.

### Casey (Distracted Mobile User)

- The mobile sheet exposes too many links in one uninterrupted list. That is work, not guidance.
- The most important actions live at the top of the screen. There is no thumb-friendly persistent action for "ask a question now."
- The homepage requires substantial scrolling through multiple content grids before it feels clear what to do if Casey only has 30 seconds.

## Minor Observations

- The gradient feature block in [`components/TclTopNavigation.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclTopNavigation.vue) has a stock Shadcn feel that softens the site's editorial seriousness.
- Section headings in [`pages/index.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/pages/index.vue) are visually too similar. Everything arrives in the same uppercase, heavy, large format.
- [`components/TclChatOverview.vue`](/Users/shortwavlabs/Workspace/tcl/tcl-web/components/TclChatOverview.vue) establishes identity, but the Beta badge and logo do more branding than guidance. Example questions would teach better.
- The footer app store badges are visually prominent relative to their informational value on a homepage whose main job is editorial trust-building.

## Questions to Consider

- Should the homepage lead with "learn what matters now" or "ask a practical question now," and which one deserves the top slot?
- Does every content category need equal billing on first load, or should one or two be clearly treated as primary?
- What would a more authored version of this site look like if it behaved less like a catalog and more like a publication with a point of view?
