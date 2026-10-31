# EgyMenu — SteadyLink via Cloudflare Worker (staging)

Branch: `feature/steadylink-image-uploads`. **Not merged or published**.

## Current architecture
- React frontend: `src/components/ui/ImageUpload.tsx`.
- Upload client: `src/lib/steadylink.ts` sends a Firebase ID token and multipart form to
  `https://misty-dew-76fd.1moalim1all1.workers.dev/upload`.
- Cloudflare Worker `misty-dew-76fd` runs the authenticated upload endpoint.
- SteadyLink API key `STEADYLINK_API_KEY` lives in Cloudflare Worker Secrets.
- Worker code currently selects the bucket named `My files` using GET `/api/assets/?limit=100`.
  It ignores the obsolete `STEADYLINK_BUCKET_ID=restaurants` variable.
- SteadyLink folder `restaurants` is a folder, not a bucket ID.
- Frontend feature switch: `VITE_IMAGE_UPLOAD_PROVIDER=steadylink`.
  Current default is Cloudinary when this build variable is unset.

## Before any production roll-out
1. Test SteadyLink bucket-list permission (`assets:read`) on the saved API key.
2. Confirm the worker's upload-batch and finalize payloads work with SteadyLink API;
   these have **not** been verified against the live account.
3. Check Firestore REST document shapes and security rules: the Worker presently
   requires `restaurants/{restaurantId}.owner_id == uid` or
   `users/{uid}.role == super_admin`. A mismatch will cause ACCESS_DENIED.
4. Confirm an actual owner can upload JPG/PNG/WebP (max 8 MiB), save the returned URL,
   and view it via CDN. Check unauthorized access and quota exhaustion.
5. Confirm free-plan hard limits and cost protections; add production abuse
   protections and rate limiting before broad release.
6. Enable `VITE_IMAGE_UPLOAD_PROVIDER=steadylink` in the frontend build, test
   on a staging deployment, and only then merge and publish.
7. Existing Cloudinary image URLs must be preserved.

## Diagnostic note
Opening the Worker root in the browser returns `Origin not allowed` because it
is a protected upload API, not a page. This result **does not test an upload**.

## Security
Never put the SteadyLink key in `VITE_*`, GitHub, client code, or chat.
Never expose an unauthenticated bucket-list endpoint or use Origin checking
as the sole authentication control.
