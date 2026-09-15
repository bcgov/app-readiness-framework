# Architecture decisions (ADRs)

This framework asks every team to record its architecture decisions — so it records its
own here. Each file below is one decision: what we chose, what we considered, and what it
costs us.

!!! info "Format"
    We use the BC Gov **`bc-madr v0.1`** template (a modified
    [MADR 4.0.0](https://adr.github.io/madr/)), the same format used by other bcgov
    projects such as [visitz-api](https://github.com/bcgov/visitz-api/tree/main/docs/decisions).
    Copy [`0000-adr-template.md`](0000-adr-template.md) to start a new one.

## The log

| # | Decision | Status | Date |
|---|---|---|---|
| [0001](0001-deliver-as-docs-as-code-with-a-checklist-generator.md) | Deliver the framework as a static docs-as-code site with a client-side checklist generator | accepted | 2026-09-15 |

## How to add one

1. Copy `0000-adr-template.md` to `NNNN-short-title.md` — next number, kebab-case title.
2. Fill it in. Keep *Context* to a few sentences; put the real thinking in
   *Considered Options* and *Consequences*.
3. Be honest in the consequences — an ADR with no "Bad, because…" is not a decision,
   it is an advertisement.
4. Add a row to the table above, open a pull request, and record who decided.

## When is a decision worth an ADR?

Write one when the choice is **hard to reverse**, **affects more than your own component**,
or when someone six months from now will ask *"why on earth is it built like this?"*
Routine, easily-changed choices do not need one.

Status values: `proposed` · `accepted` · `rejected` · `deprecated` · `superseded by ADR-NNNN`.
Supersede rather than delete — the history is the point.
