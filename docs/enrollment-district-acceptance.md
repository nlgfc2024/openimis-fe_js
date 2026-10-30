# District enrollment acceptance evidence

Implementation date: 29 October 2026. Base: `mw/develop`.

## Tested implementation revisions

| Module | Revision |
| --- | --- |
| Backend individual | `f06ac744a5d188b11d70f9f52eeb168ad37635a3` |
| Frontend individual | `d728d40` (full SHA pinned in `openimis.json`) |
| Frontend core | `858ac3165b8643207504051885e9f686cad2a466` |

Assembly manifests pin these exact feature revisions. Module PR review/merge is required before assembly merge and rollout. Documentation-only commits may follow these runtime revisions without requiring a different dependency pin.

## Local checks completed

- Backend: 43 tests in `individual.tests.test_enrollment_location` and `individual.tests.test_authoritative_enrollment` pass on PostgreSQL 16. The isolated runner uses a fresh test database, `--nomigrations --noinput`, in-memory caches and Celery broker, and the feature module on `PYTHONPATH`. This validates current model behavior; it is not a migration rehearsal against production data.
- API coverage: actual GraphQL summary/list requests with an enrollment officer, selected/empty district conditions, permitted-location counts, unauthorized district errors, direct R and descendant assignments, partial-district access, and actual confirmation mutation entrypoint with changed VERIFIED eligibility. Phase-wide capacity remains effective when an assignment is in another district.
- Frontend: `npm test` passes 19 declared cases across three test files. React/jsdom interaction coverage exercises saved labels, numeric/Relay IDs, clearing/read-only picker behavior, preview invalidation after district/status/phase changes, failed requests, out-of-order responses and repeated requests for identical inputs. Published location UI and dispatch responses are mocked in these focused component tests.
- Frontend lint: local ESLint passes on `EnrollmentDistrictPicker.js`, `useEnrollmentPreview.js`, `AdvancedCriteriaRowValue.js`, `AdvancedCriteriaGroupForm.js`, and `utils.js`.
- Module builds: `npm run build` passes in frontend individual and core. Individual's existing Rollup setup reports `flat` as an external unresolved dependency; the host assembly supplies it and builds successfully.
- Assembly: `node openimis-config.js`, then `GENERATE_SOURCEMAP=false NODE_OPTIONS=--max-old-space-size=8192 npm run build`. Successful production build uses an isolated copy of the existing host dependencies plus freshly built individual/core bundles. This is not a clean reinstall of every unrelated floating dependency.
- Backend rollout preparation: four stdlib unittest cases pass for the offline configuration export transformer. The installed Social Protection validator and common/GROUP deep-merge functions accept the resulting defaults and preserve VERIFIED.

The UI uses the existing `location.LocationPicker` at level 0 (R), translated District/Equals labels, numeric ID payloads, and a current-preview requirement. No selected district contributes no condition; the backend still applies household access policy and phase criteria. The existing policy for households without locations and technical users remains unchanged.

## Staging UAT still required (issue #10)

No staging deployment, live browser enrollment, or production configuration update was performed. Local component and GraphQL tests are not evidence of a completed staging user journey. Keep the assembly PR draft until these steps are recorded with staging versions and results:

1. Deploy reviewed module revisions and apply the reviewed GROUP schema addition in staging, preserving existing VERIFIED criteria.
2. With a broad-access user, select district A and then B; verify available district names, summary, list and actual enrollment.
3. With a restricted/partial-district user, repeat selection, clear the district, and remove all operator filters. Verify all returned data stays within the established permitted scope.
4. Change district/status/phase after preview. Verify old results disappear and confirmation requires a successful current preview. Exercise a failed preview and a delayed response.
5. Confirm saved district selection restores its name; empty selection sends no district filter. Verify existing-phase and new-phase configuration behavior.
6. Verify duplicate assignments, ranking and phase-wide capacity with representative staging data; capture real GraphQL responses and enrolled IDs without including sensitive household data in public evidence.
7. Record the actual deployed revisions, test accounts' scope descriptions, results, remaining failures and reviewer sign-off here before production rollout.

## Hosted CI limitation

The frontend individual SonarCloud run [40872423751](https://github.com/nlgfc2024/openimis-fe-individual_js/actions/runs/40872423751) failed before source analysis: the SONAR_TOKEN environment value is empty and the scanner reports “Not authorized or organization not found.” Repository/SonarCloud credentials must be corrected and the scan rerun. Local test, lint and build results above do not imply hosted CI is green.
