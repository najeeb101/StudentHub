import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { copyFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const vercelDbPath = join(tmpdir(), "studenthub.db");
const dbUrl =
  process.env.DATABASE_URL ||
  (process.env.VERCEL ? `file:${vercelDbPath.replaceAll("\\", "/")}` : "file:./dev.db");

if (process.env.VERCEL && !process.env.DATABASE_URL && !existsSync(vercelDbPath)) {
  copyFileSync(join(process.cwd(), "prisma", "seed.db"), vercelDbPath);
}

const prisma =
  globalThis.__studenthubPrisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: dbUrl }),
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__studenthubPrisma = prisma;
}

const userSelect = {
  id: true,
  name: true,
  username: true,
  email: true,
  bio: true,
  photo: true,
  gender: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      posts: true,
      likes: true,
      comments: true,
      following: true,
      followers: true,
    },
  },
};

const commentSelect = {
  id: true,
  text: true,
  createdAt: true,
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      photo: true,
    },
  },
};

const postSelect = {
  id: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: { id: true, name: true, username: true, photo: true },
  },
  likes: { select: { userId: true } },
  comments: {
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  },
};

const followerSelect = {
  follower: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      photo: true,
      gender: true,
    },
  },
};

const followingSelect = {
  following: {
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      photo: true,
      gender: true,
    },
  },
};

export async function getUsers() {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });
}

export async function createUser(data) {
  return prisma.user.create({
    data,
    select: userSelect,
  });
}

export async function getPosts() {
  return prisma.post.findMany({
    select: postSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostsByAuthor(authorId) {
  return prisma.post.findMany({
    where: { authorId },
    select: postSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getPostById(id) {
  return prisma.post.findUnique({
    where: { id },
    select: postSelect,
  });
}

export async function createPost(data) {
  return prisma.post.create({
    data,
    select: postSelect,
  });
}

export async function getCommentsByPostId(postId) {
  return prisma.comment.findMany({
    where: { postId },
    select: commentSelect,
    orderBy: { createdAt: "asc" },
  });
}

export async function createComment(data) {
  return prisma.comment.create({
    data,
    select: commentSelect,
  });
}

export async function getCommentById(id) {
  return prisma.comment.findUnique({
    where: { id },
    select: commentSelect,
  });
}

export async function deleteComment(id) {
  return prisma.comment.delete({
    where: { id },
  });
}

export async function toggleLike(postId, userId) {
  const existingLike = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  });

  if (existingLike) {
    await prisma.like.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return { liked: false };
  }

  const like = await prisma.like.create({
    data: {
      postId,
      userId,
    },
  });

  return { liked: true, like };
}

export async function getFollowers(userId) {
  return prisma.follow.findMany({
    where: { followingId: userId },
    select: followerSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function getFollowing(userId) {
  return prisma.follow.findMany({
    where: { followerId: userId },
    select: followingSelect,
    orderBy: { createdAt: "desc" },
  });
}

export async function followUser(followerId, followingId) {
  return prisma.follow.upsert({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
    update: {},
    create: {
      followerId,
      followingId,
    },
  });
}

export async function unfollowUser(followerId, followingId) {
  return prisma.follow.deleteMany({
    where: {
      followerId,
      followingId,
    },
  });
}

export async function deletePost(id) {
  return prisma.post.delete({
    where: { id },
  });
}

export async function getUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { ...userSelect, password: true },
  });
}

export async function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function disconnectRepository() {
  await prisma.$disconnect();
}

export async function getTotalUsers() {
  return prisma.user.count();
}

export async function getAvgFollowersPerUser() {
  const [followCount, userCount] = await Promise.all([
    prisma.follow.count(),
    prisma.user.count(),
  ]);
  return userCount === 0 ? 0 : followCount / userCount;
}

export async function getAvgPostsPerUser() {
  const [postCount, userCount] = await Promise.all([
    prisma.post.count(),
    prisma.user.count(),
  ]);
  return userCount === 0 ? 0 : postCount / userCount;
}

export async function getMostLikedPost() {
  return prisma.post.findFirst({
    orderBy: { likes: { _count: "desc" } },
    select: {
      id: true,
      text: true,
      author: { select: { id: true, name: true, username: true, photo: true } },
      _count: { select: { likes: true, comments: true } },
    },
  });
}

export async function getMostFollowedUser() {
  return prisma.user.findFirst({
    orderBy: { followers: { _count: "desc" } },
    select: {
      id: true,
      name: true,
      username: true,
      photo: true,
      _count: { select: { followers: true } },
    },
  });
}

export async function getAvgCommentsPerPost() {
  const [commentCount, postCount] = await Promise.all([
    prisma.comment.count(),
    prisma.post.count(),
  ]);
  return postCount === 0 ? 0 : commentCount / postCount;
}
