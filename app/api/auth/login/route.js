import { getUserByEmail } from "../../../../lib/dataRepository.js";
import { badRequest, json, readJson } from "../../_utils";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await readJson(request);

  if (!body?.email || !body?.password) {
    return badRequest("email and password are required");
  }

  const user = await getUserByEmail(body.email.toLowerCase());

  if (!user || user.password !== body.password) {
    return json({ error: "Invalid email or password" }, { status: 401 });
  }

  const { password: _omit, ...userWithoutPassword } = user;
  return json(userWithoutPassword);
}
