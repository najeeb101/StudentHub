import { getUserById, updateUser } from "../../../../lib/dataRepository.js";
import { badRequest, json, notFound, readJson } from "../../_utils";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    return notFound("User not found");
  }

  return json(user);
}

export async function PATCH(request, { params }) {
  const { id } = await params;
  const body = await readJson(request);

  if (!body) {
    return badRequest("Request body is required");
  }

  const user = await getUserById(id);
  if (!user) {
    return notFound("User not found");
  }

  const allowed = ["username", "bio", "photo"];
  const data = Object.fromEntries(
    Object.entries(body).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(data).length === 0) {
    return badRequest("No valid fields to update");
  }

  const updated = await updateUser(id, data);
  return json(updated);
}
