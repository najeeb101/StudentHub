import {
  createComment,
  getCommentsByPostId,
  getPostById,
} from "../../../../../lib/dataRepository.js";
import { badRequest, json, notFound, readJson } from "../../../_utils";

export const runtime = "nodejs";

export async function GET(_request, { params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return notFound("Post not found");
  }

  const comments = await getCommentsByPostId(id);
  return json(comments);
}

export async function POST(request, { params }) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    return notFound("Post not found");
  }

  const body = await readJson(request);

  if (!body?.authorId || !body?.text) {
    return badRequest("authorId and text are required");
  }

  const comment = await createComment({
    postId: id,
    authorId: body.authorId,
    text: body.text,
  });

  return json(comment, { status: 201 });
}
