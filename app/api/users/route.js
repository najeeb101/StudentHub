import { createUser, getUsers } from "../../../lib/dataRepository.js";
import {
  badRequest,
  conflict,
  isUniqueConstraintError,
  json,
  readJson,
  serverError,
} from "../_utils";

export const runtime = "nodejs";

export async function GET() {
  const users = await getUsers();
  return json(users);
}

export async function POST(request) {
  const body = await readJson(request);

  if (!body?.name || !body?.username || !body?.email || !body?.password) {
    return badRequest("name, username, email, and password are required");
  }

  const name = body.name.trim();
  const username = body.username.trim();
  const email = body.email.trim().toLowerCase();

  if (!name || !username || !email) {
    return badRequest("name, username, and email cannot be blank");
  }

  try {
    const user = await createUser({
      name,
      username,
      email,
      password: body.password,
      bio: body.bio ?? null,
      photo: body.photo ?? null,
      gender: body.gender ?? null,
    });

    return json(user, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return conflict("Email or username already exists");
    }

    return serverError("Could not create user");
  }
}
