import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, url }) => {
  console.log('🔄 [WEBHOOK] GET request received');
  console.log('🔄 [WEBHOOK] Full URL:', url.toString());
  console.log('🔄 [WEBHOOK] Search params string:', url.searchParams.toString());

  try {
    const params = url.searchParams;
    console.log('🔄 [WEBHOOK] Params entries:', Array.from(params.entries()));

    const data = {
      collection: params.get('collection'),
      operation: params.get('operation'),
      id: params.get('id'),
      slug: params.get('slug'),
    };

    console.log('🔄 [WEBHOOK] Extracted data:', data);

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook received',
      data,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('❌ [WEBHOOK] GET Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error processing GET request',
      error: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  console.log('🔄 [WEBHOOK] POST request received');

  try {
    const body = await request.text();
    console.log('🔄 [WEBHOOK] Body:', body);

    return new Response(JSON.stringify({
      success: true,
      message: 'Webhook received',
      body,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  } catch (error) {
    console.error('❌ [WEBHOOK] POST Error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Error processing POST request'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      }
    });
  }
};