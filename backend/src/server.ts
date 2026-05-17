import app from '@/app.js'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on:`)
  console.log(`- Local:   http://localhost:${PORT}`)
  console.log(`- Network: http://0.0.0.0:${PORT}`)
})
