import { getAllArticlesFromMongo } from '../src/lib/mongo.server.js';
import { processArticleImageUrl } from '../src/utils/cdnUrlReplacer.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSearchIndex() {
  try {
    console.log('🔍 Generating search index...');

    // Get all articles
    const articles = await getAllArticlesFromMongo();
    console.log(`📊 Found ${articles.length} articles to process`);

    // Create search index with relevant fields and progress bar
    console.log('⚙️  Processing articles...');
    const searchIndex = [];
    const total = articles.length;

    for (let i = 0; i < total; i++) {
      const article = articles[i];
      const processedArticle = {
        id: article._id.toString(),
        title: article.title || '',
        content: article.content ? article.content.replace(/<[^>]*>/g, '').substring(0, 1000) : '', // Strip HTML and limit content
        excerpt: article.excerpt || '',
        slug: article.slug || '',
        category: article.category?.name || '',
        tags: article.tags?.map(tag => tag.name).join(' ') || '',
        author: article.author?.name || '',
        publishedAt: article.publishedAt || '',
        featured_image: {
          url: processArticleImageUrl(article),
          alt: article.featured_image?.alt || article.title
        },
        // Combine searchable text
        searchableText: [
          article.title || '',
          article.excerpt || '',
          article.content ? article.content.replace(/<[^>]*>/g, '') : '',
          article.category?.name || '',
          article.tags?.map(tag => tag.name).join(' ') || '',
          article.author?.name || ''
        ].join(' ').toLowerCase()
      };

      searchIndex.push(processedArticle);

      // Update progress every 10 articles or at the end
      if ((i + 1) % 10 === 0 || i === total - 1) {
        const progress = ((i + 1) / total * 100).toFixed(1);
        const barWidth = 40;
        const filled = Math.round((i + 1) / total * barWidth);
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);
        process.stdout.write(`\r📈 Progress: [${bar}] ${i + 1}/${total} (${progress}%)`);
      }
    }

    console.log('\n✅ Processing complete!');

    // Write to public/search-index.json
    const outputPath = path.join(__dirname, '..', 'public', 'search-index.json');
    console.log('💾 Writing search index to file...');
    fs.writeFileSync(outputPath, JSON.stringify(searchIndex, null, 2));

    console.log(`🎉 Search index generated with ${searchIndex.length} articles at ${outputPath}`);
  } catch (error) {
    console.error('❌ Error generating search index:', error);
    process.exit(1);
  }
}

generateSearchIndex();