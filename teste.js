const db = require('./db');

async function testarConexao() {
    try {
        const [resultado] = await db.query('SELECT * FROM itens');
        console.log('Banco conectado!');
        console.table(resultado);
    } catch (erro) {
        console.log('Erro na conexão:', erro.message);
    } finally {
        await db.end();
    }
}

testarConexao();