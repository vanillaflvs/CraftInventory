const $ = id => document.getElementById(id);

let items = [];
let inventory = Array(36).fill(null);
let selectedItem = null;
let selectedSlot = null;
let mode = "add";
let salvando = false;

async function api(url, method = 'GET', body) {
    const resposta = await fetch('/api/' + url, {
        method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        throw new Error(dados.mensagem || 'Erro na requisição');
    }

    return dados;
}

async function saveInventory() {
    salvando = true;

    try {
        await api('inventario', 'PUT', inventory);
        return true;

    } catch (erro) {
        $('status').textContent = 'Erro ao salvar: ' + erro.message;

        try {
            inventory = await api('inventario');
        } catch {
            location.reload();
        }

        return false;

    } finally {
        salvando = false;
        renderInventory();
    }
}

function mostrarJogador(jogador) {
    $('player').textContent = 'Jogador: ' + jogador.apelido;
    $('nivelHud').textContent = jogador.nivel;

    document.querySelectorAll('.hearts span').forEach((el, i) => {
        if (jogador.vida >= (i + 1) * 2) {
            el.style.opacity = '1';
        } else if (jogador.vida > i * 2) {
            el.style.opacity = '0.55';
        } else {
            el.style.opacity = '0.2';
        }
    });
}

async function entrar() {
    const jogador = await api('jogador');

    items = await api('itens');
    inventory = await api('inventario');

    mostrarJogador(jogador);

    $('login').hidden = true;
    $('game').hidden = false;

    renderInventory();
    renderCatalog();
    renderArmor();
}

async function autenticar(rota) {
    if (!$('loginForm').reportValidity()) return;

    try {
        await api(rota, 'POST', {
            apelido: $('nickname').value.trim(),
            senha: $('senha').value
        });

        $('senha').value = '';

        await entrar();

    } catch (erro) {
        $('loginStatus').textContent = erro.message;
    }
}

$('loginForm').onsubmit = event => {
    event.preventDefault();
    autenticar('login');
};

$('cadastro').onclick = () => {
    autenticar('cadastro');
};

$('logout').onclick = async () => {
    if (salvando) return;

    try {
        await api('logout', 'POST');
        location.reload();

    } catch (erro) {
        $('status').textContent = erro.message;
    }
};

$('perfil').onclick = async () => {
    try {
        const jogador = await api('jogador');

        $('perfilNome').value = jogador.apelido;
        $('perfilVida').value = jogador.vida;
        $('perfilNivel').value = jogador.nivel;

        $('senhaAtual').value = '';
        $('novaSenha').value = '';
        $('perfilStatus').textContent = '';

        $('perfilDialog').showModal();

    } catch (erro) {
        $('status').textContent = erro.message;
    }
};

$('fecharPerfil').onclick = () => {
    $('perfilDialog').close();
};

$('perfilForm').onsubmit = async event => {
    event.preventDefault();

    try {
        await api('jogador', 'PUT', {
            apelido: $('perfilNome').value,
            vida: Number($('perfilVida').value),
            nivel: Number($('perfilNivel').value),
            senha: $('novaSenha').value,
            senhaAtual: $('senhaAtual').value
        });

        mostrarJogador(await api('jogador'));

        $('perfilDialog').close();

    } catch (erro) {
        $('perfilStatus').textContent = erro.message;
    }
};

function tooltip(element, text) {
    element.onmouseenter = () => {
        $('tooltip').textContent = text;
        $('tooltip').hidden = false;
    };

    element.onmousemove = event => {
        const tip = $('tooltip');

        tip.style.left = Math.min(
            event.clientX + 15,
            window.innerWidth - tip.offsetWidth - 8
        ) + 'px';

        tip.style.top = Math.min(
            event.clientY + 15,
            window.innerHeight - tip.offsetHeight - 8
        ) + 'px';
    };

    element.onmouseleave = hideTooltip;
}

function hideTooltip() {
    $('tooltip').hidden = true;
}

function renderCatalog() {
    hideTooltip();

    const container = $('catalog');
    const search = $('search').value.toLowerCase().trim();

    container.replaceChildren();

    items.forEach(item => {
        const text = (item.name + ' ' + item.category).toLowerCase();

        if (!text.includes(search)) return;

        const button = document.createElement('button');
        button.className = 'catalog-item';
        button.type = 'button';
        button.setAttribute('aria-label', item.name);

        const image = document.createElement('img');
        image.src = item.image;
        image.alt = item.name;

        button.appendChild(image);

        button.onclick = () => {
            openModal(item, 'add');
        };

        tooltip(button, item.name + '\n' + item.category);

        container.appendChild(button);
    });
}

$('search').oninput = renderCatalog;

function renderArmor() {
    $('armor').replaceChildren();

    items.filter(item => item.category === 'Armaduras')
        .forEach(item => {
            const slot = document.createElement('div');
            slot.className = 'slot';

            const image = document.createElement('img');
            image.src = item.image;
            image.alt = item.name;

            slot.appendChild(image);

            tooltip(slot, item.name);

            $('armor').appendChild(slot);
        });
}

function createSlot(index, interactive = true) {
    const slot = document.createElement(
        interactive ? 'button' : 'div'
    );

    slot.className = 'slot';

    if (interactive) {
        slot.type = 'button';
    }

    const entry = inventory[index];

    if (entry) {
        const item = items.find(item => item.id === entry.id);

        if (item) {
            const image = document.createElement('img');

            image.src = item.image;
            image.alt = item.name;

            slot.appendChild(image);

            if (entry.quantity > 1) {
                const amount = document.createElement('span');

                amount.className = 'amount';
                amount.textContent = entry.quantity;

                slot.appendChild(amount);
            }

            if (interactive) {
                slot.setAttribute(
                    'aria-label',
                    item.name + ', quantidade ' + entry.quantity
                );

                tooltip(
                    slot,
                    item.name +
                    '\nQuantidade: ' + entry.quantity +
                    '\nClique para editar'
                );

                slot.onclick = () => {
                    selectedSlot = index;
                    openModal(item, 'edit', entry.quantity);
                };

                slot.draggable = true;

                slot.ondragstart = event => {
                    hideTooltip();

                    event.dataTransfer.setData(
                        'text/plain',
                        String(index)
                    );
                };
            }
        }

    } else if (interactive) {
        slot.setAttribute('aria-label', 'Espaço vazio');
    }

    if (interactive) {
        slot.ondragover = event => {
            event.preventDefault();
        };

        slot.ondrop = event => {
            event.preventDefault();

            const raw = event.dataTransfer.getData('text/plain');

            if (!/^\d+$/.test(raw)) return;

            const origin = Number(raw);

            if (origin < 0 || origin >= 36 || origin === index) {
                return;
            }

            moveItem(origin, index);
        };
    }

    return slot;
}

function renderInventory() {
    hideTooltip();

    $('slots').replaceChildren();
    $('hotbar').replaceChildren();
    $('hudHotbar').replaceChildren();

    for (let i = 0; i < 27; i++) {
        $('slots').appendChild(createSlot(i));
    }

    for (let i = 27; i < 36; i++) {
        $('hotbar').appendChild(createSlot(i));
        $('hudHotbar').appendChild(createSlot(i, false));
    }
}

async function moveItem(origin, destination) {
    if (salvando) return;

    const source = inventory[origin];
    const target = inventory[destination];

    if (!source) return;

    if (target && source.id === target.id) {
        const item = items.find(i => i.id === source.id);
        const available = item.limite - target.quantity;
        const transfer = Math.min(available, source.quantity);

        target.quantity += transfer;
        source.quantity -= transfer;

        if (source.quantity === 0) {
            inventory[origin] = null;
        }

    } else {
        inventory[origin] = target;
        inventory[destination] = source;
    }

    await saveInventory();
}

function openModal(item, action, quantity = 1) {
    if (salvando) return;

    hideTooltip();

    selectedItem = item;
    mode = action;

    $('quantity').max = action === 'edit' ? item.limite : 64;

    $('modalTitle').textContent =
        mode === 'add' ? 'Adicionar item' : 'Editar item';

    $('previewImage').src = item.image;
    $('previewImage').alt = item.name;
    $('previewName').textContent = item.name;
    $('quantity').value = quantity;
    $('remove').hidden = mode === 'add';

    $('editor').showModal();
}

document.querySelectorAll('[data-qty]').forEach(button => {
    button.onclick = () => {
        $('quantity').value = Math.min(
            Number(button.dataset.qty),
            Number($('quantity').max)
        );
    };
});

async function addItem(item, quantity) {
    let remaining = quantity;

    for (let i = 0; i < inventory.length; i++) {
        const entry = inventory[i];

        if (
            entry &&
            entry.id === item.id &&
            entry.quantity < item.limite
        ) {
            const available = item.limite - entry.quantity;
            const added = Math.min(available, remaining);

            entry.quantity += added;
            remaining -= added;
        }

        if (remaining === 0) break;
    }

    while (remaining > 0) {
        const empty = inventory.findIndex(entry => entry === null);

        if (empty === -1) break;

        const added = Math.min(item.limite, remaining);

        inventory[empty] = {
            id: item.id,
            quantity: added
        };

        remaining -= added;
    }

    if (await saveInventory()) {
        if (remaining > 0) {
            $('status').textContent =
                'Inventário cheio. ' + remaining +
                ' itens não foram adicionados.';
        } else {
            $('status').textContent =
                quantity + 'x ' + item.name + ' adicionado.';
        }
    }
}

$('editForm').onsubmit = async event => {
    event.preventDefault();

    if (salvando) return;

    const quantity = Number($('quantity').value);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > Number($('quantity').max) ||
        !selectedItem
    ) return;

    if (mode === 'add') {
        await addItem(selectedItem, quantity);

    } else {
        inventory[selectedSlot] = {
            id: selectedItem.id,
            quantity
        };

        if (await saveInventory()) {
            $('status').textContent = 'Quantidade atualizada.';
        }
    }

    $('editor').close();
};

$('remove').onclick = async () => {
    if (salvando || mode !== 'edit') return;

    inventory[selectedSlot] = null;

    if (await saveInventory()) {
        $('status').textContent = 'Item removido.';
    }

    $('editor').close();
};

$('cancel').onclick = () => {
    $('editor').close();
};

entrar().catch(() => { });