import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = express()
app.use(express.json()) //dizendo para o express que vou usar json
app.use(cors())


app.post('/usuarios', async (req, res) => {

    await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age

        }

    })

    res.status(201).json(req.body)

})
// app.post cria um novo usuario
// app.delete um usuario
// app.put edita um usuario
app.get('/usuarios', async (req, res) => {
    let users = []

    if (req.query.id) { // Se um id for fornecido na query string
        const user = await prisma.user.findUnique({
            where: {
                id: req.query.id, // Buscar usuário pelo id
            }
        })

        if (user) {
            return res.status(200).json(user) // Retornar o usuário encontrado
        } else {
            return res.status(404).json({ error: 'Usuário não encontrado' }) // Caso o usuário não exista
        }
    }

    if (req.query.name || req.query.email || req.query.age) {
        // Caso haja parâmetros de consulta específicos, você pode filtrar com base nisso
        users = await prisma.user.findMany({
            where: {
                name: req.query.name,
                email: req.query.email,
                age: req.query.age
            },
        })
        return res.status(200).json(users) // Retorna os usuários filtrados
    }

    // Caso nenhum filtro seja fornecido, retornar todos os usuários
    users = await prisma.user.findMany()
    res.status(200).json(users)
})

app.put('/usuarios/:id', async (req, res) => {
    try {
        // Primeiro, verificamos se o usuário existe
        const user = await prisma.user.findUnique({
            where: { id: req.params.id }
        });

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Agora, atualizamos os dados do usuário
        const updatedUser = await prisma.user.update({
            where: { id: req.params.id },
            data: {
                email: req.body.email,
                name: req.body.name,
                age: req.body.age,
            }
        });

        // Retorna o usuário atualizado
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao atualizar o usuário' });
    }
});


app.delete('/usuarios/:id', async (req, res) => {

    await prisma.user.delete({
        where: {
            id: req.params.id
        },

    })

    res.status(200).json({ message: 'Usuario Deletado com sucesso' })

})

app.listen(3000)

/*
    Criar nossa API de usuarios
   -Criar um usuario
    - Listar todos os Usuarios
    -Editar um usuario
    -Deletar um usuario
   


    HTTP/STATUS
    2XX SUCESSO
    4XX ERRO NO CODIGO 
    5XX ERRO NO SERVER
    // caiotompero:54vNZZywycqoClEK
    



*/