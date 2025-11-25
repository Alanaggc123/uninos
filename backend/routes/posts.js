const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET posts curtidos por userId
router.get("/liked/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const likes = await prisma.like.findMany({ where: { userId } });
    const postIds = likes.map((l) => l.postId);

    const posts = await prisma.post.findMany({ where: { id: { in: postIds } } });

    const enriched = await Promise.all(
      posts.map(async (post) => {
        const author = await prisma.user.findUnique({ where: { id: post.userId } });
        const likeCount = await prisma.like.count({ where: { postId: post.id } });
        const commentCount = await prisma.comment.count({ where: { postId: post.id } });

        return { ...post, fullName: author.fullName, avatarUrl: author.avatarUrl, likeCount, commentCount };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar posts curtidos" });
  }
});

module.exports = router;
