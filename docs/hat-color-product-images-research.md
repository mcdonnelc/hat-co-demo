# Per-color blank hat product images: S&S Activewear & SanMar

Research date: **2026-09-08**  
Scope: Whether Hat.co’s quote form (26 blank styles) can show the actual hat photo for the customer-selected color.

## Verdict

**Feasible for S&S styles** via official API / Data Library image paths + self-hosted copies. Per-color front/back/side/swatch images exist at predictable CDN URLs **once you know the numeric `colorStyleID`**.  
**Feasible for SanMar (C936)** via Data Library / Media / Web Services / PromoStandards media URLs + self-hosted copies. Per-color images exist on `cdnp.sanmar.com`, but **full CDN paths are not guessable from color name alone**.  
**Do not hotlink** either CDN in production; both vendors steer customers to download/authorized marketing channels.

---

## 1. Verified image URL patterns

### S&S Activewear (`cdn.ssactivewear.com`)

| Pattern | Purpose | Size suffixes | Status |
| --- | --- | --- | --- |
| `Images/Color/{colorStyleID}_f_{size}.jpg` | Flat/product **front** | `_fs` small, `_fm` medium, `_fl` large | **Verified** |
| `Images/Color/{colorStyleID}_b_{size}.jpg` | **Back** | same | **Verified** |
| `Images/Color/{colorStyleID}_d_{size}.jpg` | **Direct side** | same | **Verified** |
| `Images/ColorSwatch/{id}_fm.jpg` | Color swatch chip | `_fm` / `_fs` (API docs) | **Verified** (see ID note below) |
| `Images/Style/{styleID}_{size}.jpg` | Style-level hero (not per color) | `_fs` / `_fm` / `_fl` | **Verified** |
| `Images/ModelColor/{colorStyleID}_omf\|oms\|omb_{size}.jpg` | On-model front/side/back | same | **Verified** on API example ID `17130`; not checked for every hat |
| Path without size, e.g. `Images/Color/51140_f.jpg` | — | — | **Verified 404** |
| `https://www.ssactivewear.com/Images/...` | Doc example base | — | **Verified** 301 → CDN, then JPEG |

Base URL that works for direct asset fetch:

`https://cdn.ssactivewear.com/{path}`

API docs also show `https://www.ssactivewear.com/{Image}`; that host redirects to the CDN.

Optional Cloudflare Image Resizing wrapper (seen on brand listing pages), also **verified** HTTP 200 / `image/jpeg`:

`https://cdn.ssactivewear.com/cdn-cgi/image/quality=80,w=200,f=auto/Images/Style/3783_fm.jpg`

#### Verified working examples (curl: HTTP 200 + `image/jpeg`)

**Richardson 112** (`styleID` **4332**; ~116 colors on product JSON)

| Color name (S&S spelling) | `colorStyleID` | Verified URL |
| --- | --- | --- |
| Black | 51140 | https://cdn.ssactivewear.com/Images/Color/51140_f_fm.jpg |
| Black | 51140 | https://cdn.ssactivewear.com/Images/Color/51140_f_fl.jpg (large) |
| Black | 51140 | https://cdn.ssactivewear.com/Images/Color/51140_b_fm.jpg (back) |
| Black | 51140 | https://cdn.ssactivewear.com/Images/Color/51140_d_fm.jpg (side) |
| Black/ Charcoal | 51141 | https://cdn.ssactivewear.com/Images/Color/51141_f_fm.jpg |
| Heather Grey/ Black | 51153 | https://cdn.ssactivewear.com/Images/Color/51153_f_fm.jpg |
| White/ Royal CMB | 140540 | https://cdn.ssactivewear.com/Images/Color/140540_f_fm.jpg |
| White | 51163 | https://cdn.ssactivewear.com/Images/Color/51163_f_fm.jpg |
| Style hero | style 4332 | https://cdn.ssactivewear.com/Images/Style/4332_fl.jpg |
| Swatch (Black) | 51140 | https://cdn.ssactivewear.com/Images/ColorSwatch/51140_fm.jpg |

**YP Classics 6606** (`styleID` **3783**; ~55 colors on US product JSON)

| Color name | `colorStyleID` | Verified URL |
| --- | --- | --- |
| Black | 44999 | https://cdn.ssactivewear.com/Images/Color/44999_f_fm.jpg |
| Black/ White | 45000 | https://cdn.ssactivewear.com/Images/Color/45000_f_fm.jpg |
| Heather Grey/ Black | 78570 | https://cdn.ssactivewear.com/Images/Color/78570_f_fm.jpg |
| Realtree Max7/ Brown | 129864 | https://cdn.ssactivewear.com/Images/Color/129864_f_fm.jpg |
| Style hero | style 3783 | https://cdn.ssactivewear.com/Images/Style/3783_fl.jpg |

**API documentation example** (Gildan 2000 / White — not a hat):  
https://cdn.ssactivewear.com/Images/Color/17130_f_fm.jpg — **Verified**.

**Inferred (not re-verified for every ID):** same `_f` / `_b` / `_d` / `_om*` + `_fs|_fm|_fl` pattern applies to other S&S hat styles (110, 110M, VC300A, SP08, GB400, etc.) because Products API returns those field names for every SKU. Live product HTML for those styles was Cloudflare-blocked from this environment (HTTP 403), so additional style-specific IDs are **UNVERIFIED** here.

---

### SanMar (`cdnp.sanmar.com`)

| Observation | Status |
| --- | --- |
| Per-color product photos exist for Port Authority **C936** (SanMar product key family `9437_*`) | **Verified** |
| Host: `https://cdnp.sanmar.com/medias/sys_master/images/...` | **Verified** |
| Filenames encode style + color + view (e.g. `C936IvoryRedFlatFront2`, `C936BlackblackFlatFront`) | **Verified** |
| Full path includes opaque hash folders (`h83/h53/26842218463262/...`) — **not predictable** from color name alone | **Verified** (stripped/guessed paths fail) |
| Two coexisting path shapes (older `.../images/images/h../...` and newer `.../images/h../.../1200W_.../`) | **Verified** |
| Width prefixes in filename: `1200W`, `624Wx724H`, `92W`, `128W`, etc. | **Verified** |

#### Verified working examples (curl: HTTP 200 + `image/jpeg`)

| Style / color | Product page key | Verified URL |
| --- | --- | --- |
| C936 Ivory/Red | `9437_IvoryRed` | https://cdnp.sanmar.com/medias/sys_master/images/h83/h53/26842218463262/1200W_9437_IvoryRed-12-C936IvoryRedFlatFront2/1200W-9437-IvoryRed-12-C936IvoryRedFlatFront2.jpg |
| C936 Ivory/Red (624px) | same | https://cdnp.sanmar.com/medias/sys_master/images/h07/h24/30947565371422/624Wx724H_9437_IvoryRed-12-C936IvoryRedFlatFront2/624Wx724H-9437-IvoryRed-12-C936IvoryRedFlatFront2.jpg |
| C936 Black/Black | `9437_BlkBlk` | https://cdnp.sanmar.com/medias/sys_master/images/images/h6d/h2a/10233201491998/9437-Blackblack-1-C936BlackblackFlatFront-1200W.jpg |
| C936 Charcoal/Black | `9437_CharBlk` | https://cdnp.sanmar.com/medias/sys_master/images/images/h22/h56/10233202573342/9437-CharcoalBlack-1-C936CharcoalBlackFlatFront-1200W.jpg |

Public product pages observed:  
https://www.sanmar.com/p/9437_IvoryRed , `.../9437_BlkBlk`, `.../9437_CharBlk`, `.../9437_IvoryNavy`, `.../9437_IvoryRoyl`.

**UNVERIFIED:** whether every C936 color has a public `/p/9437_*` page without login; whether SanMar exposes a single stable numeric color ID analogous to S&S `colorStyleID` outside feeds.

---

## 2. How color IDs map (name → image)

### S&S

| Question | Answer |
| --- | --- |
| Stable numeric ID per style+color? | **Yes:** `colorStyleID` (also embedded in `Images/Color/{id}_…`). Style uses stable `styleID`. |
| Where it comes from | **Products API** fields `colorFrontImage`, `colorBackImage`, `colorSwatchImage`, etc.; also embedded in public product-page JSON (`colorStyleID`, `name`, `Images: ["Color/{id}_f", ...]`). Same fields appear in Data Library Excel / FTP product files (API v2 field parity). |
| Map plain name `"Black/Charcoal"` without manual work? | **Not from the name alone.** IDs are not derivable from the string. After you pull the API/feed once, you can match names programmatically **if you normalize** S&S spelling (`Black/ Charcoal` with spaces after `/`, `CMB` suffixes, etc.). Exact string match against Hat.co labels will fail without normalization. |
| Swatch ID note | For Richardson 112, `ColorSwatch/{colorStyleID}_fm.jpg` worked. Brand listing pages also referenced other swatch IDs (e.g. 6606 Black swatch `38706` while `colorStyleID` was `44999`). Prefer the **API `colorSwatchImage` path**, not guessing. |

### SanMar

| Question | Answer |
| --- | --- |
| Stable ID? | Product/color keys like `9437_IvoryRed` / `9437_BlkBlk` appear in page URLs; image filenames use concatenated color tokens (`IvoryRed`, `Blackblack`). **UNVERIFIED** whether those are permanent across catalog rebuilds. |
| Where URLs come from | Logged-in **Data Library** (includes image links), **Media Library** (Widen), **flat-file / Web Services / PromoStandards Media Content** (`url` + `color` fields). Third-party integrators also match PromoStandards media by color name. |
| Map plain name without manual work? | **Not by constructing CDN URLs.** You need the feed/library row that already contains the full `cdnp.sanmar.com/...` URL, then match color names (with normalization). |

---

## 3. Official data feeds / APIs — access requirements

### S&S Activewear

| Channel | What you get | Credentials / account level |
| --- | --- | --- |
| **REST API v2** (`api.ssactivewear.com`) | Styles, products/SKUs, inventory, pricing, **image relative paths** | **S&S customer account number** as username + **API key** as password. Key is available from **My Account** (or email `api@ssactivewear.com`). Documented on API pages. |
| **Data Library** (on-demand ZIP of Excel) | Same fields as API v2 product data | Customer login; marketed for non-developer use |
| **Images ZIP** (~1 GB, updated nightly) | Full image library download | Same customer integrations / Data Library area |
| **FTP EDI** | Nightly product data; inventory ~15 min | Legacy; S&S recommends API for new work |
| **PromoStandards** | Inventory, order status, ASN, product data | API key via My Account; `promostandards.ssactivewear.com` |

Sources: https://api.ssactivewear.com/V2/Products.aspx , https://www.ssactivewear.com/marketing/edi

### SanMar

| Channel | What you get | Credentials / account level |
| --- | --- | --- |
| **Data Library** | Specs, SKU/style/color/size, **swatch & image links**, prices, weights; option to download product images | **Logged-in SanMar customer** (site login). Page prompts username/password before “Get Started.” |
| **Media Library** | Thousands of product images / logos via Widen Collective | **SanMar customers only** (Terms §6) |
| **Flat file platform** | On-demand product information files | Integration onboarding |
| **SanMar Web Services** (SOAP) | Product, pricing, inventory, orders, etc. | Issued after integration request: **username, password, customer number**; production host commonly `https://ws.sanmar.com:8080` (integrator docs). Contact **sanmarintegrations@sanmar.com** / (800) 426-6399 ext. 6458 |
| **PromoStandards** | Product data + **Media Content** (among others) | Same integration path; industry PS credentials |

Sources: https://www.sanmar.com/resources/electronicintegration/sanmardatalibrary , https://cdnp.sanmar.com/resources/electronicintegration/integrationofferings , SanMar Terms (Image Library), integrator setup docs summarizing credential fields.

**UNVERIFIED from public pages alone:** exact EDI agreement steps / IP allowlisting for **SanMar US** (documented clearly for SanMar Canada; US process is “contact integration team”).

---

## 4. Terms of use — hotlinking vs self-hosting

### SanMar — clearer download/customer-use language

From SanMar Terms & Conditions (https://cdns.sanmar.com/termsandconditions):

- **§2 Use of the Site:** “You may access, use or download Content for your business only as specifically permitted on the Site… No other use of Content or Marketing Tools is allowed.” Also: protect Content from unauthorized use/reproduction; do not scrape product data to compete with SanMar.
- **§6 Image Library:** “All images… appearing in the SanMar Image Library (‘Images’) are protected by copyright… Images in the SanMar Image Library are intended for use by SanMar customers only… You may not use Images in the Image Library for any purpose unrelated to your business with SanMar… You may only use Images currently appearing in the Image Library…”
- **§7 Custom Websites:** allows downloading/displaying SanMar trademarks and images on a customer site when used properly under the Agreement.

**Hotlinking:** No sentence found that literally says “do not hotlink `cdnp.sanmar.com`.” Combined with “download / Image Library / as specifically permitted,” the intended reseller path is **authorized download + self-host**, not embedding live CDN URLs. Treat hotlinking as **not a permitted integration method**.

### S&S Activewear

- Public FAQ: customers can “**download images from our Image Library**” (https://www.ssactivewear.com/helpcenter/faq).
- Customer Integrations page offers a **nightly ~1 GB images ZIP** and API image path fields (https://www.ssactivewear.com/marketing/edi).
- **UNVERIFIED:** Full legal text of https://www.ssactivewear.com/about/termsofuse and https://www.ssactivewear.com/about/termsandconditions could not be retrieved here (JS-empty / Cloudflare block). No public quote found that explicitly bans CDN hotlinking by name.

**Practical reading:** S&S clearly provides **download + API path** channels for account holders; production should **self-host** downloaded/API-listed assets. Explicit hotlink prohibition text: **UNVERIFIED**.

---

## 5. Practical volume (26 styles)

Hat.co catalog size: **26 styles** (see `docs/hat-size-catalog.md`). Color depth ranges roughly **~20–115+** per style (112 alone ~116 on S&S).

| Assumption | Approx. image count |
| --- | --- |
| Front only, avg 40 colors × 26 | ~**1,040** |
| Front + swatch | ~**2,080** |
| Front + back (+ side) for all colors | ~**3,100–4,200** |
| Low / high band (20–115 colors), front only | ~**520 – 3,000** |
| High band × 3 views | up to ~**9,000** |

**WordPress media library implications**

- Technically fine to store 1–3k optimized WebP/JPEG files (likely tens to a few hundred MB for `_fm`-class assets; `_fl` / SanMar `1200W` much larger).
- Default WP Media Library UI becomes painful at that scale (search, attachments table bloat, backups).
- Prefer: custom mapping table (`style`, `color_name`, `supplier_color_id`, `local_url`) + files on object storage/CDN, or a curated subset in Media Library for top sellers only.
- Lazy-load in the quote UI; do not attach every color image to every page load.

---

## 6. Recommendation

**Most practical path: official feed/API → download → self-host → map by supplier color ID.**

1. **S&S (25 of 26 styles):** Use API v2 (account # + API key) or Data Library Excel to pull `styleName` / `colorName` / `colorFrontImage` (and swatch). Download `_fm` (or `_fs` for chips) assets—or the nightly images ZIP—and serve from Hat.co’s CDN. Store `styleID` + `colorStyleID` beside each Hat.co color option. Normalize slash spacing when matching existing form labels.
2. **SanMar (C936):** Use Data Library / Media Library / Web Services media URLs (customer login or integration credentials). Do **not** invent `cdnp.sanmar.com` paths; store the full URL from the feed, then download.
3. **Do not hotlink** either CDN in production.
4. **Phase 1 UX:** If full catalog ingest is heavy, ship **per-color photos for Good/Better/Best + top sellers** first; keep CSS/name swatches as fallback for the long tail (already aligned with prior form research).
5. Full 26-style × all colors × multi-view in core WP Media Library is **possible but awkward**; custom asset store is cleaner.

**Not a blocker:** Per-color photography exists for the researched styles. The hard part is **authorized access + ID mapping + self-hosting**, not image availability.

---

## Verification notes

| Item | Method |
| --- | --- |
| S&S CDN JPEGs | `curl -sI` / GET — HTTP 200, `content-type: image/jpeg` |
| S&S product-page `colorStyleID` lists for 112 & 6606 | Extracted from publicly indexed product HTML snapshots; live `ssactivewear.com` HTML fetches from this IP often returned Cloudflare **403** |
| SanMar C936 images | Parsed from public product HTML + `curl` verify |
| S&S Terms of Use full body | **UNVERIFIED** (page content not available) |
| SanMar Terms Image Library | Quoted from https://cdns.sanmar.com/termsandconditions |
| Live S&S API call with Hat.co credentials | **UNVERIFIED** (no API key in this environment) |
