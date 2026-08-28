# Scripts

Helper scripts for maintaining the framework.

## `build-checklist-xlsx.py`

Generates the professional Excel checklist from the single source of truth,
`docs/checklist/checklist-items.csv` — the same file the live "Build Your
Checklist" tool reads. Edit the CSV, and both the tool and this spreadsheet
stay in sync.

```bash
pip install openpyxl
python scripts/build-checklist-xlsx.py                 # -> Application-Readiness-Checklist.xlsx (repo root)
python scripts/build-checklist-xlsx.py path/to/out.xlsx  # or a path you choose
```

What it does:

- Reads every row of `checklist-items.csv` (Section, Gate, Item, Why, Evidence,
  Covers, Tier 1/2/3, Applies to, More info).
- Resolves the platform tokens (`{{MONITOR}}` → Sysdig, `{{LOGS}}` → the Hive,
  `{{SECRETS}}` → Vault — the OpenShift defaults, since a static workbook can't
  be platform-aware).
- Turns the relative "More info" paths into clickable links to the live site.
- Writes a three-sheet workbook: **Read me**, **Checklist** (colour-coded
  sections, Must/Should/Optional/N‑A dropdowns, autofilter, frozen header) and
  **Dictionary**.

The workbook is a generated artifact — treat the CSV as the master, not the
`.xlsx`.
