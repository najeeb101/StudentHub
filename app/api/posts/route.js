import { createPost, getPosts, getPostsByAuthor } from "../../../lib/dataRepository.js";
import { badRequest, json, readJson } from "../_utils";

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

  const post = await createPost({
    authorId: body.authorId,
    text: body.text,
  });

  return json(post, { status: 201 });
}
