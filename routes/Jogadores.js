var express = require('express');
var router = express.Router();

const db = require('../db');

// LISTAR JOGADORES
router.get('/', async (req, res) => {
    try {
        const [jogadores] = await db.query(
            'SELECT * FROM jogador ORDER BY id_jogador DESC'
        );

        res.render('jogadores', {
            jogadores: jogadores,
            jogadorEditando: null
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao listar jogadores.');
    }
});

// CADASTRAR JOGADOR
router.post('/cadastrar', async (req, res) => {
    try {
        const {
            vida,
            nivel,
            apelido,
            imagem
        } = req.body;

        await db.query(
            `INSERT INTO jogador
            (vida, nivel, apelido, imagem)
            VALUES (?, ?, ?, ?)`,
            [
                vida,
                nivel,
                apelido,
                imagem
            ]
        );

        res.redirect('/jogadores');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao cadastrar jogador.');
    }
});

// ABRIR FORMULÁRIO DE EDIÇÃO
router.get('/editar/:id', async (req, res) => {
    try {
        const {id} = req.params;

        const [jogadores] = await db.query(
            'SELECT * FROM jogador WHERE id_jogador = ?',
            [id]
        );

        if (jogadores.length === 0) {
            return res.status(404).send('Jogador não encontrado.');
        }

        const [todosJogadores] = await db.query(
            'SELECT * FROM jogador ORDER BY id_jogador DESC'
        );

        res.render('jogadores', {
            jogadores: todosJogadores,
            jogadorEditando: jogadores[0]
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao buscar jogador.');
    }
});

// ATUALIZAR JOGADOR
router.post('/editar/:id', async (req, res) => {
    try {
        const {id} = req.params;

        const {
            vida,
            nivel,
            apelido,
            imagem
        } = req.body;

        await db.query(
            `UPDATE jogador
             SET vida = ?,
                 nivel = ?,
                 apelido = ?,
                 imagem = ?
             WHERE id_jogador = ?`,
            [
                vida,
                nivel,
                apelido,
                imagem,
                id
            ]
        );

        res.redirect('/jogadores');

    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao atualizar jogador.');
    }
});

// EXCLUIR JOGADOR
router.post('/excluir/:id', async (req, res) => {
    try {
        const {id} = req.params;

        await db.query(
            'DELETE FROM jogador WHERE id_jogador = ?',
            [id]
        );

        res.redirect('/jogadores');

    } catch (erro) {
        console.error(erro);
        res.status(500).send(
            'Erro ao excluir jogador. Verifique se ele possui itens associados.'
        );
    }
});

module.exports = router;