# Build your checklist

Answer six questions and get a **right-sized checklist** for *your* application — only the
items that apply to your tier, platform, and delivery model. For each item, **paste an
evidence link and tick it done** (evidence is required to mark an item complete). Then
export a **one-pager of what's left** or a **verification report of what's done**. No
reading the whole site; you leave with a task list, not a reading assignment.

!!! tip "How it works"
    **1. Work the checklist** — for each item, add an evidence link (repo / PR / doc) and
    tick it. Each item links to the detailed
    [best-practice guidance](../principles/criticality-tiers.md) (opens in a new tab).
    **2. Your progress auto-saves** in this browser; use **Save / Load progress** to move
    it between machines. **3. Export** — a *one-pager* of remaining items to create tasks
    from, or a *verification report* of completed items (with evidence) for sign-off. Not
    sure of your tier? Classify **up** when in doubt and confirm with Architecture.

<div id="arr-gen" markdown="0">
  <div class="arr-gen-form">
    <div class="arr-gen-row">
      <label class="arr-gen-field arr-gen-field--wide">
        <span class="arr-gen-label">Application name</span>
        <input type="text" name="app" placeholder="e.g. CSA Middleware Service" autocomplete="off">
      </label>
    </div>

    <div class="arr-gen-row">
      <fieldset class="arr-gen-field">
        <legend class="arr-gen-label">Is this a…</legend>
        <label><input type="radio" name="build" value="new" checked> New build</label>
        <label><input type="radio" name="build" value="existing"> Existing app (retrofit)</label>
      </fieldset>

      <fieldset class="arr-gen-field">
        <legend class="arr-gen-label">Delivered by</legend>
        <label><input type="radio" name="delivery" value="internal" checked> Internal team</label>
        <label><input type="radio" name="delivery" value="vendor"> Vendor (SOW)</label>
      </fieldset>
    </div>

    <div class="arr-gen-row">
      <fieldset class="arr-gen-field">
        <legend class="arr-gen-label">Criticality tier</legend>
        <label><input type="radio" name="tier" value="1"> Tier 1 — Mission-critical</label>
        <label><input type="radio" name="tier" value="2" checked> Tier 2 — Business-important</label>
        <label><input type="radio" name="tier" value="3"> Tier 3 — Supporting</label>
      </fieldset>

      <fieldset class="arr-gen-field">
        <legend class="arr-gen-label">Audience</legend>
        <label><input type="radio" name="facing" value="internal" checked> Internal</label>
        <label><input type="radio" name="facing" value="public"> Public-facing</label>
      </fieldset>
    </div>

    <div class="arr-gen-row">
      <label class="arr-gen-field arr-gen-field--wide">
        <span class="arr-gen-label">Platform</span>
        <select name="platform">
          <option value="openshift" selected>OpenShift (containers)</option>
          <option value="salesforce">Salesforce</option>
          <option value="cloud">Public cloud (Azure / AWS)</option>
          <option value="desktop">Desktop client</option>
          <option value="other">Other</option>
        </select>
      </label>
    </div>

    <div class="arr-gen-row arr-gen-row--foot">
      <label class="arr-gen-check">
        <input type="checkbox" name="optional"> Include optional (nice-to-have) items for my tier
      </label>
      <button type="button" class="md-button md-button--primary arr-gen-run">Generate my checklist</button>
    </div>
  </div>

  <div class="arr-gen-out" hidden></div>
</div>

## What happens next

You don't need to read the whole site — you leave here with a task list. The flow:

<div class="arr-flow" markdown>

1. **Generate & review** — answer the questions, then go down the checklist. Click **`details ↗`** on anything unclear (opens in a new tab, so you don't lose your place).
2. **Add evidence & tick** — for each item, paste an **evidence link** (repo / PR / doc) and tick it done. Evidence is **required** to mark an item complete. Progress **auto-saves in this browser**; use *Save / Load progress* to move it between machines.
3. **Export what's left** — *Create one-pager of remaining items*, then add them as tasks in **ServiceNow** (via *Tasks for ServiceNow .csv*) or your tool of choice.
4. **Report what's done** — *Verification report (.md)* lists completed items with their evidence — send it to the vendor / team for sign-off.
5. **Prove it at handover** — the completed checklist *is* your [Production Readiness Review](../readiness/production-readiness-review.md); sign-off is recorded in the [ServiceNow readiness record](../reference/servicenow-process.md) and linked to the CMDB.

</div>

??? note "How to load the list into ServiceNow"
    **Simplest — any user, no special rights.** Download **Download for ServiceNow (.csv)**
    (or *Copy remaining as text*), then on the application's **Readiness record** either
    attach the file, paste the list into the work notes, or create one task per remaining
    item.

    **If you have import rights.** *System Import Sets → Load Data* → upload the CSV →
    map the columns → run the transform. The CSV's headers already match ServiceNow task
    fields (`short_description`, `description`, `priority`), so it maps with little fiddling.
    Priority is pre-set: **2 (High)** for *Must* items, **3 (Moderate)** for *Should*.

!!! note "Coming soon — automatic verification"
    Today you self-report what's done. The [compliance scan](../reference/compliance-enforcement.md)
    will auto-verify the build & pipeline items (tests, scans, SBOM, signing) and feed the
    readiness record — so some items tick themselves and status is tracked, not just claimed.
