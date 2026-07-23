# QR Deeplink Decommissioning Banner Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a prominent decommission warning banner to both `qr-deeplink.html` (v1.0) and `qr-deeplink-2.html` (v2.0) stating that the page will go offline in a few weeks and instructing users to contact `ray.le`.

**Architecture:** HTML modifications adding styled alert banners tailored to each page's visual theme (Tailwind light card in v1.0, 099 terminal dark style in v2.0).

**Tech Stack:** HTML5, Tailwind CSS

## Global Constraints

- Preserve all existing functionality and structure of both pages.
- Contact name must be `ray.le`.
- Standardized notification message: decommissioned in a few weeks.

---

### Task 1: Add Decommission Banner to `qr-deeplink.html`

**Files:**
- Modify: `qr-deeplink.html:29-30`

**Interfaces:**
- Consumes: Existing layout container in `qr-deeplink.html`
- Produces: Visual alert banner at top of generator card

- [ ] **Step 1: Inspect target insertion location in `qr-deeplink.html`**

Verify line 29 of `qr-deeplink.html`:
```html
    <div class="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-6xl mx-auto">
```

- [ ] **Step 2: Add the alert banner HTML**

Insert the following banner immediately after line 29:

```html
        <!-- Decommissioning Alert Banner -->
        <div class="mb-6 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-md shadow-sm flex items-start gap-3">
            <svg class="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <div>
                <h3 class="text-sm font-bold text-amber-800 uppercase tracking-wider">Decommissioning Notice</h3>
                <p class="text-sm text-amber-700 mt-0.5">This page will be decommissioned and go offline in a few weeks. If you still use this tool, please contact <span class="font-semibold text-amber-900 underline">ray.le</span>.</p>
            </div>
        </div>
```

- [ ] **Step 3: Manual verification**

Confirm the file contains the expected banner element and syntax is valid HTML.

- [ ] **Step 4: Commit**

```bash
git add qr-deeplink.html
git commit -m "feat(qr-deeplink): add decommissioning banner to v1.0 page"
```

---

### Task 2: Add Decommission Banner to `qr-deeplink-2.html`

**Files:**
- Modify: `qr-deeplink-2.html:100-101`

**Interfaces:**
- Consumes: Existing layout container in `qr-deeplink-2.html`
- Produces: 099-style dark visual alert banner at top of digital workbench

- [ ] **Step 1: Inspect target insertion location in `qr-deeplink-2.html`**

Verify line 100 of `qr-deeplink-2.html`:
```html
    <div class="max-w-[1600px] mx-auto flex flex-col gap-[48px]">
```

- [ ] **Step 2: Add the 099-style alert banner HTML**

Insert the following banner immediately after line 100:

```html
        <!-- Decommissioning Alert Banner (099 Style) -->
        <div class="bg-steel border border-amber-500/50 p-[20px] rounded-[10px] flex items-center gap-[16px] text-amber-400">
            <span class="text-[20px]">⚠️</span>
            <div class="flex flex-col gap-1 font-mono text-[14px]">
                <span class="font-bold tracking-wider uppercase text-amber-300">[NOTICE: DECOMMISSIONING]</span>
                <span class="text-ghost/90">This page will be decommissioned and go offline in a few weeks. If you still use it, please contact <strong class="text-amber-300 underline">ray.le</strong>.</span>
            </div>
        </div>
```

- [ ] **Step 3: Manual verification**

Confirm `qr-deeplink-2.html` contains the 099-style banner and HTML structure is valid.

- [ ] **Step 4: Commit**

```bash
git add qr-deeplink-2.html
git commit -m "feat(qr-deeplink): add decommissioning banner to v2.0 page"
```
