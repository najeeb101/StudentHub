import {
  createComment,
  getCommentsByPostId,
  getPostById,
  getUserById,
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

  const text = body.text.trim();
  if (!text) {
    return badRequest("text cannot be blank");
  }

  const author = await getUserById(body.authorId);
  if (!author) {
    return notFound("Author not found");
  }

  const comment = await createComment({
    postId: id,
    authorId: body.authorId,
    text,
  });

  return json(comment, { status: 201 });
}
