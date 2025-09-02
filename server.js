import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

import dotenv from "dotenv";
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const prisma = new PrismaClient()

const app = express()

// Corrigir a configuração do CORS
app.use(cors({
  origin: 'https://front-end-api-mu.vercel.app', // Permite o Vercel
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Definir os métodos permitidos
  allowedHeaders: ['Content-Type'], // Permitir cabeçalhos específicos
}))

app.use(express.json()) // Usando o middleware para interpretar JSON

app.post('/usuarios', async (req, res) => {
  await prisma.user.create({
    data: {
      email: req.body.email,
      name: req.body.name,
      age: req.body.age,
    },
  })

  res.status(201).json(req.body)
})

app.get('/usuarios', async (req, res) => {
  let users = []

  if (req.query.id) {
    const user = await prisma.user.findUnique({
      where: {
        id: req.query.id,
      },
    })
    
    if (user) {
      return res.status(200).json(user)
    } else {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }
  }

  if (req.query.name || req.query.email || req.query.age) {
    users = await prisma.user.findMany({
      where: {
        name: req.query.name,
        email: req.query.email,
        age: req.query.age,
      },
    })
    return res.status(200).json(users)
  }

  users = await prisma.user.findMany()
  res.status(200).json(users)
})

app.put('/usuarios/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id }
    })

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        email: req.body.email,
        name: req.body.name,
        age: req.body.age,
      },
    })

    res.status(200).json(updatedUser)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Erro ao atualizar o usuário' })
  }
})

app.delete('/usuarios/:id', async (req, res) => {
  await prisma.user.delete({
    where: {
      id: req.params.id
    },
  })

  res.status(200).json({ message: 'Usuário deletado com sucesso' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`)
})
