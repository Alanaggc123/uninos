const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Registro
router.post("/register", async (req, res) => {
  const { fullName, email, gender, matricula, curso, periodo, password } = req.body;
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: "Email já cadastrado" });

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: { fullName, email, gender, matricula, curso, periodo: Number(periodo), passwordHash },
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro no servidor" });
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: "Email ou senha inválidos" });

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) return res.status(400).json({ error: "Email ou senha inválidos" });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Erro no servidor" });
  }
});

module.exports = router;
