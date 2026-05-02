import { getUserById, updateUser } from "../../../../lib/dataRepository.js";
import {
  badRequest,
  conflict,
  isUniqueConstraintError,
  json,
  notFound,
  readJson,
  serverError,
} from "../../_utils";

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
    Object.entries(body)
      .filter(([k]) => allowed.includes(k))
      .map(([k, v]) => [k, typeof v === "string" ? v.trim() : v])
  );

  if (Object.keys(data).length === 0) {
    return badRequest("No valid fields to update");
  }

  if (Object.hasOwn(data, "username") && !data.username) {
    return badRequest("Username cannot be blank");
  }

  try {
    const updated = await updateUser(id, data);
    return json(updated);
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return conflict("Username already exists");
    }

    return serverError("Could not update user");
  }
}
