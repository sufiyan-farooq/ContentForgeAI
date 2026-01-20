// app/api/upload-document/route.ts

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the FormData from client
    const formData = await request.formData();
    
    // Forward to N8N webhook
    const response = await fetch(
      'https://serbay.app.n8n.cloud/webhook/87f97854-d2b0-4c35-baf8-4ed9d48ef702',
      {
        method: 'POST',
        body: formData,
        // N8N server-to-server call me CORS issue nahi hoga
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `N8N webhook failed: ${errorText}` },
        { status: response.status }
      );
    }

    // Get response from N8N
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const textData = await response.text();
      try {
        data = JSON.parse(textData);
      } catch {
        data = { webViewLink: textData };
      }
    }
    
    return NextResponse.json(
      { success: true, data },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle OPTIONS preflight request
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}