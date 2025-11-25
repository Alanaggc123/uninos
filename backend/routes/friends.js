const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET amigos
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const friendships = await prisma.friendship.findMany({ 
      where: { status: "accepted", OR: [{ requesterId: userId }, { receiverId: userId }] }
    });

    const friendIds = friendships.map(f => f.requesterId === userId ? f.receiverId : f.requesterId);

    const friends = await prisma.user.findMany({ where: { id: { in: friendIds } } });
    res.json(friends);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar amigos" });
  }
});

module.exports = router;
