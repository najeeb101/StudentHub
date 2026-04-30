import { createUser, getUsers } from "../../../lib/dataRepository.js";
import { badRequest, json, readJson } from "../_utils";

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

  const user = await createUser({
    name: body.name,
    username: body.username,
    email: body.email,
    password: body.password,
    bio: body.bio ?? null,
    photo: body.photo ?? null,
    gender: body.gender ?? null,
  });

  return json(user, { status: 201 });
}
