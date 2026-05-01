import {
  deleteComment,
  getCommentById,
} from "../../../../lib/dataRepository.js";
import { badRequest, json, notFound, readJson } from "../../_utils";

export const runtime = "nodejs";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const body = await readJson(request);

  if (!body?.userId) {
    return badRequest("userId is required");
  }

  const comment = await getCommentById(id);

  if (!comment) {
    return notFound("Comment not found");
  }

  if (comment.author.id !== body.userId) {
    return json({ error: "You can only delete your own comments" }, { status: 403 });
  }

  await deleteComment(id);
  return json({ deleted: true });
}
