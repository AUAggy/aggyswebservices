# CloudFront resources

## redirect-trailing-slash.js

Viewer-request CloudFront Function attached to both distributions
(`aggyswebservices.com` REDACTED-DISTRIBUTION-ID, `www.aggyswebservices.com` REDACTED-DISTRIBUTION-ID).
301-redirects extension-less URIs to their trailing-slash form; appends
`index.html` for URIs already ending in `/`.

## custom-error-responses.json — PENDING CHANGE (2026-11-10)

One-time fix for the Google Search Console **Soft 404** alert. The
distributions map S3 403/404 errors to `/index.html` with response code
**200**, so every removed or mistyped URL serves the homepage with HTTP 200
(e.g. `/category/analytics-business-intelligence/amazon-emr/` after EMR was
removed from the catalog). The fix returns the real 404 status with a branded
error page (`public/404.html`, already deployed to S3).

**Status (2026-11-10): blocked.** Every `update-distribution` call on this
account fails with `InvalidArgument: Distributions with the None pricing plan
can't have the following features: pricingplanDistributionLimitZero` — even
byte-identical no-op updates on multiple distributions, so it is not about
the payload. AWS has account activities suspended pending a security review;
this error is that restriction surfacing through the CloudFront API. Don't
retry (CLI or console) until AWS clears the review — quote the error string
in the open support case so it's fixed in the same pass.

### Apply once the account is unrestricted

```bash
# 1. fetch live config + etag
aws cloudfront get-distribution-config --id REDACTED-DISTRIBUTION-ID \
  --profile mgmt-admin --output json > /tmp/cf.json
ETAG=$(python3 -c "import json;print(json.load(open('/tmp/cf.json'))['ETag'])")

# 2. merge the new CustomErrorResponses into the fetched DistributionConfig
python3 - <<'EOF'
import json
raw = json.load(open('/tmp/cf.json'))
cfg = raw['DistributionConfig']
cfg.pop('PricingPlan', None)  # GET-output-only field; CLI rejects it as input
cfg['CustomErrorResponses'] = json.load(open('cloudfront/custom-error-responses.json'))
json.dump(cfg, open('/tmp/cf-new.json','w'))
EOF

# 3. apply (repeat for REDACTED-DISTRIBUTION-ID)
aws cloudfront update-distribution --id REDACTED-DISTRIBUTION-ID --if-match "$ETAG" \
  --distribution-config file:///tmp/cf-new.json --profile mgmt-admin

# 4. invalidate
aws cloudfront create-invalidation --distribution-id REDACTED-DISTRIBUTION-ID \
  --paths "/*" --profile mgmt-admin
```

If step 3 still fails after AWS clears the account, re-fetch the config first
(a stale etag from before the review is the most likely cause).

### Terraform drift warning

Both distributions were created by Terraform (`CallerReference:
terraform-20260121...`, state not in this repo). A manual console/CLI change
will drift from that state — add the matching `custom_error_response` blocks
to the module or the next `terraform apply` will revert the fix:

```hcl
custom_error_response {
  error_code            = 404
  response_code         = 404
  response_page_path    = "/404.html"
  error_caching_min_ttl = 300
}
custom_error_response {
  error_code            = 403
  response_code         = 404
  response_page_path    = "/404.html"
  error_caching_min_ttl = 300
}
```
