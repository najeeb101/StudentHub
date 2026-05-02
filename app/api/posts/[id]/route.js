import { deletePost, getPostById } from "../../../../lib/dataRepository.js";
import { badRequest, forbidden, json, notFound, readJson } from "../../_utils";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return notFound("Post not found");
  }

  return json(post);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return notFound("Post not found");
  }

  const body = await readJson(request);
  if (!body?.userId) {
    return badRequest("userId is required");
  }

  if (post.author.id !== body.userId) {
    return forbidden("You can only delete your own posts");
  }

  await deletePost(id);
  return json({ deleted: true });
}
