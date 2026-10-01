//importa as bibliotecas
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const multer = require('multer');
const path = require('path');

// configuração banco
const db = mysql.createPool({
    host: 'localhost',
    user: 'admin',
    password: '1234',
    database: 'cadastro',
    port: 3306,
});

const app = express();
// informa onde as imagens serão guardadas
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// configuração do multer (onde será salva as imagens e com o nome)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // salva na pasta uploads
    },
    filename: (req, file, cb) => {
        // renomeia o arquivo para evitar arquivo duplicado
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// rota de cadastro de pet (envia os dados para o banco de dados)
app.post('/api/pets', uploads.single('imagem'), async (req, res) => {
    const { tutor, nome_pet, raca, genero, peso, idade } = req.body;
    const imagem_url = req.file ? `/uploads/${req.file.filename}` : null;

    // verifica se os campos foram preenchidos
    if (!tutor || !nome_pet || !raca || !genero || !peso || !idade) {
        return res.status(400).json({ message: 'Todos os campos e a imagem são obrigatórios!' });
    }

    try {
        // monta o comando sql para incluir no banco de dados
        const query = `
            INSERT INTO pets (tutor, nome_pet, raca, genero, peso, idade, imagem_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        await db.query(query, [tutor, nome_pet, raca, genero, peso, idade, imagem_url]);

        return res.status(201).json({ message: 'Pet cadastrado com sucesso.' });

    } catch (error) {
        console.error('Erro ao salvar pet:', error);
        return res.status(500).json({ message: 'Erro ao salvar no banco de dados.' });
    }
});
