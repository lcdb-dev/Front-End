import type { APIRoute } from 'astro';
import { getAllArticlesFromMongo } from '../../lib/mongo.server';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    if (!query || query.length < 2) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Query must be at least 2 characters long'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get all articles for search
    const allArticles = await getAllArticlesFromMongo();

    // Simple text search in title and content
    const searchResults = allArticles
      .filter(article => {
        const title = (article.title || '').toLowerCase();
        const content = (article.content || '').toLowerCase();
        const searchTerm = query.toLowerCase();

        return title.includes(searchTerm) || content.includes(searchTerm);
      })
      .slice((page - 1) * limit, page * limit)
      .map(article => ({
        id: article._id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        date: article.date,
        categories: article.categories,
        tags: article.tags
      }));

    return new Response(JSON.stringify({
      success: true,
      query,
      page,
      limit,
      total: searchResults.length,
      results: searchResults
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Search API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Search failed',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};