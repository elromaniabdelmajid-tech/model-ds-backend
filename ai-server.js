import express from "express"
import cors from "cors"
import OpenAI from "openai"
import dotenv from "dotenv"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const exercisesDB = {
  math: {
    title: "📐 Exercices de mathématiques",
    questions: [
      "Résoudre l'équation : $$x^2 + 2x + 1 = 0$$",
      "Calculer la dérivée de $f(x) = \\frac{x^2 + 1}{x}$",
      "Déterminer la limite : $$\\lim_{x \\to 0} \\frac{\\sin x}{x}$$"
    ]
  },
  physique: {
    title: "⚛️ Exercices de physique",
    questions: [
      "Calculer la vitesse moyenne : $$v = \\frac{d}{t}$$",
      "Énergie cinétique : $$E_c = \\frac{1}{2}mv^2$$",
      "Loi d'Ohm : $$U = R \\times I$$"
    ]
  },
  chimie: {
    title: "🧪 Exercices de chimie",
    questions: [
      "Équilibrer : $$C_3H_8 + O_2 \\rightarrow CO_2 + H_2O$$",
      "Masse molaire de $H_2SO_4$",
      "pH : $$pH = -\\log[H_3O^+]$$"
    ]
  }
}

app.post("/generate", (req, res) => {
  const { topic } = req.body
  const exercise = exercisesDB[topic] || exercisesDB.math
  res.json(exercise)
})

app.get("/health", (req, res) => {
  res.json({ status: 'ok', ai: true })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`🤖 Serveur IA sur http://localhost:${PORT}`)
})