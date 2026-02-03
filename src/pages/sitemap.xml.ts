import { payloadFetch } from '../lib/payload.client';

export async function GET() {
  const baseUrl = 'https://lacuisinedebernard.com';
  const urls = [];
  const today = new Date().toISOString().split("T")[0];

  // Root home
  urls.push({
    loc: `${baseUrl}/`,
    priority: "1.0",
    changefreq: "daily",
    lastmod: today
  });

  // Categories page
  urls.push({
    loc: `${baseUrl}/categories`,
    priority: "0.9",
    changefreq: "weekly",
    lastmod: today
  });

  // Tags page
  urls.push({
    loc: `${baseUrl}/tags`,
    priority: "0.9",
    changefreq: "weekly",
    lastmod: today
  });

  // Search page
  urls.push({
    loc: `${baseUrl}/search`,
    priority: "0.8",
    changefreq: "weekly",
    lastmod: today
  });

  // Fetch all articles from Sanity
  const articles = await sanityFetch({
    query: `*[_type == "article"] { slug, modified }`
  });

  if (articles && Array.isArray(articles)) {
    articles.forEach((article: any) => {
      urls.push({
        loc: `${baseUrl}/${article.slug.current}`,
        priority: "0.8",
        changefreq: "weekly",
        lastmod: article.modified || today
      });
    });
  }

  // Fetch all categories from Sanity
  const categories = await sanityFetch({
    query: `*[_type == "category"] { slug }`
  });

  if (categories && Array.isArray(categories)) {
    categories.forEach((cat: any) => {
      urls.push({
        loc: `${baseUrl}/categories/${cat.slug.current}`,
        priority: "0.7",
        changefreq: "weekly",
        lastmod: today
      });
    });
  }

  // Fetch all tags from Sanity
  const tags = await sanityFetch({
    query: `*[_type == "tag"] { slug }`
  });

  if (tags && Array.isArray(tags)) {
    tags.forEach((tag: any) => {
      urls.push({
        loc: `${baseUrl}/tags/${tag.slug.current}`,
        priority: "0.7",
        changefreq: "weekly",
        lastmod: today
      });
    });
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
  .map(
    (url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600"
    }
  });
}
