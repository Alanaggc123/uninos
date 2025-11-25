const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET notificações
router.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await prisma.notification.findMany({ where: { userId } });
    const enriched = await Promise.all(
      notifications.map(async (n) => {
        let senderName = "Usuário";
        if (n.senderId) {
          const sender = await prisma.user.findUnique({ where: { id: n.senderId } });
          senderName = sender?.fullName || senderName;
        }
        return { ...n, senderName };
      })
    );
    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar notificações" });
  }
});

// PUT marcar como lida
router.put("/read/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await prisma.notification.update({ where: { id }, data: { read: true } });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao marcar notificação" });
  }
});

module.exports = router;
