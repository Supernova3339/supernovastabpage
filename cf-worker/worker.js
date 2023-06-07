// The following code is run on Cloudflare and not bundled with the extension due to CORS policies.

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const apiUrl = 'https://zenquotes.io/api/random';

  // Make a new request to the ZenQuotes API
  const response = await fetch(apiUrl);

  // Add necessary CORS headers to the response
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Headers', 'Content-Type');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Create a new response with the modified headers and original body
  const modifiedResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });

  return modifiedResponse;
}
