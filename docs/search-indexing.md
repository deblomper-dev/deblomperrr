# Search visibility

The production Vite build prerenders the homepage, work index, and every project
from `lib/data/projects.ts`. Each page ships its content, canonical URL, unique
metadata, and structured data in the initial HTML. React hydrates that content
and updates metadata during client navigation.

`lib/seo.ts` associates Ankit Kumar with the public alias `deblomper` and the real
GitHub handle `deblomper-dev`. Keep this identity consistent when editing profile
copy or public social profiles.

**Build and verify**

```sh
npm run build
npm test
npm run test:seo
npm run lint
npx tsc --noEmit
npm start
```

Deploy the complete `dist` directory using the existing Docker image or Node
server. `dist/server.js` serves only `dist/client`; its server code is outside the
public document root. A generic SPA host would need equivalent redirect and 404
rules. `vite preview` is for local previews, not the production server.

The build generates `dist/client/sitemap.xml` from the same project data as the
pages. Do not add a separate hand-maintained sitemap to `public`. Historical
project links are preserved by permanent redirects in `lib/routes.ts`. Unknown
pages return HTTP 404 with `noindex` instead of a successful homepage response.

**After deployment**

1. Open [Google Search Console](https://search.google.com/search-console) and
   select the property covering `https://deblomper.dev/`.
2. If the property needs verification, use Google's supplied verification method.
   The existing `googleb8840d98f92f85af.html` file is preserved; a different account
   or property may require a different token.
3. Submit `https://deblomper.dev/sitemap.xml` in Sitemaps.
4. Inspect `https://deblomper.dev/`, run the live URL test, confirm that the page
   can be indexed, and request indexing. Repeat for priority project pages if
   needed.
5. Monitor Page indexing for crawl or indexing errors, then Performance for the
   query `deblomper`. Indexing and ranking are separate; code changes cannot
   guarantee either or force Google's recrawl schedule.

These repository changes do not submit the sitemap or request indexing on your
behalf. Those actions require the verified Search Console property.
