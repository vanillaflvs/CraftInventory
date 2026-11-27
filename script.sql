create database CraftDb;
use CraftDb;
create table categoria(
	id_categoria int primary key auto_increment,
    tipo varchar(30)
);

create table if not exists itens(
	id_item int primary key auto_increment,
    id_categoria int,
    dano double,
	item_Img varchar(300),
    nome varchar(50),
    constraint id_categoria foreign key(id_categoria) references categoria(id_categoria)
);
create table jogador(
	id_jogador int primary key auto_increment,
	vida double,
    nivel int,
	apelido varchar(50),
	limite_inventario int default 36,
    imagem varchar(300)
);

CREATE TABLE itens_Jogador (
    id_jogador INT NOT NULL,
    slot_index INT NOT NULL,
    id_item INT NOT NULL,
    quantidade INT NOT NULL DEFAULT 1,
    PRIMARY KEY (id_jogador, slot_index),
    CONSTRAINT fk_jogador FOREIGN KEY (id_jogador) REFERENCES jogador(id_jogador) ON DELETE CASCADE,
    CONSTRAINT fk_item FOREIGN KEY (id_item) REFERENCES itens(id_item)
);


INSERT INTO categoria (tipo) VALUES
('Blocos'),
('Equipamentos'),
('Alimentos'),
('Ferramentas'),
('Armas'),
('Itens Diversos');

INSERT INTO jogador (vida, nivel, apelido, imagem) VALUES (10.0, 67, 'Manoel Gomes', '');
INSERT INTO jogador (vida, nivel, apelido, imagem) VALUES (10.0, 67, 'Manoel Gomes', 'semimagem');
INSERT INTO jogador (vida, nivel, apelido, imagem) VALUES (10.0, 67, 'Manoel Gomes', 'semimagem');

INSERT INTO itens(id_categoria,dano, item_Img, nome) VALUES


    (1,0, 'areia.png', 'Bloco de Areia'),
    (1,0, 'bau.png', 'Bau'),
    (1,0, 'BlocoGrama.png', 'Bloco de Grama'),
    (1,0, 'fornalha.png', 'Fornalha'),
    (1,0, 'MadeiraCarvalho.png', 'Madeira de Carvalho'),
    (1,0, 'mesadetrabalho.png', 'Mesa de Trabalho'),
    (1,0, 'pedregulho.png', 'Pedregulho'),
    (1,0, 'rochamatriz.png', 'Rocha Matriz'),
    (1,0, 'vidro.png', 'Vidro'),

    (2,0, 'CotaDeMalhaPeitoral.png', 'peitoral de Cota de Malha'),
    (2,0, 'CotaDeMalhaCapacete.png', 'capacete de Cota de Malha'),
    (2,0, 'CotaDeMalhaBota.png', 'bota de Cota de Malha'),
    (2,0, 'CotaDeMalhaCalca.png', 'calca de Cota de Malha'),


    (3,0, 'bagasdoces.png', 'Bagas Doces'),
    (3,0, 'batata.png', 'Batata'),
    (3,0, 'batataassada.png', 'Batata Assada'),
    (3,0, 'biscoito.png', 'Biscoito'),
    (3,0, 'carneovelha.png', 'Carne de Ovelha'),
    (3,0, 'carneporco.png', 'Carne de Porco'),
    (3,0, 'cenoura.png', 'Cenoura'),
    (3,0, 'frangoassado.png', 'Frango Assado'),
    (3,0, 'maca.png', 'Maçã'),
    (3,0, 'macadourada.png', 'Maçã Dourada'),
    (3,0, 'pao.png', 'Pão'),



    (4,0, 'enxadadiamante.png', 'Enxada de Diamante'),
    (4,0, 'machadoferro.png', 'Machado de Ferro'),
    (4,0, 'picaretanetherita.png', 'Picareta de Netherita'),
    (4, 0, 'baldeagua.png', 'Balde de Água'),

    (5, 1, 'arco.png', 'Arco'),
    (5,1, 'flecha.png', 'Flecha'),
    (5,5, 'espadaouro.png', 'Espada de Ouro'),

    (6, 0, 'Papedra.png', 'Pá de Pedra'),
    (6, 0, 'peroladofim.png', 'Pérola do Fim');
