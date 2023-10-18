export async function cachingFetch(
  req: Request,
  cacheName: string,
): Promise<Response> {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(req);
  if (cachedResponse !== undefined) {
    return cachedResponse;
  }

  const response = await fetch(req);
  await cache.put(req, response);
  return (await cache.match(req))!;
}
