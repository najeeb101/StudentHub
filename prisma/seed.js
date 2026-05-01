import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || "file:./dev.db" }),
});

const now = Date.now();
const hoursAgo = (hours) => new Date(now - hours * 60 * 60 * 1000);
const daysAgo = (days) => new Date(now - days * 24 * 60 * 60 * 1000);

const users = [
  {
    id: "u_seed1",
    name: "Sarah Ahmed",
    username: "sarah_a",
    email: "sarah@student.edu",
    password: "123456",
    bio: "CS junior | Coffee lover | Always debugging something",
    photo: null,
    gender: "female",
  },
  {
    id: "u_seed2",
    name: "Omar Hassan",
    username: "omar_h",
    email: "omar@student.edu",
    password: "123456",
    bio: "Engineering student | Football fan | GPA survivor",
    photo: null,
    gender: "male",
  },
  {
    id: "u_seed3",
    name: "Lena Park",
    username: "lena_p",
    email: "lena@student.edu",
    password: "123456",
    bio: "Design enthusiast | Art minor | Making things pretty since 2001",
    photo: null,
    gender: "female",
  },
  {
    id: "u_seed4",
    name: "Noah Ali",
    username: "noah_a",
    email: "noah@student.edu",
    password: "123456",
    bio: "Final year student | Learning full stack one bug at a time",
    photo: null,
    gender: "male",
  },
  {
    id: "u_seed5",
    name: "Maya Khan",
    username: "maya_k",
    email: "maya@student.edu",
    password: "123456",
    bio: "UI nerd | Cappuccino powered | Group project diplomat",
    photo: null,
    gender: "female",
  },
  {
    id: "u_seed6",
    name: "Yousef Saleh",
    username: "yousef_s",
    email: "yousef@student.edu",
    password: "123456",
    bio: "Data science student | Spreadsheet enjoyer",
    photo: null,
    gender: "male",
  },
  {
    id: "u_seed7",
    name: "Hana Omar",
    username: "hana_o",
    email: "hana@student.edu",
    password: "123456",
    bio: "Mobile dev fan | Notes sharer | Midnight reader",
    photo: null,
    gender: "female",
  },
  {
    id: "u_seed8",
    name: "Bilal Rahman",
    username: "bilal_r",
    email: "bilal@student.edu",
    password: "123456",
    bio: "Campus explorer | Coffee queue regular | Friendly lurker",
    photo: null,
    gender: "male",
  },
];

const posts = [
  {
    id: "p_seed1",
    authorId: "u_seed1",
    text: "Just submitted my OS assignment 10 minutes before the deadline. I am built different.",
    createdAt: hoursAgo(5),
  },
  {
    id: "p_seed2",
    authorId: "u_seed2",
    text: "The cafeteria ran out of shawarma again. This is not okay. This is a crisis.",
    createdAt: hoursAgo(8),
  },
  {
    id: "p_seed3",
    authorId: "u_seed3",
    text: "Finished my UI mockup for the semester project. Figma files are my love language.",
    createdAt: hoursAgo(12),
  },
  {
    id: "p_seed4",
    authorId: "u_seed4",
    text: "Spent the whole afternoon fixing one import path. It was the import path.",
    createdAt: daysAgo(1),
  },
  {
    id: "p_seed5",
    authorId: "u_seed5",
    text: "Group project meeting survived. Nobody cried. Huge win.",
    createdAt: daysAgo(1.5),
  },
  {
    id: "p_seed6",
    authorId: "u_seed6",
    text: "The library at 2am hits different. So peaceful. Highly recommend finals week study sessions.",
    createdAt: daysAgo(2),
  },
  {
    id: "p_seed7",
    authorId: "u_seed7",
    text: "Shared my lecture notes in the class group and got three thank-you messages within a minute.",
    createdAt: daysAgo(2.5),
  },
  {
    id: "p_seed8",
    authorId: "u_seed8",
    text: "Found the best campus coffee spot. The line is long, so obviously it must be good.",
    createdAt: daysAgo(3),
  },
  {
    id: "p_seed9",
    authorId: "u_seed1",
    text: "Anyone have notes from yesterday's Data Structures lecture? I was... indisposed.",
    createdAt: daysAgo(3.5),
  },
  {
    id: "p_seed10",
    authorId: "u_seed2",
    text: "Project demo day is next week and somehow we are still redesigning the slides.",
    createdAt: daysAgo(4),
  },
];

const comments = [
  {
    id: "c_seed1",
    postId: "p_seed1",
    authorId: "u_seed2",
    text: "Respect. Deadline pressure makes legends.",
    createdAt: hoursAgo(4),
  },
  {
    id: "c_seed2",
    postId: "p_seed1",
    authorId: "u_seed3",
    text: "This is the energy I need during finals.",
    createdAt: hoursAgo(3.5),
  },
  {
    id: "c_seed3",
    postId: "p_seed2",
    authorId: "u_seed5",
    text: "I felt this in my soul.",
    createdAt: hoursAgo(7),
  },
  {
    id: "c_seed4",
    postId: "p_seed3",
    authorId: "u_seed1",
    text: "This sounds way better than my current slide deck.",
    createdAt: hoursAgo(10),
  },
  {
    id: "c_seed5",
    postId: "p_seed4",
    authorId: "u_seed6",
    text: "Classic bug. The bug is always looking back at you.",
    createdAt: daysAgo(1),
  },
  {
    id: "c_seed6",
    postId: "p_seed5",
    authorId: "u_seed4",
    text: "That is enough success for one day.",
    createdAt: daysAgo(1.2),
  },
  {
    id: "c_seed7",
    postId: "p_seed6",
    authorId: "u_seed1",
    text: "This is literally my life right now.",
    createdAt: daysAgo(2),
  },
  {
    id: "c_seed8",
    postId: "p_seed7",
    authorId: "u_seed8",
    text: "We appreciate a generous note sharer.",
    createdAt: daysAgo(2.4),
  },
  {
    id: "c_seed9",
    postId: "p_seed8",
    authorId: "u_seed6",
    text: "Now I need this coffee spot on a map.",
    createdAt: daysAgo(3),
  },
  {
    id: "c_seed10",
    postId: "p_seed9",
    authorId: "u_seed2",
    text: "I'll send mine tonight.",
    createdAt: daysAgo(3.3),
  },
  {
    id: "c_seed11",
    postId: "p_seed10",
    authorId: "u_seed5",
    text: "Redesigning slides is the real course project.",
    createdAt: daysAgo(3.8),
  },
  {
    id: "c_seed12",
    postId: "p_seed10",
    authorId: "u_seed7",
    text: "At least the slides will look good when they are finally done.",
    createdAt: daysAgo(3.7),
  },
];

const likes = [
  { id: "l_seed1", postId: "p_seed1", userId: "u_seed2" },
  { id: "l_seed2", postId: "p_seed1", userId: "u_seed3" },
  { id: "l_seed3", postId: "p_seed1", userId: "u_seed5" },
  { id: "l_seed4", postId: "p_seed2", userId: "u_seed1" },
  { id: "l_seed5", postId: "p_seed2", userId: "u_seed3" },
  { id: "l_seed6", postId: "p_seed3", userId: "u_seed1" },
  { id: "l_seed7", postId: "p_seed3", userId: "u_seed4" },
  { id: "l_seed8", postId: "p_seed4", userId: "u_seed6" },
  { id: "l_seed9", postId: "p_seed4", userId: "u_seed7" },
  { id: "l_seed10", postId: "p_seed5", userId: "u_seed1" },
  { id: "l_seed11", postId: "p_seed5", userId: "u_seed8" },
  { id: "l_seed12", postId: "p_seed6", userId: "u_seed1" },
  { id: "l_seed13", postId: "p_seed6", userId: "u_seed2" },
  { id: "l_seed14", postId: "p_seed7", userId: "u_seed8" },
  { id: "l_seed15", postId: "p_seed8", userId: "u_seed6" },
  { id: "l_seed16", postId: "p_seed8", userId: "u_seed7" },
  { id: "l_seed17", postId: "p_seed9", userId: "u_seed2" },
  { id: "l_seed18", postId: "p_seed9", userId: "u_seed3" },
  { id: "l_seed19", postId: "p_seed10", userId: "u_seed4" },
  { id: "l_seed20", postId: "p_seed10", userId: "u_seed5" },
];

const follows = [
  { id: "f_seed1", followerId: "u_seed1", followingId: "u_seed2" },
  { id: "f_seed2", followerId: "u_seed1", followingId: "u_seed3" },
  { id: "f_seed3", followerId: "u_seed2", followingId: "u_seed1" },
  { id: "f_seed4", followerId: "u_seed2", followingId: "u_seed3" },
  { id: "f_seed5", followerId: "u_seed3", followingId: "u_seed1" },
  { id: "f_seed6", followerId: "u_seed3", followingId: "u_seed5" },
  { id: "f_seed7", followerId: "u_seed4", followingId: "u_seed1" },
  { id: "f_seed8", followerId: "u_seed4", followingId: "u_seed6" },
  { id: "f_seed9", followerId: "u_seed5", followingId: "u_seed2" },
  { id: "f_seed10", followerId: "u_seed5", followingId: "u_seed7" },
  { id: "f_seed11", followerId: "u_seed6", followingId: "u_seed1" },
  { id: "f_seed12", followerId: "u_seed6", followingId: "u_seed8" },
  { id: "f_seed13", followerId: "u_seed7", followingId: "u_seed3" },
  { id: "f_seed14", followerId: "u_seed7", followingId: "u_seed5" },
  { id: "f_seed15", followerId: "u_seed8", followingId: "u_seed2" },
  { id: "f_seed16", followerId: "u_seed8", followingId: "u_seed4" },
];

async function main() {
  await prisma.like.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.follow.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({ data: users });
  await prisma.post.createMany({ data: posts });
  await prisma.comment.createMany({ data: comments });
  await prisma.like.createMany({ data: likes });
  await prisma.follow.createMany({ data: follows });

  console.log(
    `Seeded ${users.length} users, ${posts.length} posts, ${comments.length} comments, ${likes.length} likes, and ${follows.length} follows.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
