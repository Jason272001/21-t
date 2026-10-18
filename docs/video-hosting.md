# Video hosting options

Pricing checked 18 October 2026. Recommendation only; no provider is connected or
purchased by this change. PostgreSQL stores lesson metadata and permissions, not
video file bytes. “1 TB” below means 1,000 GB of billed storage, before tax.

| Option                                    | Storage example                                                     | Playback cost and work                                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Bunny Stream — recommended starting point | $0.01/GB/month in the default region: about $10/month for 1,000 GB  | Volume delivery $0.005/GB in the first tier; Standard Asia/Oceania $0.03/GB. Standard encoding included; a player and delivery service are provided. |
| Cloudflare R2 Standard                    | $0.015/GB/month before free allowance: about $15/month for 1,000 GB | No egress charge; operations are metered. We would need to build encoding, adaptive delivery and private playback.                                   |
| Cloudflare Stream                         | $5 per 1,000 stored minutes/month                                   | $1 per 1,000 delivered minutes. Managed encoding and video delivery; priced in minutes rather than TB.                                               |

Bunny bills encoded files and enabled resolutions, originals, previews and other
assets. A 1 TB source library can therefore require more than 1 TB of billed
storage. Extra replication, premium encoding, DRM or transcription add charges.
Storage and viewer bandwidth are separate: 1,000 GB on Bunny plus 1,000 GB Volume
delivery is approximately $15 before extras; Standard Asia delivery would make
the same example approximately $40. Confirm the available delivery tier and test
playback from Myanmar before selecting it. No fixed 1 TB purchase is necessary
to start; actual usage can be smaller.

A future integration should upload directly to the provider, keep API secrets on
the server, check confirmed enrollment before issuing short-lived playback access,
and associate each video with its course. This avoids Vercel upload-size and local
filesystem limits. Signed playback reduces casual link sharing but cannot prevent
screen recording. Consumer drive-storage capacity alone does not provide these
video delivery and access features.

Sources:

- https://bunny.net/docs/stream/pricing
- https://developers.cloudflare.com/r2/pricing/
- https://developers.cloudflare.com/stream/pricing/
