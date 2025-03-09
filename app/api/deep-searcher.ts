import { NextRequest, NextResponse } from "next/server";
import { getServerSideConfig } from "@/app/config/server";

export async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[DeepSearcher] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  const controller = new AbortController();

  const serverConfig = getServerSideConfig();

  // let baseUrl = serverConfig.stabilityUrl || STABILITY_BASE_URL;
  let baseUrl = `http://localhost:8000/query/`;

  if (!baseUrl.startsWith("http")) {
    baseUrl = `https://${baseUrl}`;
  }

  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.slice(0, -1);
  }

  let path = `${req.nextUrl.pathname}`.replaceAll("/api/deepsearcher/", "");

  console.log("[DeepSearcher Proxy] ", path);
  console.log("[DeepSearcher Base Url]", baseUrl);

  const timeoutId = setTimeout(
    () => {
      controller.abort();
    },
    10 * 60 * 1000,
  );

  // const authResult = auth(req, ModelProvider.Stability);

  // if (authResult.error) {
  //   return NextResponse.json(authResult, {
  //     status: 401,
  //   });
  // }

  // const bearToken = req.headers.get("Authorization") ?? "";
  // const token = bearToken.trim().replaceAll("Bearer ", "").trim();

  // const key = token ? token : serverConfig.stabilityApiKey;

  // if (!key) {
  //   return NextResponse.json(
  //     {
  //       error: true,
  //       message: `missing STABILITY_API_KEY in server env vars`,
  //     },
  //     {
  //       status: 401,
  //     },
  //   );
  // }

  // const formData = await req.formData(); // 解析 FormData
  // const original_query = formData.get("original_query") as string;
  // const max_iter = formData.get("max_iter") as string;
  const { searchParams } = new URL(req.url);
  const original_query = searchParams.get("original_query");
  const max_iter = searchParams.get("max_iter");
  if (!original_query) {
    return NextResponse.json(
      {
        error: true,
        message: `missing original_query`,
      },
      {
        status: 400,
      },
    );
  }

  const url = new URL(`http://172.16.81.17:8000/query/`);
  url.searchParams.append("original_query", original_query || "");
  url.searchParams.append("max_iter", max_iter?.toString() || "3");

  const fetchUrl = url.toString();

  console.log("[DeepSearcher Url] ", fetchUrl);
  const fetchOptions: RequestInit = {
    headers: {
      "Content-Type": req.headers.get("Content-Type") || "multipart/form-data",
      Accept: req.headers.get("Accept") || "application/json",
      // Authorization: `Bearer ${key}`,
    },
    method: req.method,
    // body: req.body,
    // to fix #2485: https://stackoverflow.com/questions/55920957/cloudflare-worker-typeerror-one-time-use-body
    redirect: "manual",
    // @ts-ignore
    duplex: "half",
    signal: controller.signal,
  };

  try {
    const res = await fetch(fetchUrl, fetchOptions);
    // to prevent browser prompt for credentials
    const newHeaders = new Headers(res.headers);
    newHeaders.delete("www-authenticate");
    // to disable nginx buffering
    newHeaders.set("X-Accel-Buffering", "no");
    return new Response(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers: newHeaders,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
