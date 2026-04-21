# Template Quality Scorecard (S Standard)

Infomii template quality should be evaluated with a shared rubric so "high quality" is reproducible.

## Scoring rule

- Scale: each item is scored `0-2`
  - `0`: unmet (must fix)
  - `1`: acceptable but needs improvement
  - `2`: ideal (S-level)
- Total: `30` points
- Grade:
  - `27-30`: `S`
  - `23-26`: `A`
  - `19-22`: `B`
  - `0-18`: `Needs work`

## 15 criteria

1. Arrival-first information appears early (check-in/access/front desk).
2. Wi-Fi information is present and clear (SSID/password/help).
3. Meal/breakfast information is present and clear (time/place/rules).
4. Checkout information is present and clear (time/flow/notes).
5. Emergency information is present and clear (contacts/night support).
6. Reading order naturally supports guest action flow.
7. One block = one message (not overpacked).
8. CTA conflict is avoided (no competing primary actions).
9. Important information has strong visibility (heading/hero/highlight).
10. Category fit is clear (business/resort/ryokan/airbnb/guide/inbound).
11. Copy is concise and unambiguous.
12. Editable points are obvious (time/location/contact/value fields).
13. Copy remains translation-friendly (short/simple structure).
14. Operations/rules content exists (notice/checklist/faq etc.).
15. Ready-to-publish quality (few edits required before QR launch).

## Auto-NG (must-fix regardless of total score)

If any condition below is true, treat the template as `Needs work`:

- Missing Wi-Fi information
- Missing meal/breakfast information
- Missing checkout information
- Missing emergency information
- Missing arrival/access guidance
- Primary CTA collisions (multiple equal-priority actions without flow)

## Review workflow

1. Run mechanical audit script:
   - `npm run templates:quality:audit`
2. Review generated report:
   - `docs/template-quality-report.json`
   - `docs/template-quality-report.md`
3. Human review on low-scoring templates:
   - fix copy, card order, missing fields, category fit
4. Re-run script until target grade is reached (`S` target, `A` minimum)

## Output policy

- Keep machine scores + notes in JSON for tooling.
- Keep human-readable summary + Top 10 priorities in Markdown.
- Always include `autoNgReasons` in both outputs.
