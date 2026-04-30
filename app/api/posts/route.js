import { createPost, getPosts } from "../../../lib/dataRepository.js";
import { badRequest, json, readJson } from "../_utils";

export const runtime = "nodejs";

export async function GET() {
  const posts = await getPosts();
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
