const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// GET perfil por userId
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await prisma.user.findUnique({ where: { id } });
    if (!profile) return res.status(404).json({ error: "Perfil não encontrado" });
    res.json(profile);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// UPDATE perfil
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { fullName, gender, bio, avatarUrl, interests, galleryImages, materiasConcluidas, matricula, curso, periodo, isPrivate, filtroMadrinha } = req.body;
  try {
    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName,
        gender,
        bio,
        avatarUrl,
        interests,
        galleryImages,
        materiasConcluidas,
        matricula,
        curso,
        periodo,
        isPrivate,
        filtroMadrinha,
      },
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao atualizar perfil" });
  }
});

module.exports = router;
