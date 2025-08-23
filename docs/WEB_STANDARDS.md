# WEB STANDARDS - Native APIs & Modern JavaScript

**Reference**: https://svelte.dev/docs/kit/web-standards

## FETCH API

### 1. Native Fetch (NO AXIOS!)
```typescript
// ✅ CORRECT - Native fetch
const response = await fetch('/api/products', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(data)
});

// ❌ WRONG - External library
import axios from 'axios';
await axios.post('/api/products', data);
```

### 2. SvelteKit's Enhanced Fetch
```typescript
// +page.ts - Automatic cookie forwarding
export async function load({ fetch }) {
  // This fetch includes cookies automatically
  const response = await fetch('/api/user');
  return {
    user: await response.json()
  };
}
```

### 3. Error Handling
```typescript
try {
  const response = await fetch('/api/data');
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  
  const data = await response.json();
} catch (error) {
  console.error('Fetch failed:', error);
}
```

## FORMDATA API

### 1. Form Handling
```typescript
// ✅ CORRECT - Native FormData
const formData = new FormData();
formData.append('title', 'Product');
formData.append('price', '100');
formData.append('image', fileInput.files[0]);

// Server-side parsing
export async function POST({ request }) {
  const data = await request.formData();
  const title = data.get('title');
  const image = data.get('image') as File;
}

// ❌ WRONG - Manual parsing
const body = await request.text();
const params = new URLSearchParams(body);
```

### 2. File Uploads
```svelte
<form method="POST" enctype="multipart/form-data">
  <input type="file" name="image" accept="image/*">
</form>
```

```typescript
// +page.server.ts
export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const file = data.get('image') as File;
    
    // Validate file
    if (file.size > 5_000_000) {
      return fail(413, { error: 'File too large' });
    }
    
    // Convert to buffer
    const buffer = await file.arrayBuffer();
    // Upload to storage
  }
};
```

## URL API

### 1. URL Manipulation
```typescript
// ✅ CORRECT - Native URL API
const url = new URL(request.url);
const search = url.searchParams.get('q');
const page = url.searchParams.get('page') || '1';

// Build URLs
const apiUrl = new URL('/api/products', url.origin);
apiUrl.searchParams.set('category', 'shirts');

// ❌ WRONG - String manipulation
const search = request.url.split('?')[1];
```

### 2. URL Patterns
```typescript
// Pattern matching
const pattern = new URLPattern({
  pathname: '/product/:id'
});

const match = pattern.exec(url);
if (match) {
  const productId = match.pathname.groups.id;
}
```

## REQUEST & RESPONSE

### 1. Request Object
```typescript
// Access request properties
export async function GET({ request, url, params }) {
  // Headers
  const auth = request.headers.get('authorization');
  
  // Method
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }
  
  // Body (for POST)
  const body = await request.json();
}
```

### 2. Response Object
```typescript
// ✅ CORRECT - Native Response
return new Response(JSON.stringify(data), {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'max-age=3600'
  }
});

// Redirect response
return new Response(null, {
  status: 303,
  headers: {
    'Location': '/success'
  }
});
```

## WEB STREAMS

### 1. Streaming Responses
```typescript
// Stream large data
export async function GET() {
  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of largeData) {
        controller.enqueue(chunk);
        await new Promise(r => setTimeout(r, 10));
      }
      controller.close();
    }
  });
  
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain'
    }
  });
}
```

### 2. Transform Streams
```typescript
const transformStream = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  }
});
```

## WEB CRYPTO

### 1. Hashing
```typescript
// Generate hash
async function hash(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### 2. Random Values
```typescript
// Generate secure random ID
const id = crypto.randomUUID();

// Random bytes
const buffer = new Uint8Array(16);
crypto.getRandomValues(buffer);
```

## HEADERS

### 1. Security Headers
```typescript
export async function handle({ event, resolve }) {
  const response = await resolve(event);
  
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}
```

### 2. CORS Headers
```typescript
// +server.ts
export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
```

## COOKIES

### 1. Cookie API
```typescript
// Set cookie
cookies.set('session', value, {
  path: '/',
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 60 * 60 * 24 * 7 // 1 week
});

// Get cookie
const session = cookies.get('session');

// Delete cookie
cookies.delete('session', { path: '/' });
```

## MODERN JAVASCRIPT

### 1. ES Modules
```typescript
// ✅ CORRECT - ES modules
import { function } from './module.js';
export { something };

// ❌ WRONG - CommonJS
const module = require('./module');
module.exports = something;
```

### 2. Async/Await
```typescript
// ✅ CORRECT
async function getData() {
  const response = await fetch('/api');
  return response.json();
}

// ❌ WRONG - Callbacks
fetch('/api').then(r => r.json()).then(data => {});
```

## RULES

- ✅ Use native Fetch API
- ✅ Use FormData for forms
- ✅ Use URL for URL manipulation
- ✅ Use Web Crypto for security
- ✅ Use ES modules
- ❌ No axios or fetch libraries
- ❌ No jQuery or old patterns
- ❌ No CommonJS
- ❌ No polyfills for modern APIs