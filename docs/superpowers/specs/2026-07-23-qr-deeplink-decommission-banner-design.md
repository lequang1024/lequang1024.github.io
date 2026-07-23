# QR Deeplink Decommissioning Banner Design

## Overview
Add a clear warning banner to both versions of the QR Deeplink Generator pages (`qr-deeplink.html` and `qr-deeplink-2.html`) informing users that the tool will be decommissioned in a few weeks and instructing them to contact `ray.le` if they still use it.

## Target Files
1. `qr-deeplink.html` (Version 1.0)
2. `qr-deeplink-2.html` (Version 2.0 - 099 Style)

## Detailed Changes

### 1. `qr-deeplink.html`
- **Location**: Top of main container card inside `<div class="bg-white p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-6xl mx-auto">`.
- **Banner Design**:
  - Tailwind alert banner with `bg-amber-50`, `border-l-4 border-amber-500`, `rounded-r-md`, and warning SVG icon.
  - Heading: "DECOMMISSIONING NOTICE" (bold amber-800)
  - Text: "This page will be decommissioned and go offline in a few weeks. If you still use this tool, please contact **ray.le**."

### 2. `qr-deeplink-2.html`
- **Location**: Top of page container `<div class="max-w-[1600px] mx-auto flex flex-col gap-[48px]">`.
- **Banner Design**:
  - 099 style dark frame with `bg-steel`, `border border-amber-500/50`, `rounded-[10px]`, `font-mono`.
  - Heading: "[NOTICE: DECOMMISSIONING]" in amber-300.
  - Text: "This page will be decommissioned and go offline in a few weeks. If you still use it, please contact **ray.le**."

## Verification
- Open both HTML files in a browser / inspect markup.
- Verify responsive layout and theme alignment (Light card in v1.0, Dark terminal card in v2.0).
