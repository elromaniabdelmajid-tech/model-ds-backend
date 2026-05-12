import express from "express"
import cors from "cors"
import { exec } from "child_process"
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url'

// ✅ Correction pour __dirname en ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

const latexCmd = process.env.LATEX_CMD || 'pdflatex'

const getTemplate = (content, title, author) => `
\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage[french]{babel}
\\usepackage{amsmath, amssymb, amsthm}
\\usepackage{tikz}
\\usepackage{pgfplots}
\\pgfplotsset{compat=1.18}
\\usepackage[margin=2cm]{geometry}
\\begin{document}
\\begin{center}
  {\\Huge \\textbf{المملكة المغربية}}\\\\[0.3cm]
  {\\Large \\textbf{وزارة التربية الوطنية}}\\\\[0.5cm]
  \\rule{\\textwidth}{1pt}\\\\[0.3cm]
  {\\LARGE \\textbf{${title}}}\\\\[0.2cm]
  {\\large Professeur : ${author}}
\\end{center}
${content}
\\end{document}
`

app.post('/latex/compile', async (req, res) => {
  const { content, title = 'Devoir', author = 'Professeur' } = req.body
  
  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: 'Contenu manquant' })
  }
  
  const latexCode = getTemplate(content, title, author)
  const texFile = path.join(__dirname, `temp_${Date.now()}.tex`)
  
  fs.writeFileSync(texFile, latexCode)
  
  exec(`${latexCmd} -interaction=nonstopmode "${texFile}"`, 
    { timeout: 30000, cwd: __dirname },
    (error) => {
      const pdfFile = texFile.replace('.tex', '.pdf')
      
      if (fs.existsSync(pdfFile)) {
        const pdfBuffer = fs.readFileSync(pdfFile)
        res.json({ success: true, pdf: pdfBuffer.toString('base64') })
        
        // Nettoyage
        try {
          fs.unlinkSync(texFile)
          fs.unlinkSync(pdfFile)
          ;['.aux', '.log'].forEach(ext => {
            const f = texFile.replace('.tex', ext)
            if (fs.existsSync(f)) fs.unlinkSync(f)
          })
        } catch(e) {}
      } else {
        res.status(500).json({ error: 'PDF non généré' })
      }
    }
  )
})

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`🚀 Serveur LaTeX sur le port ${PORT}`)
})