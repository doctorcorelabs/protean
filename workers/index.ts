import {
  GoogleGenAI,
  Content,
} from '@google/genai';

export interface Env {
  GEMINI_API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: any): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      if (path.startsWith('/api/gemini/')) {
        return await handleGeminiRequest(request, env, corsHeaders);
      }

      // RCSB proxy endpoints to avoid browser CORS issues
      if (path.startsWith('/api/rcsb/')) {
        // Map /api/rcsb/rest/v1/* -> https://data.rcsb.org/rest/v1/*
        // Map /api/rcsb/graphql -> https://data.rcsb.org/graphql
        // Map /api/rcsb/files/* -> https://files.rcsb.org/*
        // Map /api/rcsb-search -> https://search.rcsb.org/rcsbsearch/v2/query
        return await proxyRCSB(request, corsHeaders);
      }

      switch (path) {
        case '/api/health':
          return new Response(JSON.stringify({ status: 'healthy', timestamp: new Date().toISOString() }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        case '/':
          return new Response(JSON.stringify({ message: 'AI Molecular Research Worker API', status: 'running' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        default:
          return new Response(JSON.stringify({ error: 'Not Found', path: path }), {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      return new Response(JSON.stringify({ error: 'Internal Server Error', details: errorMessage }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
}


async function handleGeminiRequest(request: Request, env: Env, corsHeaders: any): Promise<Response> {
  if (!env.GEMINI_API_KEY) {
    return new Response(JSON.stringify({ error: 'GEMINI_API_KEY is not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const ai = new GoogleGenAI({
    apiKey: env.GEMINI_API_KEY,
  });

  let requestBody;
  try {
    requestBody = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const { prompt } = requestBody;

  if (!prompt || typeof prompt !== 'string') {
    return new Response(JSON.stringify({ error: 'Prompt is required and must be a string' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const contents: Content[] = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
      ],
    },
  ];

  try {
    const model = 'gemini-2.5-flash-lite';
    const response = await ai.models.generateContentStream({
      model,
      contents,
    });

    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    (async () => {
      for await (const chunk of response) {
        if (chunk.text) {
          writer.write(encoder.encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`));
        }
      }
      writer.close();
    })();

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Error calling Gemini API:', error);
    return new Response(JSON.stringify({ error: 'Failed to get response from Gemini', details: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

async function proxyRCSB(request: Request, corsHeaders: any): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  let target: string | null = null;
  if (path.startsWith('/api/rcsb/rest/')) {
    // Strip /api/rcsb and forward to data.rcsb.org
    const restPath = path.replace('/api/rcsb', ''); // now /rest/v1/...
    target = `https://data.rcsb.org${restPath}${url.search}`;
  } else if (path === '/api/rcsb/graphql') {
    target = 'https://data.rcsb.org/graphql';
  } else if (path.startsWith('/api/rcsb/files/')) {
    const filesPath = path.replace('/api/rcsb/files', '');
    target = `https://files.rcsb.org${filesPath}${url.search}`;
  } else if (path === '/api/rcsb-search') {
    target = 'https://search.rcsb.org/rcsbsearch/v2/query';
  }

  if (!target) {
    return new Response(JSON.stringify({ error: 'Invalid RCSB proxy path' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Build outbound request
  const init: RequestInit = {
    method: request.method,
    // Forward headers except host
    headers: new Headers(
      [...request.headers].filter(([name]) => name.toLowerCase() !== 'host')
    ),
    body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.arrayBuffer(),
    redirect: 'follow',
  };

  try {
    const resp = await fetch(target, init);

    // Stream back the response with permissive CORS
    const responseHeaders = new Headers(resp.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    return new Response(resp.body, {
      status: resp.status,
      statusText: resp.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fetch failed';
    return new Response(JSON.stringify({ error: 'Proxy request failed', details: message, target }), {
      status: 502,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
