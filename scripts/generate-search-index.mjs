import { processArticleImageUrl } from '../src/utils/cdnUrlReplacer.ts';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSearchIndex() {
  try {
    console.log('[SEARCH] Generating search index...');

    // Dynamic import keeps this script compatible with tsx in CJS/ESM contexts.
    const { getAllArticlesFromMongo: getArticles } = await import('../src/lib/mongo.server.ts');
    const articles = await getArticles();
    console.log(`[SEARCH] Found ${articles.length} articles to process`);

    console.log('[SEARCH] Processing articles...');
    const searchIndex = [];
    const total = articles.length;

    for (let i = 0; i < total; i++) {
      const article = articles[i];
      const slug = typeof article.slug === 'string' ? article.slug : article.slug?.current || '';

      const processedArticle = {
        id: article._id?.toString() || '',
        title: article.title || '',
        content: article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 1000) : '',
        excerpt: article.excerpt || '',
        slug,
        category: article.category?.name || '',
        tags: article.tags?.map((tag) => tag.name).join(' ') || '',
        author: article.author?.name || '',
        publishedAt: article.publishedAt || '',
        featured_image: {
          url: processArticleImageUrl(article),
          alt: article.featured_image?.alt || article.title || '',
        },
        searchableText: [
          article.title || '',
          article.excerpt || '',
          article.content ? article.content.replace(/<[^>]*>/g, '') : '',
          article.category?.name || '',
          article.tags?.map((tag) => tag.name).join(' ') || '',
          article.author?.name || '',
        ].join(' ').toLowerCase(),
      };

      searchIndex.push(processedArticle);

      if ((i + 1) % 10 === 0 || i === total - 1) {
        const progress = ((i + 1) / total * 100).toFixed(1);
        const barWidth = 40;
        const filled = Math.round(((i + 1) / total) * barWidth);
        const bar = '#'.repeat(filled) + '-'.repeat(barWidth - filled);
        process.stdout.write(`\r[SEARCH] Progress: [${bar}] ${i + 1}/${total} (${progress}%)`);
      }
    }

    console.log('\n[SEARCH] Processing complete.');

    const outputPath = path.join(__dirname, '..', 'public', 'search-index.json');
    console.log('[SEARCH] Writing search index to file...');
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));

    console.log(`[SEARCH] Search index generated with ${searchIndex.length} articles at ${outputPath}`);
  } catch (error) {
    console.error('[SEARCH] Error generating search index:', error);
    process.exit(1);
  }
}

generateSearchIndex();
