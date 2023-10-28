import {
  assertEquals,
  assertFalse,
  assertNotEquals,
} from "https://deno.land/std@0.201.0/assert/mod.ts";
import { uuid } from "https://deno.land/x/uuid@v0.1.2/mod.ts";

import { cachingFetch } from "./cache.ts";

class UUIDServer {
  #abortController: AbortController;
  #server: Deno.Server;

  constructor(opts: Deno.ServeOptions) {
    this.#abortController = new AbortController();
    this.#server = Deno.serve(
      { ...opts, signal: this.#abortController.signal },
      (req) =>
        new Response(
          uuid(),
          req.url.includes("cake")
            ? {
              status: 404,
              statusText: "The cake is a lie",
            }
            : undefined,
        ),
    );
  }

  shutdown(): Promise<void> {
    this.#abortController.abort();
    return this.#server.finished;
  }
}

Deno.test("Regular `fetch` retrieves distinct UUIDs from the test server each time", async () => {
  const server = new UUIDServer({ port: 8444 });

  const receivedIds = new Set();
  for (let i = 0; i < 100; ++i) {
    const response = await fetch("http://localhost:8444");
    const id = await response.text();
    assertFalse(receivedIds.has(id), `ID '${id}' was previously received`);
    receivedIds.add(id);
  }

  await server.shutdown();
});

Deno.test("`cachingFetch` retrieves the same UUID from the test server multiple times", async () => {
  const cacheName = `test-cache-${uuid()}`;
  const server = new UUIDServer({ port: 8444 });

  const receivedIds = new Set();
  for (let i = 0; i < 100; ++i) {
    const response = await cachingFetch(
      new Request("http://localhost:8444"),
      cacheName,
    );
    const id = await response.text();
    receivedIds.add(id);
  }

  assertEquals(receivedIds.size, 1);

  await server.shutdown();
});

Deno.test("`cachingFetch` retrieves the same UUID from the test server, even for requests differing by cookie", async () => {
  const cacheName = `test-cache-${uuid()}`;
  const server = new UUIDServer({ port: 8444 });

  async function cachingFetchBodyWithCookie(
    cookie: string,
    cacheName: string,
  ): Promise<string> {
    const req = new Request("http://localhost:8444");
    req.headers.append("Cookie", cookie);

    const response = await cachingFetch(
      req,
      cacheName,
    );
    return await response.text();
  }

  assertEquals(
    await cachingFetchBodyWithCookie("session=123", cacheName),
    await cachingFetchBodyWithCookie("session=456", cacheName),
  );

  await server.shutdown();
});

Deno.test("`cachingFetch` retrieves different UUIDs from the test server when different caches are used", async () => {
  const server = new UUIDServer({ port: 8444 });

  async function cachingFetchBody(
    cacheName: string,
  ): Promise<string> {
    const response = await cachingFetch(
      new Request("http://localhost:8444"),
      cacheName,
    );
    return await response.text();
  }

  assertNotEquals(
    await cachingFetchBody(`test-cache-${uuid()}`),
    await cachingFetchBody(`test-cache-${uuid()}`),
  );

  await server.shutdown();
});

Deno.test("`catchingFetch` retrieves different UUIDs from the test server when response status is not OK", async () => {
  const cacheName = `test-cache-${uuid()}`;
  const server = new UUIDServer({ port: 8444 });

  async function cachingFetchBody(
    cacheName: string,
  ): Promise<string> {
    const response = await cachingFetch(
      new Request("http://localhost:8444/cake"),
      cacheName,
    );
    assertNotEquals(response.status, 200);
    return await response.text();
  }

  assertNotEquals(
    await cachingFetchBody(cacheName),
    await cachingFetchBody(cacheName),
  );

  await server.shutdown();
});
