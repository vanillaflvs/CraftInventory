var express = require('express');
var router = express.Router();
const db = require('../db');

const TOTAL_SLOTS = 41;

const SUBPASTA_POR_CATEGORIA = {
    'Blocos': 'Bloco',
    'Equipamentos': 'Armadura',
    'Alimentos': 'Comida',
    'Ferramentas': 'Ferramentas',
    'Armas': 'Ferramentas',
    'Itens Diversos': 'Ferramentas'
};

function resolverImagem(itemImg, categoria) {
    if (!itemImg) return '/images/Bloco/Pedregulho.png';
    if (itemImg.startsWith('/') || /^https?:\/\//i.test(itemImg)) return itemImg;
    const subpasta = SUBPASTA_POR_CATEGORIA[categoria] || 'Ferramentas';
    return `/images/${subpasta}/${itemImg}`;
}

// Ordem de baixo para cima: hotbar (32..40), inventário principal (5..31) e slots superiores (0..4)
function proximoSlotLivre(ocupados) {
    const ordem = [];
    for (let i = 32; i <= 40; i++) ordem.push(i);
    for (let i = 23; i <= 31; i++) ordem.push(i);
    for (let i = 14; i <= 22; i++) ordem.push(i);
    for (let i = 5; i <= 13; i++) ordem.push(i);
    for (let i = 0; i <= 4; i++) ordem.push(i);

    for (const idx of ordem) {
        if (!ocupados[idx]) return idx;
    }
    return 32;
}

// GET /inventario
router.get('/', async (req, res) => {
    try {
        const [jogadores] = await db.query(
            'SELECT * FROM jogador ORDER BY id_jogador ASC'
        );

        let jogadorAtual = null;
        if (jogadores.length > 0) {
            const idParam = parseInt(req.query.jogador, 10);
            jogadorAtual = jogadores.find(j => j.id_jogador === idParam) || jogadores[0];
        }

        const [itensRows] = await db.query(`
            SELECT i.id_item, i.nome, i.dano, i.item_Img, c.tipo AS categoria
            FROM itens i
            LEFT JOIN categoria c ON i.id_categoria = c.id_categoria
            ORDER BY i.nome ASC
        `);

        const itens = itensRows.map(row => ({
            ...row,
            imgUrl: resolverImagem(row.item_Img, row.categoria)
        }));

        const slots = Array(TOTAL_SLOTS).fill(null);

        if (jogadorAtual) {
            const [vinculos] = await db.query(`
                SELECT ij.slot_index, ij.id_item, ij.quantidade, i.nome, i.item_Img, c.tipo AS categoria
                FROM itens_Jogador ij
                INNER JOIN itens i ON ij.id_item = i.id_item
                LEFT JOIN categoria c ON i.id_categoria = c.id_categoria
                WHERE ij.id_jogador = ?
                ORDER BY ij.slot_index ASC
            `, [jogadorAtual.id_jogador]);

            vinculos.forEach(v => {
                if (v.slot_index >= 0 && v.slot_index < TOTAL_SLOTS) {
                    slots[v.slot_index] = {
                        id_item: v.id_item,
                        nome: v.nome,
                        quantidade: Math.min(64, Math.max(1, Number(v.quantidade) || 1)),
                        imgUrl: resolverImagem(v.item_Img, v.categoria)
                    };
                }
            });
        }

        const slotSelecionado = Math.min(
            TOTAL_SLOTS - 1,
            Math.max(0, parseInt(req.query.slot, 10) || 32)
        );

        res.render('inventario', {
            jogadores,
            jogadorAtual,
            itens,
            slots,
            slotSelecionado,
            busca: req.query.busca || ''
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao carregar inventário.');
    }
});

// POST /inventario/equipar
router.post('/equipar', async (req, res) => {
    try {
        const idJogador = parseInt(req.body.id_jogador, 10);
        const idItem = parseInt(req.body.id_item, 10);
        const quantidade = Math.min(64, Math.max(1, parseInt(req.body.quantidade, 10) || 1));

        if (!idJogador || !idItem) {
            return res.redirect(`/inventario?jogador=${idJogador || ''}`);
        }

        const [atuais] = await db.query(
            'SELECT slot_index FROM itens_Jogador WHERE id_jogador = ?',
            [idJogador]
        );
        const ocupados = Array(TOTAL_SLOTS).fill(false);
        atuais.forEach(r => {
            if (r.slot_index >= 0 && r.slot_index < TOTAL_SLOTS) {
                ocupados[r.slot_index] = true;
            }
        });

        let slotIndex = parseInt(req.body.slot_index, 10);
        if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= TOTAL_SLOTS) {
            slotIndex = proximoSlotLivre(ocupados);
        }

        await db.query(`
            INSERT INTO itens_Jogador (id_jogador, slot_index, id_item, quantidade)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                id_item = VALUES(id_item),
                quantidade = VALUES(quantidade)
        `, [idJogador, slotIndex, idItem, quantidade]);

        res.redirect(`/inventario?jogador=${idJogador}&slot=${slotIndex}`);
    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao salvar item no inventário.');
    }
});

// POST /inventario/remover
router.post('/remover', async (req, res) => {
    try {
        const idJogador = parseInt(req.body.id_jogador, 10);
        const slotIndex = parseInt(req.body.slot_index, 10);

        if (idJogador && !isNaN(slotIndex)) {
            await db.query(
                'DELETE FROM itens_Jogador WHERE id_jogador = ? AND slot_index = ?',
                [idJogador, slotIndex]
            );
        }

        res.redirect(`/inventario?jogador=${idJogador || ''}&slot=${isNaN(slotIndex) ? 32 : slotIndex}`);
    } catch (erro) {
        console.error(erro);
        res.status(500).send('Erro ao remover item do inventário.');
    }
});
module.exports = router;