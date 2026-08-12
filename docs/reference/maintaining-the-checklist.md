# Maintaining the checklist

The checklist is a **living document** — anyone on the team can update it, not just the
person who built it. This page is how.

!!! tip "The short version"
    Edit a file in the repo → open a pull request → on merge to `main`, the site
    **rebuilds and deploys itself** in about a minute. No manual publishing.

## What lives where

| You want to change… | Edit this |
|---|---|
| A **checklist item** (title, why, evidence, when it's mandatory) | `docs/javascripts/generator.js` — the `CATALOG` list |
| The **detailed guidance** behind an item | the matching Markdown page under `docs/…` |
| The **item catalogue for team review** | the shared spreadsheet (Keep / Remove / Modify) |

## Anatomy of a checklist item

Each item in `CATALOG` is one entry that looks like this:

```js
I("observability",                                   // section
  "Ship metrics with dashboards (Sysdig on OpenShift, or an approved equivalent)",  // title
  "You can't operate what you can't see. …",         // why  (the justification)
  "Monitoring dashboards for the app (Sysdig, or the platform's tool).",  // evidence expected
  ["M", "M", "S"],                                   // Tier 1, Tier 2, Tier 3
  { platform: ["openshift"] }                        // optional conditions
),
```

- **section** — one of: `design`, `build`, `resilience`, `data`, `observability`,
  `security`, `performance`, `operability`, `contractual`, `cost`.
- **title** — the item, written as an action ("Do X").
- **why** — one sentence of justification (shown under the item).
- **evidence** — what proves it's done (becomes the evidence prompt).
- **tiers** — `["Tier1", "Tier2", "Tier3"]`, each one of:
  `"M"` = Must · `"S"` = Should · `"Y"` = Optional · `"-"` = not applicable.
- **options** (optional last argument):
    - `{ facing: "public" }` — only shows for public-facing apps
    - `{ vendor: true }` — only shows for vendor-built apps
    - `{ platform: ["openshift"] }` (or `["desktop"]`, etc.) — only shows for that platform

## Common edits

- **Reword an item** — change the title / why / evidence text.
- **Change when it's mandatory** — edit the tiers array (e.g. make it Should on Tier 3: `["M","M","S"]`).
- **Restrict it** — add an option (`{ platform: ["openshift"] }`, `{ vendor: true }`, `{ facing: "public" }`).
- **Add an item** — copy an existing entry, drop it into the right section block, and edit it.
- **Remove an item** — delete its entry.

To change the **guidance** behind an item, edit the relevant Markdown page under `docs/`
(plain Markdown — headings, lists, tables, admonitions).

## The change flow

```mermaid
graph LR
    A["Edit file<br/>(item or guidance)"] --> B["Open pull request"]
    B --> C["CODEOWNERS review<br/>+ build check"]
    C --> D["Merge to main"]
    D --> E["Site auto-builds<br/>& deploys (~1 min)"]
    linkStyle default stroke:#1a5a96;
```

1. Edit the file (in GitHub's web editor, or a branch locally).
2. **Open a pull request.** The `CODEOWNERS` review and the build check run automatically.
3. **Merge to `main`.** The *Publish framework site* GitHub Action builds the site with
   `mkdocs build --strict` and deploys it to GitHub Pages.
4. It's live within about a minute at the site URL.

## Preview locally (optional)

```bash
pip install -r requirements.txt
mkdocs serve
# open http://localhost:8000
```

!!! warning "Test item edits in the browser"
    `mkdocs build` validates the Markdown and links, but **not** the JavaScript in
    `generator.js`. After editing `CATALOG`, open the checklist page and generate a list
    to confirm your change renders and nothing broke.

## Tips

- Keep titles action-oriented; keep **why** to one sentence.
- A named tool is a **recommended default** — mandatory only where the platform provides
  it; otherwise allow an equivalent with an ADR (see the *Recommended vs required* note on
  [Observability](../design-build/observability.md)).
- **AI assistants** (Claude, Copilot) can draft edits — paste the item and describe the
  change you want.
- Big changes? Take them through the **item-review spreadsheet** first so the team can
  agree Keep / Remove / Modify, then apply the agreed edits to `CATALOG`.
