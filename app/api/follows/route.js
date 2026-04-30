import { followUser, unfollowUser } from "../../../lib/dataRepository.js";
import { badRequest, json, readJson } from "../_utils";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await readJson(request);

  if (!body?.followerId || !body?.followingId) {
    return badRequest("followerId and followingId are required");
  }

  const follow = await followUser(body.followerId, body.followingId);
  return json(follow, { status: 201 });
}

export async function DELETE(request) {
  const body = await readJson(request);

  if (!body?.followerId || !body?.followingId) {
    return badRequest("followerId and followingId are required");
  }

  const result = await unfollowUser(body.followerId, body.followingId);
  return json(result);
}
