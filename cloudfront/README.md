# CloudFront resources

## redirect-trailing-slash.js

Viewer-request CloudFront Function attached to both distributions (apex and
`www`). 301-redirects extension-less URIs to their trailing-slash form and
appends `index.html` to URIs that already end in `/`.

## custom-error-responses.json

`CustomErrorResponses` block for both distributions. Maps S3 `403` and `404`
to the branded page at `/404.html` and returns HTTP `404`, so removed or
mistyped URLs report a real not-found instead of serving the homepage with a
`200` (the Google Search Console "soft 404" case).

Both distributions are managed outside this repo; apply the block through
whatever manages them rather than by hand, or the next managed run will
revert it.
