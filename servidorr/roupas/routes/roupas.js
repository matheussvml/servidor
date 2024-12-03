const express = require('express');
const db = require('../db'); // Caminho relativo para o arquivo db.js
const { verificarAdmin, autenticarToken } = require('../authMiddleware'); // Caminho relativo para authMiddleware.js
const router = express.Router();

// Rota para obter todas as roupas
router.get('/roupas', (req, res) => {
    const sql = 'SELECT * FROM roupas';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Erro ao obter roupas:', err);
            return res.status(500).send('Erro ao obter roupas');
        }

        res.json(results.map(roupa => ({
            ...roupa,
            preco: parseFloat(roupa.preco) // Converte para número
        })));
    });
});


// Rota para obter os detalhes de uma roupa pelo ID
router.get('/roupas/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM roupas WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao obter roupa:', err);
            return res.status(500).send('Erro ao obter roupa');
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Roupa não encontrada' });
        }
        res.json(results[0]);
    });
});

// Rota para adicionar uma nova roupa (apenas admins)
router.post('/roupas', autenticarToken, verificarAdmin, (req, res) => {
    console.log(req.body); // Verifique os dados recebidos

    const { nome, preco, imagem, categoria, descr } = req.body;

    if (!nome || !preco || !imagem || !categoria || !descr) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios!' });
    }

    const sql = 'INSERT INTO roupas (nome, preco, imagem, categoria, descr) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nome, preco, imagem, categoria, descr], (err, results) => {
        if (err) {
            console.error('Erro ao adicionar roupa:', err);
            return res.status(500).send('Erro ao adicionar roupa');
        }
        res.status(201).json({ id: results.insertId, nome, preco, imagem, categoria, descr });
    });
});

router.post('/verificar-admin', autenticarToken, (req, res) => {
    console.log('Requisição recebida em /verificar-admin');
    if (req.user && req.user.isAdmin) {
        console.log('Usuário é admin:', req.user);
        return res.json({ isAdmin: true });
    }
    console.log('Usuário não é admin:', req.user);
    return res.json({ isAdmin: false });
});


// Rota para deletar uma roupa (apenas admins)
router.delete('/roupas/:id', autenticarToken, verificarAdmin, (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM roupas WHERE id = ?';
    db.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Erro ao deletar roupa:', err);
            return res.status(500).send('Erro ao deletar roupa');
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Roupa não encontrada' });
        }
        res.status(204).send();
    });
});

// Rota para atualizar uma roupa (apenas admins)
router.patch('/roupas/:id', autenticarToken, verificarAdmin, (req, res) => {
    const { id } = req.params;
    const { nome, imagem, preco, categoria, descr } = req.body;
    const sql = `
        UPDATE roupas 
        SET nome = COALESCE(?, nome), 
            preco = COALESCE(?, preco), 
            imagem = COALESCE(?, imagem), 
            categoria = COALESCE(?, categoria), 
            descr = COALESCE(?, descr)
        WHERE id = ?`;
    db.query(sql, [nome, preco, imagem, categoria, descr, id], (err, results) => {
        if (err) {
            console.error('Erro ao atualizar roupa:', err);
            return res.status(500).send('Erro ao atualizar roupa');
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ error: 'Roupa não encontrada' });
        }
        res.json({ id, nome, preco, imagem, categoria, descr });
    });
});

module.exports = router;
