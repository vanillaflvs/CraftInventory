create database projMine;
use projMine;
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
	limite_inventario int set default 36,
    imagem varchar(300)
);
CREATE TABLE itens_Jogador (
    id_jogador INT,
    id_item INT,
    quantidade INT,

    CONSTRAINT fk_jogador FOREIGN KEY (id_jogador) REFERENCES jogador(id_jogador),
    CONSTRAINT fk_item FOREIGN KEY (id_item)REFERENCES itens(id_item)
);


INSERT INTO categoria (tipo) VALUES
('Blocos'),
('Equipamentos'),
('Alimentos'),
('Ferramentas'),
('Armas'),
('Itens Diversos');

INSERT INTO jogador (vida, nivel, apelido, imagem) VALUES (10.0, 67, 'Manoel Gomes', 'semimagem');
INSERT INTO itens
(id_categoria,dano, item_Img, nome)
VALUES

(1,0, 'cotademalha.png', 'Armadura de Cota de Malha'),
(1,0, 'areia.png', 'Bloco de Areia'),
(1,0, 'bau.png', 'Bau'),
(1,0, 'grama.png', 'Bloco de Grama'),
(1,0, 'fornalha.png', 'Fornalha'),
(1,0, 'madeiradecarvalho.png', 'Madeira de Carvalho'),
(1,0, 'mesadetrabalho.png', 'Mesa de Trabalho'),
(1,0, 'pedregulho.png', 'Pedregulho'),
(1,0, 'rochamatriz.png', 'Rocha Matriz'),
(1,0, 'vidro.png', 'Vidro'),

-- ALIMENTOS (id_categoria = 3)
(3,0, 'bagasdoces.png', 'Bagas Doces'),
(3,0, 'batata.png', 'Batata'),
(3,0, 'batataassada.png', 'Batata Assada'),
(3,0, 'biscoito.png', 'Biscoito'),
(3,0, 'carnedeovelha.png', 'Carne de Ovelha'),
(3,0, 'carnedeporco.png', 'Carne de Porco'),
(3,0, 'cenoura.png', 'Cenoura'),
(3,0, 'frangoassado.png', 'Frango Assado'),
(3,0, 'maca.png', 'Maçã'),
(3,0, 'macadourada.png', 'Maçã Dourada'),
(3,0, 'pao.png', 'Pão'),

-- ARMAS (id_categoria = 5)
(5, 1, 'arco.png', 'Arco'),
(5,1, 'flecha.png', 'Flecha'),
(5,5, 'espadaouro.png', 'Espada de Ouro'),

-- FERRAMENTAS (id_categoria = 4)
(4,0, 'enxadadiamante.png', 'Enxada de Diamante'),
(4,0, 'machadoferro.png', 'Machado de Ferro'),
(4,0, 'picaretanetherita.png', 'Picareta de Netherita'),

-- ITENS DIVERSOS (id_categoria = 6)
(6, 0, 'baldeagua.png', 'Balde de Água'),
(6, 0, 'pedra.png', 'Pá de Pedra'),
(6, 0, 'peroladofim.png', 'Pérola do Fim');
