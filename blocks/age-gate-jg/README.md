# Age Gate V2

A full-page age verification overlay that blocks access to a page or site until a visitor confirms they meet a configurable minimum age requirement. The visitor enters their date of birth in `MM/DD/YYYY` format and the block calculates their exact age against the minimum age you set.

## Features

- Configurable minimum age (16, 18, 21, 25 — any whole number)
- All on-screen text is editable via the DA.live properties panel
- Date input auto-formats to `MM/DD/YYYY` as the visitor types
- Validates against impossible dates (e.g. February 31st)
- Full-page blurred overlay — page content is inaccessible until verified
- Verification stored in `sessionStorage` — no re-prompt within the same browser session
- Accessible: ARIA dialog, live error region, auto-focused input
- Responsive — works on mobile and desktop

## Fields

| Field | Description | Default |
|---|---|---|
| `minimum-age` | The age visitors must meet or exceed | `21` |
| `heading` | Main headline on the modal | `Age Verification Required` |
| `subheading` | Supporting text (leave blank to auto-generate using minimum age) | *(auto)* |
| `input-label` | Label above the date input | `Enter your date of birth` |
| `button-text` | Submit button label | `Submit` |
| `underage-message` | Error shown when visitor is too young (leave blank to auto-generate) | *(auto)* |
| `legal-text` | Small-print disclaimer below the form | Terms copy |

## Authoring in DA.live

1. Open a page in the DA.live editor.
2. Insert an **Age Gate V2** block from the block picker (Blocks group).
3. In the properties panel, set **Minimum Age Requirement** to your required age (e.g. `18`).
4. Customise the heading, subheading, and button text as needed. Subheading and Underage Message can be left blank — they will automatically reference the minimum age.
5. Place the block in its own section at the **top of the page**.
6. Preview at `https://main--jpg-b2b-accs--jogosset.hlx.page/<page-path>`.

## Placement

- **Single page**: Add to any page requiring age verification.
- **Site-wide**: Add to a shared template or header fragment included on all pages.

## Session Storage

Verification is stored under `age-gate-jg-verified` in `sessionStorage`:

- Gate does **not** re-appear during the same browser session after passing.
- Gate **will** re-appear when the visitor opens a new tab or restarts their browser.

## CSS Custom Properties

| Property | Used For |
|---|---|
| `--background-color` | Card and input background |
| `--text-color` | All text |
| `--color-brand-1000` | Submit button and input focus border |
| `--color-neutral-300` | Input default border |
