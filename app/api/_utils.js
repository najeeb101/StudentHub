export function json(data, init = {}) {
  return Response.json(data, init);
}

export async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export function notFound(message = "Not found") {
  return json({ error: message }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return json({ error: message }, { status: 400 });
}
