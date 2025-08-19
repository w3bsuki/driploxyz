import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json({ 
    success: true, 
    message: 'Test endpoint working',
    timestamp: new Date().toISOString()
  });
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    const body = await request.json();
    return json({ 
      success: true, 
      message: 'POST working',
      received: body,
      timestamp: new Date().toISOString()
    });
  } catch (e: any) {
    return json({ 
      success: false, 
      error: e.message 
    }, { status: 400 });
  }
};