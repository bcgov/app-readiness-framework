# Build your checklist

Answer six questions and get a **right-sized checklist** for *your* application — only the
items that apply to your tier, platform, and delivery model. **Tick off what's already
done**, then generate a **one-pager of what's left** to paste into ServiceNow, JIRA, or
whatever tool your team uses. No reading the whole site; you leave with a task list, not a
reading assignment.

!!! tip "How it works — two parts"
    **1. The checklist** — key questions and things to do before handover, each linking to
    the detailed [best-practice guidance](../principles/criticality-tiers.md). **2. The
    one-pager** — the remaining (unchecked) items, ready to turn into tasks. Not sure of
    your tier? Classify **up** when in doubt and confirm with Architecture.

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

1. **Generate & review** — answer the questions, then go down the checklist and **tick what's already done**. Click **`details ↗`** on anything unclear to read the guidance.
2. **Create the one-pager** — hit *Create one-pager of remaining items* to get a clean sheet of only what's left.
3. **Take it to your tool** — *Download PDF*, *Copy as text*, or the *ServiceNow .csv*, then add those items as tasks in **ServiceNow** (or whatever your team uses).
4. **Do the work** — each item's **Evidence** line tells you what proves it's done.
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
