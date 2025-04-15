import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();

// Configuração do CORS para permitir requisições da origem específica
app.use(cors({
  origin: 'https://front-end-api-mu.vercel.app', // substitua pela sua URL de frontend
}));

app.use(express.json()); // Permitindo que o Express interprete JSON

// Rota POST para criar um novo usuário
app.post('/usuarios', async (req, res) => {
  try {
    const { email, name, age } = req.body;

    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        age,
      },
    });

    res.status(201).json(newUser); // Retorna o usuário recém-criado
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
});

// Rota GET para listar os usuários
app.get('/usuarios', async (req, res) => {
  try {
    let users = [];

    // Caso tenha um id na query string, buscamos esse usuário específico
    if (req.query.id) {
      const user = await prisma.user.findUnique({
        where: {
          id: parseInt(req.query.id), // Converte para inteiro
        },
      });

      if (user) {
        return res.status(200).json(user); // Retorna o usuário encontrado
      } else {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
    }

    // Caso haja filtros de name, email ou age na query string
    if (req.query.name || req.query.email || req.query.age) {
      users = await prisma.user.findMany({
        where: {
          name: req.query.name,
          email: req.query.email,
          age: parseInt(req.query.age), // Converte a idade para número
        },
      });

      return res.status(200).json(users); // Retorna os usuários filtrados
    }

    // Caso não haja filtros, retornamos todos os usuários
    users = await prisma.user.findMany();
    res.status(200).json(users);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ error: 'Erro ao listar usuários' });
  }
});

// Rota PUT para editar um usuário
app.put('/usuarios/:id', async (req, res) => {
  try {
    const { email, name, age } = req.body;
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }, // Converte para inteiro
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: parseInt(id) }, // Converte para inteiro
      data: { email, name, age },
    });

    res.status(200).json(updatedUser); // Retorna o usuário atualizado
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
});

// Rota DELETE para excluir um usuário
app.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
    });

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    await prisma.user.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
});

// Inicializa o servidor na porta definida (usando a variável de ambiente ou 10000 como fallback)
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
