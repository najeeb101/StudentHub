import { getPostById, toggleLike } from "../../../../../lib/dataRepository.js";
import { badRequest, json, notFound, readJson } from "../../../_utils";

export const runtime = "nodejs";

export async function POST(request, { params }) {
  const post = await getPostById(params.id);

  if (!post) {
    return notFound("Post not found");
  }

  const body = await readJson(request);

  if (!body?.userId) {
    return badRequest("userId is required");
  }

  const result = await toggleLike(params.id, body.userId);
  return json(result, { status: result.liked ? 201 : 200 });
}
