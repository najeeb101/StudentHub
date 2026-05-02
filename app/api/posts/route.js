import {
  createPost,
  getPosts,
  getPostsByAuthor,
  getUserById,
} from "../../../lib/dataRepository.js";
import { badRequest, json, notFound, readJson, serverError } from "../_utils";

export const runtime = "nodejs";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const authorId = searchParams.get("authorId");
  const posts = authorId ? await getPostsByAuthor(authorId) : await getPosts();
  return json(posts);
}

export async function POST(request) {
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

  try {
    const post = await createPost({
      authorId: body.authorId,
      text,
    });

    return json(post, { status: 201 });
  } catch {
    return serverError("Could not create post");
  }
}
