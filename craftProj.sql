create database projMine;
create table if not exists itens(
	id_iten int primary key,
    id_categoria int,
    quantidade int,
    dano double,
    nome varchar(50),
    constraint id_categoria foreign key(id_categoria) references categoria(id_categoria)
);
create table categoria(
	id_categoria int primary key auto_increment,
    tipo varchar(30)
);
create table jogador(
	id_jogador int primary key,
	vida double,
    nivel int,
	apelido varchar(50),
	limite_inventario int  default 36,
    imagem varchar(300)
);
create table itens_Jogador(
		id_jogador int,
		id_iten  int,
		constraint id_jogador foreign key(id_jogador) references jogador(id_jogador),
		constraint id_iten foreign key(id_iten) references iten(id_iten)
);


