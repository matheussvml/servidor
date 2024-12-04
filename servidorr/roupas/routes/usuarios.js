const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Importando a conexão com o banco
const { verificarAdmin } = require('../authMiddleware');
const router = express.Router();
const secretKey = '123123';

// Rota para registrar um novo usuário
router.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Verificar se o usuário já existe no banco
    const sqlCheckUser = 'SELECT * FROM usuarios WHERE username = ?';
    
    db.query(sqlCheckUser, [username], async (err, results) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).send('Erro ao registrar usuário');
        }

        if (results.length > 0) {
            return res.status(400).json({ error: 'Usuário já existe!' });
        }

        // Criptografar senha
        const hashedPassword = await bcrypt.hash(password, 10);
        const sqlInsertUser = 'INSERT INTO usuarios (username, password, isAdmin) VALUES (?, ?, ?)';
        
        db.query(sqlInsertUser, [username, hashedPassword, false], (err, results) => {
            if (err) {
                console.error('Erro ao registrar usuário:', err);
                return res.status(500).send('Erro ao registrar usuário');
            }
            // Resposta com mensagem e ID do usuário
            res.status(201).json({
                message: 'Usuário registrado com sucesso!',
                userId: results.insertId
            });
        });
    });
});




// const sqlInsertUser = 'INSERT INTO usuarios (username, password, isAdmin) VALUES (?, ?, ?)';
// db.query(sqlInsertUser, [username, hashedPassword, false], (err, results) => {
//     if (err) {
//         console.error('Erro ao registrar usuário:', err);
//         return res.status(500).send('Erro ao registrar usuário');
//     }
//     res.status(201).json({ 
//         message: 'Usuário registrado com sucesso!', 
//         userId: results.insertId // Retorna o ID gerado automaticamente
//     });
// });

// Rota para obter um usuário por ID
router.get('/api/usuarios/:id', autenticarToken, (req, res) => {
    const { id } = req.params;
    const sqlGetUser = 'SELECT id, username, isAdmin FROM usuarios WHERE id = ?';
    db.query(sqlGetUser, [id], (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).send('Erro ao buscar usuário');
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        res.json(results[0]);
    });
});

// Rota para promover um usuário a administrador
router.put('/api/usuarios/:username/admin', autenticarToken, verificarAdmin, (req, res) => {
    const { username } = req.params;
    const sqlPromoteUser = 'UPDATE usuarios SET isAdmin = ? WHERE username = ?';
    db.query(sqlPromoteUser, [true, username], (err, results) => {
        if (err) {
            console.error('Erro ao promover usuário:', err);
            return res.status(500).send('Erro ao promover usuário');
        }
        
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        res.json({ message: `Usuário ${username} agora é administrador.` });
    });
});

// Rota para remover privilégios de administrador
router.put('/usuarios/:username/naoadmin', autenticarToken, verificarAdmin, (req, res) => {
    const { username } = req.params;
    const sqlDemoteUser = 'UPDATE usuarios SET isAdmin = ? WHERE username = ?';
    db.query(sqlDemoteUser, [false, username], (err, results) => {
        if (err) {
            console.error('Erro ao alterar privilégios:', err);
            return res.status(500).send('Erro ao alterar privilégios');
        }

        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        res.json({ message: `Usuário ${username} não é mais administrador.` });
    });
});

// Rota para login de usuário
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const sqlGetUser = 'SELECT * FROM usuarios WHERE username = ?';
    db.query(sqlGetUser, [username], async (err, results) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).send('Erro ao fazer login');
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado!' });
        }

        const usuario = results[0];
        const isPasswordValid = await bcrypt.compare(password, usuario.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Senha inválida!' });
        }

        const token = jwt.sign({ username, isAdmin: usuario.isAdmin }, secretKey, { expiresIn: '7d' });
        res.json({ token, isAdmin: usuario.isAdmin });
    });
});

// Middleware para autenticar o token
function autenticarToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, secretKey, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

module.exports = router;
