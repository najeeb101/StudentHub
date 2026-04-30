import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma =
  globalThis.__studenthubPrisma ??
  new PrismaClient({
    adapter: new PrismaBetterSqlite3({ url: "file:./dev.db" }),
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

const postSelect = {
  id: true,
  text: true,
  createdAt: true,
  updatedAt: true,
  author: {
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
  _count: {
    select: {
      comments: true,
      likes: true,
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

export async function disconnectRepository() {
  await prisma.$disconnect();
}
