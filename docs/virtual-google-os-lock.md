# Virtual Google OS Preservation Lock

Date: 2026-07-08

This document records the known-good Virtual Google OS behavior that must be preserved in future edits.

## Locked Configuration

- Google CSE ID: `56f7592d1993141c3`
- Public CSE URL: `https://cse.google.com/cse?cx=56f7592d1993141c3#gsc.tab=0`
- Default local scraper/search base: `https://www.google.com/search?q=`
- Runtime lock constant: `VIRTUAL_GOOGLE_OS_LOCK` in `app.js`

## Required Behavior

- The Virtual Google OS dock must keep these modes: Search, Images, Videos, News, Books, Scholar, PDFs, Archives, Patents, Translate.
- Search and CSE events must create internal browser result cards with visible links, previews, and source actions.
- Google result clicks should route through the app preview/browser flow unless the user explicitly opens an external browser button.
- Long Google/CSE URLs must wrap inside the mobile viewport and must not force horizontal page overflow.
- The Cloudflare AI Search widget is allowed to fail independently, but its fallback must route queries into the Virtual Google OS without changing the locked browser behavior.

## Regression Checklist

Before changing browser/search code, verify:

1. Searching from the Virtual Research Browser creates cards in `browserSearchResults`.
2. Clicking a Google mode tile creates a preview card and visible result links.
3. The app remains readable on a phone-width viewport with long CSE URLs.
4. The Cloudflare fallback query opens a Virtual Google OS search target.
5. No edit removes or renames `GOOGLE_CSE_ID`, `GOOGLE_CAPABILITIES`, `buildGoogleCapabilityUrl`, `openInAppBrowser`, or `handleCseResultClick` without replacing the full behavior.
