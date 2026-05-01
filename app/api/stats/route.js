import {
  getAvgCommentsPerPost,
  getAvgFollowersPerUser,
  getAvgPostsPerUser,
  getMostFollowedUser,
  getMostLikedPost,
  getTotalUsers,
} from "../../../lib/dataRepository.js";
import { json } from "../_utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const [
      totalUsers,
      avgFollowers,
      avgPosts,
      mostLikedPost,
      mostFollowedUser,
      avgComments,
    ] = await Promise.all([
      getTotalUsers(),
      getAvgFollowersPerUser(),
      getAvgPostsPerUser(),
      getMostLikedPost(),
      getMostFollowedUser(),
      getAvgCommentsPerPost(),
    ]);

    return json({
      totalUsers,
      avgFollowers: Math.round(avgFollowers * 10) / 10,
      avgPosts: Math.round(avgPosts * 10) / 10,
      mostLikedPost,
      mostFollowedUser,
      avgComments: Math.round(avgComments * 10) / 10,
    });
  } catch (err) {
    return json({ error: "Could not load statistics" }, { status: 500 });
  }
}
