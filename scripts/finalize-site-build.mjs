import { mkdir, rm, writeFile } from "node:fs/promises";

const worker = `const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (response.status !== 404 || request.method !== "GET") return response;

    const url = new URL(request.url);
    if (url.pathname.includes(".")) return response;

    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  },
};

export default worker;
`;

await mkdir("dist/server", { recursive: true });
await rm("dist/client/.DS_Store", { force: true });
await writeFile("dist/server/index.js", worker);
