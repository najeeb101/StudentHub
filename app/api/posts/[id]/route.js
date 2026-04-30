import { deletePost, getPostById } from "../../../../lib/dataRepository.js";
import { json, notFound } from "../../_utils";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const post = await getPostById(params.id);

  if (!post) {
    return notFound("Post not found");
  }

  return json(post);
}

export async function DELETE(_request, { params }) {
  const post = await getPostById(params.id);

  if (!post) {
    return notFound("Post not found");
  }

  await deletePost(params.id);
  return json({ deleted: true });
}
