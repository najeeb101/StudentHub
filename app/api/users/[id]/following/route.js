import {
  getFollowing,
  getUserById,
} from "../../../../../lib/dataRepository.js";
import { json, notFound } from "../../../_utils";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const user = await getUserById(params.id);

  if (!user) {
    return notFound("User not found");
  }

  const following = await getFollowing(params.id);
  return json(following);
}
