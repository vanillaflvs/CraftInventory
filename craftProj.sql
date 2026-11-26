CREATE DATABASE IF NOT EXISTS craftProj;
USE craftProj;

CREATE TABLE IF NOT EXISTS categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS jogador (
    id_jogador INT AUTO_INCREMENT PRIMARY KEY,
    apelido VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    vida DOUBLE DEFAULT 20 NOT NULL,
    nivel INT DEFAULT 0 NOT NULL,
    limite_inventario INT DEFAULT 36 NOT NULL,
    imagem VARCHAR(300),
    CHECK (vida BETWEEN 0 AND 20),
    CHECK (nivel >= 0),
    CHECK (limite_inventario = 36)
);

CREATE TABLE IF NOT EXISTS itens (
    id_item INT AUTO_INCREMENT PRIMARY KEY,
    id_categoria INT NOT NULL,
    nome VARCHAR(50) NOT NULL UNIQUE,
    dano DOUBLE DEFAULT 0,
    item_Img VARCHAR(300) NOT NULL,
    limite_pilha INT DEFAULT 64 NOT NULL,
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria),
    CHECK (limite_pilha BETWEEN 1 AND 64)
);

CREATE TABLE IF NOT EXISTS itens_Jogador (
    id_jogador INT NOT NULL,
    id_item INT NOT NULL,
    slot INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_jogador, slot),
    FOREIGN KEY (id_jogador) REFERENCES jogador(id_jogador) ON DELETE CASCADE,
    FOREIGN KEY (id_item) REFERENCES itens(id_item),
    CHECK (slot BETWEEN 0 AND 35),
    CHECK (quantidade BETWEEN 1 AND 64)
);

INSERT IGNORE INTO categoria (id_categoria, tipo) VALUES
(1, 'Blocos'),
(2, 'Armaduras'),
(3, 'Alimentos'),
(4, 'Ferramentas'),
(5, 'Armas'),
(6, 'Diversos');

INSERT IGNORE INTO itens 
(id_categoria, nome, dano, item_Img, limite_pilha) VALUES
(1, 'Areia', 0, '/images/Bloco/Areia.png', 64),
(1, 'Baú', 0, '/images/Bloco/Bau.png', 64),
(1, 'Bloco de Grama', 0, '/images/Bloco/BlocoGrama.png', 64),
(1, 'Fornalha', 0, '/images/Bloco/Fornalha.png', 64),
(1, 'Madeira de Carvalho', 0, '/images/Bloco/MadeiraCarvalho.png', 64),
(1, 'Mesa de Trabalho', 0, '/images/Bloco/MesaDeTrabalho.png', 64),
(1, 'Pedregulho', 0, '/images/Bloco/Pedregulho.png', 64),
(1, 'Rocha Matriz', 0, '/images/Bloco/RochaMatriz.png', 64),
(1, 'Vidro', 0, '/images/Bloco/Vidro.png', 64),

(2, 'Capacete de Cota de Malha', 0, '/images/Armadura/CotaDeMalhaCapacete.png', 1),
(2, 'Peitoral de Cota de Malha', 0, '/images/Armadura/CotaDeMalhaPeitoral.png', 1),
(2, 'Calça de Cota de Malha', 0, '/images/Armadura/CotaDeMalhaCalca.png', 1),
(2, 'Botas de Cota de Malha', 0, '/images/Armadura/CotaDeMalhaBota.png', 1),

(3, 'Bagas Doces', 0, '/images/Comida/BagasDocess.png', 64),
(3, 'Batata', 0, '/images/Comida/Batata.png', 64),
(3, 'Batata Assada', 0, '/images/Comida/BatataAssada.png', 64),
(3, 'Biscoito', 0, '/images/Comida/Biscoito.png', 64),
(3, 'Carne de Boi', 0, '/images/Comida/CarneBoi.png', 64),
(3, 'Carne de Porco', 0, '/images/Comida/CarnePorco.png', 64),
(3, 'Cenoura', 0, '/images/Comida/Cenoura.png', 64),
(3, 'Frango Assado', 0, '/images/Comida/FrangoAssado.png', 64),
(3, 'Maçã', 0, '/images/Comida/Maca.png', 64),
(3, 'Maçã Dourada', 0, '/images/Comida/MacaDourada.png', 64),
(3, 'Pão', 0, '/images/Comida/Pao.png', 64),

(4, 'Enxada de Diamante', 1, '/images/Ferramentas/EnxadaDiamante.png', 1),
(4, 'Machado de Ferro', 9, '/images/Ferramentas/MachadoFerro.png', 1),
(4, 'Pá de Pedra', 3.5, '/images/Ferramentas/PaPedra.png', 1),
(4, 'Picareta de Netherita', 6, '/images/Ferramentas/PicaretaNetherita.png', 1),

(5, 'Arco', 1, '/images/Ferramentas/Arco.png', 1),
(5, 'Espada de Ouro', 4, '/images/Ferramentas/EspadaOuro.png', 1),
(5, 'Flecha', 1, '/images/Ferramentas/Flecha.png', 64),

(6, 'Balde de Água', 0, '/images/Ferramentas/BaldeAgua.png', 1),
(6, 'Pérola do Fim', 0, '/images/Ferramentas/PerolaDoFim.png', 16);