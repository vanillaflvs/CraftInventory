const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

const rota = fn => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const erro = (res, status, mensagem) =>
  res.status(status).json({ mensagem });

function autenticado(req, res, next) {
  if (!req.session.jogador) {
    return erro(res, 401, 'Faça login.');
  }

  next();
}

function credenciais(apelido, senha) {
  return typeof apelido === 'string' &&
    apelido.trim().length > 0 &&
    apelido.trim().length <= 50 &&
    typeof senha === 'string' &&
    senha.length >= 6 &&
    Buffer.byteLength(senha) <= 72;
}

function iniciarSessao(req, id) {
  return new Promise((resolve, reject) => {
    req.session.regenerate(err => {
      if (err) return reject(err);

      req.session.jogador = id;

      req.session.save(err => {
        if (err) return reject(err);
        resolve();
      });
    });
  });
}

router.get('/', (req, res) => {
  res.render('index');
});

router.post('/api/cadastro', rota(async (req, res) => {
  const { apelido, senha } = req.body;

  if (!credenciais(apelido, senha)) {
    return erro(res, 400, 'Informe um apelido e uma senha de pelo menos 6 caracteres.');
  }

  const hash = await bcrypt.hash(senha, 10);

  const [resultado] = await db.query(
    'INSERT INTO jogador (apelido, senha_hash) VALUES (?, ?)',
    [apelido.trim(), hash]
  );

  await iniciarSessao(req, resultado.insertId);

  res.json({ ok: true });
}));

router.post('/api/login', rota(async (req, res) => {
  const { apelido, senha } = req.body;

  if (!credenciais(apelido, senha)) {
    return erro(res, 400, 'Dados inválidos.');
  }

  const [rows] = await db.query(
    'SELECT id_jogador, senha_hash FROM jogador WHERE apelido = ?',
    [apelido.trim()]
  );

  if (!rows.length || !await bcrypt.compare(senha, rows[0].senha_hash)) {
    return erro(res, 401, 'Apelido ou senha incorretos.');
  }

  await iniciarSessao(req, rows[0].id_jogador);

  res.json({ ok: true });
}));

router.post('/api/logout', autenticado, (req, res, next) => {
  req.session.destroy(err => {
    if (err) return next(err);

    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/api/jogador', autenticado, rota(async (req, res) => {
  const [rows] = await db.query(
    'SELECT apelido, vida, nivel, imagem FROM jogador WHERE id_jogador = ?',
    [req.session.jogador]
  );

  if (!rows.length) {
    return erro(res, 401, 'Jogador não encontrado.');
  }

  res.json(rows[0]);
}));

router.put('/api/jogador', autenticado, rota(async (req, res) => {
  const { apelido, vida, nivel, senha, senhaAtual } = req.body;

  if (
    typeof apelido !== 'string' ||
    !apelido.trim() ||
    apelido.trim().length > 50 ||
    typeof vida !== 'number' ||
    !Number.isFinite(vida) ||
    vida < 0 ||
    vida > 20 ||
    !Number.isInteger(nivel) ||
    nivel < 0 ||
    nivel > 2147483647
  ) {
    return erro(res, 400, 'Dados inválidos.');
  }

  if (senha) {
    if (!credenciais(apelido, senha) || typeof senhaAtual !== 'string') {
      return erro(res, 400, 'Confira as senhas.');
    }

    const [rows] = await db.query(
      'SELECT senha_hash FROM jogador WHERE id_jogador = ?',
      [req.session.jogador]
    );

    if (!rows.length || !await bcrypt.compare(senhaAtual, rows[0].senha_hash)) {
      return erro(res, 403, 'Senha atual incorreta.');
    }

    const hash = await bcrypt.hash(senha, 10);

    await db.query(
      'UPDATE jogador SET apelido=?, vida=?, nivel=?, senha_hash=? WHERE id_jogador=?',
      [apelido.trim(), vida, nivel, hash, req.session.jogador]
    );

  } else {
    await db.query(
      'UPDATE jogador SET apelido=?, vida=?, nivel=? WHERE id_jogador=?',
      [apelido.trim(), vida, nivel, req.session.jogador]
    );
  }

  res.json({ ok: true });
}));

router.get('/api/itens', autenticado, rota(async (req, res) => {
  const [rows] = await db.query(`
        SELECT
            i.id_item AS id,
            i.nome AS name,
            i.item_Img AS image,
            i.limite_pilha AS limite,
            c.tipo AS category
        FROM itens i
        JOIN categoria c ON i.id_categoria = c.id_categoria
        ORDER BY i.id_item
    `);

  res.json(rows);
}));

router.get('/api/inventario', autenticado, rota(async (req, res) => {
  const [rows] = await db.query(
    'SELECT slot, id_item AS id, quantidade AS quantity FROM itens_Jogador WHERE id_jogador = ?',
    [req.session.jogador]
  );

  const inventario = Array(36).fill(null);

  rows.forEach(({ slot, id, quantity }) => {
    inventario[slot] = { id, quantity };
  });

  res.json(inventario);
}));

router.put('/api/inventario', autenticado, rota(async (req, res) => {
  const inventario = req.body;

  if (!Array.isArray(inventario) || inventario.length !== 36) {
    return erro(res, 400, 'Inventário inválido.');
  }

  const [itens] = await db.query(
    'SELECT id_item, limite_pilha FROM itens'
  );

  const limites = new Map(
    itens.map(i => [i.id_item, i.limite_pilha])
  );

  const invalido = inventario.some(i =>
    i !== null && (
      !i ||
      !limites.has(i.id) ||
      !Number.isInteger(i.quantity) ||
      i.quantity < 1 ||
      i.quantity > limites.get(i.id)
    )
  );

  if (invalido) {
    return erro(res, 400, 'Item ou quantidade inválida.');
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      'SELECT id_jogador FROM jogador WHERE id_jogador = ? FOR UPDATE',
      [req.session.jogador]
    );

    await conn.query(
      'DELETE FROM itens_Jogador WHERE id_jogador = ?',
      [req.session.jogador]
    );

    const valores = inventario.flatMap((item, slot) =>
      item ? [[
        req.session.jogador,
        item.id,
        slot,
        item.quantity
      ]] : []
    );

    if (valores.length) {
      await conn.query(
        'INSERT INTO itens_Jogador (id_jogador, id_item, slot, quantidade) VALUES ?',
        [valores]
      );
    }

    await conn.commit();

    res.json({ ok: true });

  } catch (err) {
    await conn.rollback();
    throw err;

  } finally {
    conn.release();
  }
}));

router.use('/api', (err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return erro(res, 409, 'Apelido já cadastrado.');
  }

  console.error(err.message);

  erro(res, 500, 'Erro ao acessar o banco.');
});

module.exports = router;