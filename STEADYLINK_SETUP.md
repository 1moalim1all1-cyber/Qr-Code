# EgyMenu — SteadyLink staging integration

Branch: `feature/steadylink-image-uploads` (NOT deployed to production)

## Completed
- Server-only upload session creation in `functions/steadylink-images.js`.
- Firebase Authentication + restaurant owner/admin authorization.
- File type and maximum size checks, unique per-upload filenames.
- Browser uploads bytes with a short-lived storage URL, not the secret API key.
- The helper `src/lib/steadylink.ts` polls for an accepted image URL.
- Existing Cloudinary URLs and product records are not changed.

## Required before enabling upload
1. Locate the **bucket ID** for the public SteadyLink destination bucket. Never confuse its label with the ID.
2. Store the existing SteadyLink API key only as a Firebase Function secret called `STEADYLINK_API_KEY`. Do not put it in `VITE_*`, GitHub source, or chat.
3. Configure the server-only `STEADYLINK_BUCKET_ID` environment value.
4. Review the exact upload-batch response and finalize response against a real test account, and ensure idempotent finalize + CORS PUT. The endpoint implementation has **not** been tested with live credentials.
5. Apply a public bucket/file delivery policy for product images and test CDN access from Egyptian mobile/desktop networks.
6. Add server-enforced quotas / rate limiting (per-user and global), and set SteadyLink workspace usage rule to **stop** at plan limits. Check both storage and delivery thresholds; do not enable paid overages.
7. Confirm deployment requirements / billing for Firebase Functions before deployment. If Firebase Functions are unavailable on the selected plan, use a supported free server-side alternative instead.
8. Wire `uploadSteadyImage(file, restaurantId)` to the uploader only after integration testing; do not change existing image display URLs.
9. Test create, upload, commit, malware scan, rendering, Firestore persistence, quota, failed upload, and unauthorized users in staging.

## Why production is untouched
Current Cloudinary upload remains live. This branch is incomplete staging code until the secure backend is tested and configured. No live images are migrated, replaced or deleted.
