import type { APIRoute } from 'astro';
import { MongoClient, ObjectId } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || '';
const DB_NAME = 'lcdb';

export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const articleId = url.searchParams.get('articleId');

    if (!articleId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Article ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const comments = await db.collection('comments')
      .find({ articleId: new ObjectId(articleId) })
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return new Response(JSON.stringify({
      success: true,
      comments: comments.map(comment => ({
        id: comment._id,
        name: comment.name,
        email: comment.email,
        content: comment.content,
        createdAt: comment.createdAt
      }))
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Comments API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch comments',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { articleId, name, email, content } = body;

    if (!articleId || !name || !email || !content) {
      return new Response(JSON.stringify({
        success: false,
        message: 'All fields are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(DB_NAME);
    const result = await db.collection('comments').insertOne({
      articleId: new ObjectId(articleId),
      name: name.trim(),
      email: email.trim(),
      content: content.trim(),
      createdAt: new Date()
    });

    await client.close();

    return new Response(JSON.stringify({
      success: true,
      message: 'Comment added successfully',
      commentId: result.insertedId
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Comments API error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
