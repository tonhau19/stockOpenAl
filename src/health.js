import { createServer } from 'node:http';

/**
 * Start a minimal HTTP healthcheck server for PaaS platforms such as Render.
 * Responds on GET / and GET /healthz with JSON status.
 */
export function startHealthServer(port, getStatus) {
  const server = createServer((req, res) => {
    const path = (req.url || '/').split('?')[0];
    if (req.method === 'GET' && (path === '/' || path === '/healthz')) {
      const body = JSON.stringify({
        status: 'ok',
        service: 'ai-stock-hunter-vn',
        ...getStatus(),
      });
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(body);
      return;
    }
    res.writeHead(404, { 'content-type': 'application/json; charset=utf-8' });
    res.end('{"error":"Not Found"}');
  });
  server.listen(port, '0.0.0.0');
  return server;
}
