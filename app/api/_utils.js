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

export function forbidden(message = "Forbidden") {
  return json({ error: message }, { status: 403 });
}

export function conflict(message = "Conflict") {
  return json({ error: message }, { status: 409 });
}

export function serverError(message = "Server error") {
  return json({ error: message }, { status: 500 });
}

export function isUniqueConstraintError(error) {
  return error?.code === "P2002";
}
