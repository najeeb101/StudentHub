import { followUser, getUserById, unfollowUser } from "../../../lib/dataRepository.js";
import { badRequest, json, notFound, readJson, serverError } from "../_utils";

export const runtime = "nodejs";

export async function POST(request) {
  const body = await readJson(request);

  if (!body?.followerId || !body?.followingId) {
    return badRequest("followerId and followingId are required");
  }

  if (body.followerId === body.followingId) {
    return badRequest("You cannot follow yourself");
  }

  const [follower, following] = await Promise.all([
    getUserById(body.followerId),
    getUserById(body.followingId),
  ]);

  if (!follower || !following) {
    return notFound("User not found");
  }

  try {
    const follow = await followUser(body.followerId, body.followingId);
    return json(follow, { status: 201 });
  } catch {
    return serverError("Could not follow user");
  }
}

export async function DELETE(request) {
  const body = await readJson(request);

  if (!body?.followerId || !body?.followingId) {
    return badRequest("followerId and followingId are required");
  }

  const follower = await getUserById(body.followerId);
  if (!follower) {
    return notFound("User not found");
  }

  const result = await unfollowUser(body.followerId, body.followingId);
  return json(result);
}
