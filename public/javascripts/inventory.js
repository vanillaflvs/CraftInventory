
const $ = id => document.getElementById(id);

// Catálogo de itens

const categories = {
    Armadura: [
        "CotaDeMalhaCapacete",
        "CotaDeMalhaPeitoral",
        "CotaDeMalhaCalca",
        "CotaDeMalhaBota"
    ],

    Bloco: [
        "Areia",
        "Bau",
        "BlocoGrama",
        "Fornalha",
        "MadeiraCarvalho",
        "MesaDeTrabalho",
        "Pedregulho",
        "RochaMatriz",
        "Vidro"
    ],

    Comida: [
        "BagasDocess",
        "Batata",
        "BatataAssada",
        "Biscoito",
        "CarneBoi",
        "CarnePorco",
        "Cenoura",
        "FrangoAssado",
        "Maca",
        "MacaDourada",
        "Pao"
    ],

    Ferramentas: [
        "Arco",
        "BaldeAgua",
        "EnxadaDiamante",
        "EspadaOuro",
        "Flecha",
        "MachadoFerro",
        "PaPedra",
        "PerolaDoFim",
        "PicaretaNetherita"
    ]
};

const items = [];

Object.entries(categories).forEach(([category, names]) => {

    names.forEach(file => {

        items.push({
            id: file,

            name: file.replace(
                /([a-z])([A-Z])/g,
                "$1 $2"
            ),

            category,

            image: `/images/${category}/${file}.png`
        });

    });

});

let player = "";
let inventory = Array(36).fill(null);

let selectedItem = null;
let selectedSlot = null;
let mode = "add";

// =========================
// ARMAZENAMENTO
// =========================

function storageKey() {
    return "craftinventory:" + player.toLowerCase();
}

function saveInventory() {

    localStorage.setItem(
        storageKey(),
        JSON.stringify(inventory)
    );

}

function loadInventory() {

    try {

        const data = JSON.parse(
            localStorage.getItem(storageKey())
        );

        inventory = Array.from(
            { length: 36 },
            (_, i) => {

                const entry = data?.[i];

                if (
                    entry &&
                    items.some(item => item.id === entry.id) &&
                    Number.isInteger(entry.quantity) &&
                    entry.quantity >= 1 &&
                    entry.quantity <= 64
                ) {
                    return entry;
                }

                return null;
            }
        );

    } catch {

        inventory = Array(36).fill(null);

    }

}

// =========================
// LOGIN
// =========================

$("loginForm").onsubmit = event => {

    event.preventDefault();

    player = $("nickname").value.trim();

    if (!player) return;

    loadInventory();

    $("player").textContent = "Jogador: " + player;

    $("login").hidden = true;
    $("game").hidden = false;

    renderInventory();
    renderCatalog();
    renderArmor();

};

$("logout").onclick = () => {

    saveInventory();

    $("game").hidden = true;
    $("login").hidden = false;

};

// =========================
// TOOLTIP
// =========================

function tooltip(element, text) {

    element.onmouseenter = () => {

        $("tooltip").textContent = text;
        $("tooltip").hidden = false;

    };

    element.onmousemove = event => {

        const tip = $("tooltip");

        tip.style.left = Math.min(
            event.clientX + 15,
            window.innerWidth - tip.offsetWidth - 8
        ) + "px";

        tip.style.top = Math.min(
            event.clientY + 15,
            window.innerHeight - tip.offsetHeight - 8
        ) + "px";

    };

    element.onmouseleave = hideTooltip;

}

function hideTooltip() {
    $("tooltip").hidden = true;
}

// =========================
// CATÁLOGO
// =========================

function renderCatalog() {

    hideTooltip();

    const container = $("catalog");

    const search = $("search")
        .value
        .toLowerCase()
        .trim();

    container.replaceChildren();

    items.forEach(item => {

        const text = (
            item.name + " " + item.category
        ).toLowerCase();

        if (!text.includes(search)) return;

        const button = document.createElement("button");

        button.className = "catalog-item";
        button.type = "button";
        button.setAttribute("aria-label", item.name);

        const image = document.createElement("img");

        image.src = item.image;
        image.alt = item.name;

        button.appendChild(image);

        button.onclick = () => {

            openModal(item, "add");

        };

        tooltip(
            button,
            item.name + "\n" + item.category
        );

        container.appendChild(button);

    });

}

$("search").oninput = renderCatalog;

// =========================
// ARMADURAS DECORATIVAS
// =========================

function renderArmor() {

    $("armor").replaceChildren();

    items
        .filter(item => item.category === "Armadura")
        .forEach(item => {

            const slot = document.createElement("div");

            slot.className = "slot";

            const image = document.createElement("img");

            image.src = item.image;
            image.alt = item.name;

            slot.appendChild(image);

            tooltip(slot, item.name);

            $("armor").appendChild(slot);

        });

}

// =========================
// CRIAR SLOT
// =========================

function createSlot(index, interactive = true) {

    const slot = document.createElement(
        interactive ? "button" : "div"
    );

    slot.className = "slot";

    if (interactive) slot.type = "button";

    const entry = inventory[index];

    if (entry) {

        const item = items.find(
            item => item.id === entry.id
        );

        if (item) {

            const image = document.createElement("img");

            image.src = item.image;
            image.alt = item.name;

            slot.appendChild(image);

            if (entry.quantity > 1) {

                const amount = document.createElement("span");

                amount.className = "amount";
                amount.textContent = entry.quantity;

                slot.appendChild(amount);

            }

            if (interactive) {

                slot.setAttribute(
                    "aria-label",
                    item.name + ", quantidade " + entry.quantity
                );

                tooltip(
                    slot,
                    item.name +
                    "\nQuantidade: " + entry.quantity +
                    "\nClique para editar"
                );

                slot.onclick = () => {

                    selectedSlot = index;

                    openModal(item, "edit", entry.quantity);

                };

                slot.draggable = true;

                slot.ondragstart = event => {

                    hideTooltip();

                    event.dataTransfer.setData(
                        "text/plain",
                        String(index)
                    );

                };

            }

        }

    } else if (interactive) {

        slot.setAttribute("aria-label", "Espaço vazio");

    }

    if (interactive) {

        slot.ondragover = event => {
            event.preventDefault();
        };

        slot.ondrop = event => {

            event.preventDefault();

            const raw = event.dataTransfer.getData(
                "text/plain"
            );

            if (!/^\d+$/.test(raw)) return;

            const origin = Number(raw);

            if (
                origin < 0 ||
                origin >= 36 ||
                origin === index
            ) return;

            moveItem(origin, index);

        };

    }

    return slot;

}

// =========================
// RENDERIZAR INVENTÁRIO
// =========================

function renderInventory() {

    hideTooltip();

    $("slots").replaceChildren();
    $("hotbar").replaceChildren();
    $("hudHotbar").replaceChildren();

    for (let i = 0; i < 27; i++) {

        $("slots").appendChild(createSlot(i));

    }

    for (let i = 27; i < 36; i++) {

        $("hotbar").appendChild(createSlot(i));

        $("hudHotbar").appendChild(
            createSlot(i, false)
        );

    }

}

// =========================
// MOVER ITEM
// =========================

function moveItem(origin, destination) {

    const source = inventory[origin];
    const target = inventory[destination];

    if (!source) return;

    // Empilhar itens iguais

    if (target && source.id === target.id) {

        const available = 64 - target.quantity;

        const transfer = Math.min(
            available,
            source.quantity
        );

        target.quantity += transfer;
        source.quantity -= transfer;

        if (source.quantity === 0) {

            inventory[origin] = null;

        }

    } else {

        // Trocar os itens de posição

        inventory[origin] = target;
        inventory[destination] = source;

    }

    saveInventory();
    renderInventory();

}

// =========================
// ABRIR MODAL
// =========================

function openModal(item, action, quantity = 1) {

    hideTooltip();

    selectedItem = item;
    mode = action;

    $("modalTitle").textContent =
        mode === "add"
            ? "Adicionar item"
            : "Editar item";

    $("previewImage").src = item.image;
    $("previewImage").alt = item.name;

    $("previewName").textContent = item.name;

    $("quantity").value = quantity;

    $("remove").hidden = mode === "add";

    $("editor").showModal();

}

// =========================
// BOTÕES DE QUANTIDADE
// =========================

document.querySelectorAll("[data-qty]")
    .forEach(button => {

        button.onclick = () => {

            $("quantity").value =
                button.dataset.qty;

        };

    });

// =========================
// ADICIONAR ITEM
// =========================

function addItem(item, quantity) {

    let remaining = quantity;

    // Completar pilhas existentes

    for (let i = 0; i < inventory.length; i++) {

        const entry = inventory[i];

        if (
            entry &&
            entry.id === item.id &&
            entry.quantity < 64
        ) {

            const available = 64 - entry.quantity;

            const added = Math.min(
                available,
                remaining
            );

            entry.quantity += added;
            remaining -= added;

        }

        if (remaining === 0) break;

    }

    // Ocupar espaços vazios

    while (remaining > 0) {

        const empty = inventory.findIndex(
            entry => entry === null
        );

        if (empty === -1) break;

        const added = Math.min(64, remaining);

        inventory[empty] = {
            id: item.id,
            quantity: added
        };

        remaining -= added;

    }

    if (remaining > 0) {

        $("status").textContent =
            "Inventário cheio. " +
            remaining +
            " itens não foram adicionados.";

    } else {

        $("status").textContent =
            quantity + "x " +
            item.name +
            " adicionado.";

    }

    saveInventory();
    renderInventory();

}

// =========================
// CONFIRMAR MODAL
// =========================

$("editForm").onsubmit = event => {

    event.preventDefault();

    const quantity = Number($("quantity").value);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 64 ||
        !selectedItem
    ) return;

    if (mode === "add") {

        addItem(selectedItem, quantity);

    } else {

        inventory[selectedSlot] = {
            id: selectedItem.id,
            quantity
        };

        saveInventory();
        renderInventory();

        $("status").textContent =
            "Quantidade atualizada.";

    }

    $("editor").close();

};

// =========================
// EXCLUIR ITEM
// =========================

$("remove").onclick = () => {

    if (mode !== "edit") return;

    inventory[selectedSlot] = null;

    saveInventory();
    renderInventory();

    $("status").textContent = "Item removido.";

    $("editor").close();

};
    
// =========================
// CANCELAR
// =========================

$("cancel").onclick = () => {

    $("editor").close();

};
