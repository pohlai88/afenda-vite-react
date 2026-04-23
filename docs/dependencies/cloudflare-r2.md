---
owner: governance-toolchain
truthStatus: supporting
docClass: supporting-doc
relatedDomain: dependency-guide
category: backend-planned
status: Planned
---

# Cloudflare R2 guide (Afenda)

This document describes how **Afenda** may use **[Cloudflare R2](https://developers.cloudflare.com/r2/)** for **S3-compatible** object storage (uploads, exports, attachments), with **secrets and signing** only on the server.

**Status:** **Planned** — not in **`apps/web`** today. “Cloudflare Object” in planning usually means **R2** (not **D1**, which is SQLite).

**Official documentation:**

- [R2 overview](https://developers.cloudflare.com/r2/)
- [Get started](https://developers.cloudflare.com/r2/get-started/)
- [API tokens (S3 credentials)](https://developers.cloudflare.com/r2/api/tokens/)
- [S3 API compatibility](https://developers.cloudflare.com/r2/api/s3/) — [operations reference](https://developers.cloudflare.com/r2/api/s3/api)
- [Workers API](https://developers.cloudflare.com/r2/api/workers/) — [R2 bucket bindings / `R2Bucket` reference](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/)
- [Presigned URLs (AWS SDK example)](https://developers.cloudflare.com/r2/examples/aws/aws-sdk-js)
- [R2 pricing](https://developers.cloudflare.com/r2/pricing/)

---

## S3-compatible access (server)

| Detail          | Value                                                                                                                                                       |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Endpoint**    | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`                                                                                                             |
| **Region**      | `auto` (for S3 clients; `us-east-1` or empty often aliases for compatibility)                                                                               |
| **Credentials** | Create **R2 API tokens** in the dashboard (**Manage API tokens** on the R2 overview); use **Access Key ID** and **Secret Access Key** with S3 SDKs or tools |

Presigned **GET** / **PUT** URLs should be generated **only** on **`apps/api`** (or a Worker), never in the Vite client, using the same endpoint and signing expectations as AWS SigV4.

---

## How we use R2

| Topic            | Convention                                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Buckets**      | Per environment or **key prefix** per tenant after security review                                                                                                                |
| **Browser**      | **Never** ship R2 **secret** keys to the Vite client                                                                                                                              |
| **Access**       | **Presigned URLs** or **`apps/api`** / **Worker** proxies that enforce session + tenant ([API](../API.md))                                                                        |
| **Workers**      | Declare **`[[r2_buckets]]`** in Wrangler (`binding` + `bucket_name`); use **`env.<BINDING>`** (`R2Bucket`) — see [Workers API](https://developers.cloudflare.com/r2/api/workers/) |
| **Keys**         | Namespace by **`tenantId`** / resource id                                                                                                                                         |
| **Alternatives** | **AWS S3**, **MinIO** — same access patterns; R2 is **infra choice**                                                                                                              |

---

## Red flags

- **Public** write ACLs on ERP documents.
- **Storing** PII in object keys without policy review.

---

## Related documentation

- [API reference](../API.md)
- [Authentication](../AUTHENTICATION.md)
- [Fastify](./fastify.md)

**External:** [developers.cloudflare.com/r2](https://developers.cloudflare.com/r2/)
