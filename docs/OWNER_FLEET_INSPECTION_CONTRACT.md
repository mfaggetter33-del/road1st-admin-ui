# ROAD 1ST Owner Fleet Inspection — approved implementation contract (11 October 2026)

Status: **STAGED / NOT DEPLOYED / NOT SIGNED OFF**.

## Owner-approved behavior
- Owner can select any fleet from the existing Owner dashboard and open its **existing** fleet dashboard, preserving layout and fleet manager workflow.
- Banner must identify **ROAD 1ST OWNER — Viewing: [fleet name]**.
- Opening a fleet defaults to **Read-Only**. Owner may explicitly confirm **Full Control**. Switching back is immediate.
- Read-Only must be enforced by the **server**, not only by hiding or disabling browser buttons.
- Full Control may use all normal fleet manager operations plus specifically authorized owner support actions, but destructive actions require explicit confirmation.
- Every owner mutation must record authenticated owner ID, target fleet ID, action, target record, timestamp and result in a protected append-only audit trail; consider recording inspection access separately.
- A fleet manager may only access their own assigned fleet. An owner must never use the manager's password.
- The owner may return to the fleet overview at any time.

## Security implementation gates (required before release)
1. Reuse Supabase authenticated identity; validate owner role on **every** fleet-data API call and **every** write, not just at navigation.
2. Pass selected fleet ID explicitly; all reads and writes must bind to it and verify each target record belongs to that fleet. Never trust the displayed company name.
3. Enforce Read-Only server-side with an owner inspection session/capability whose mode and target fleet are validated server-side; UI-only mode switches are insufficient.
4. Avoid sharing owner credentials in URLs, query strings, logs, or cross-origin messages. Do not assume a new browser tab shares sessionStorage.
5. Protect reports, defect photos and fuel receipts with fleet-scoped authorization and short-lived media URLs.
6. Preserve Recommended as the fleet policy default; Strict and Custom remain available.
7. Verify ordinary manager A cannot read/write manager B's fleet even by changing IDs; verify owner can inspect A and B, cannot accidentally write in Read-Only, and can write only after explicit Full Control confirmation.
8. Confirm audit records and regression-test login, logout, report/fuel/defect viewing and upload.
9. No merge, deployment, live account changes, or customer data mutation without owner approval.

## Current implementation assessment
The existing `owner.html` renders a company overview/detail panel but does **not** open the complete fleet dashboard. The existing fleet portal `index.html` has its own sessionStorage-based authentication. Directly linking to it is **not** a secure owner impersonation mechanism. A server-verified owner inspection context and audited write path are prerequisites.

This document is a checkpoint, **not** a claim that the owner fleet inspection feature is complete.
