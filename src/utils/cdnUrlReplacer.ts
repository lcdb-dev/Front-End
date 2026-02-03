/**
 * Utility function to replace CDN URLs for images
 * Replaces old CDN with new DigitalOcean Spaces CDN
 */

export function replaceCdnUrl(url: string): string {
  if (!url) return url;

  // Replace the old CDN URL with the new DigitalOcean Spaces URL
  return url.replace(
    'https://cdn.lacuisinedebernard.com/',
    'https://lcdb.fra1.digitaloceanspaces.com/'
  );
}

/**
 * Process article image URLs to use the new CDN
 */
export function processArticleImageUrl(article: any): string {
  if (!article) return '';

  // Check various possible image URL fields
  const possibleUrls = [
    article.featured_image?.asset?.url,
    article.featured_image?.url,
    article.featured_img_url,
    article.featureImage,
    article.featuredImage?.url,
    article.featuredImageUrl
  ];

  // Find the first valid URL
  const imageUrl = possibleUrls.find(url => url && typeof url === 'string');

  if (!imageUrl) return '';

  // Replace CDN URL if needed
  return replaceCdnUrl(imageUrl);
}