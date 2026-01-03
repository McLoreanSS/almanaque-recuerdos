import express from "express";
const router = express.Router();

router.post("/login", (req, res) => {
  const { pin } = req.body;

  if (!pin) {
    return res.status(400).json({ success: false, message: "PIN requerido" });
  }

  if (pin === process.env.ALBUM_PIN) {
    return res.json({ success: true, message: "Acceso concedido" });
  }

  return res.status(401).json({ success: false, message: "PIN incorrecto" });
});

export default router;
