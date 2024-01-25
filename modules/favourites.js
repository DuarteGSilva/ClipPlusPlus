/**
 * makes and appends to the document the favourites 'dropup' menu present in most page's bottom left corner
 */
export default function makeFavsDropup() {
    document.querySelector(".addFav").addEventListener("click", addNewLink);
    document.querySelector(".removeFav").addEventListener("click", removeLinks);

    Array.from(document.querySelectorAll(".dropup-block")).forEach(element => {element.remove();});
    document.querySelector(".dph_")?.remove();
    chrome.storage.local.get(['savedLinks'], ({ savedLinks }) => {
        // each 'link' on the array 'savedLinks' = {"name": "pag 1", "link": "/"}
        let final = "";
        for (const link of savedLinks) {
            final += `<a href="${link.link}" class="dropup-block" data-name="${link.name}">${link.name}</a>`;
        }
        if (!final) {
            final += `<h5 class="dph_">Ainda não existem páginas nos favoritos</h5>`;
        }
        document.querySelector(".dropup-content").insertAdjacentHTML("afterbegin", final);

        Array.from(document.querySelectorAll(".dropup-block")).forEach(element => {element.onclick = removeSelf;})
    });
}

function checkInput(input) {
    return !input.includes("<script>");
}

function clearOverlay() {
    const overlay = document.querySelectorAll("._overlay");
    overlay.forEach((value) => {value.remove()});
}

function addFav() {
    chrome.storage.local.get(['savedLinks'], ({ savedLinks }) => {

        const inputs = document.querySelectorAll(".inp");
        let dict = {};
        for (const inp of inputs) {
            if (!checkInput(inp.value)) {
                alert("AVISO: input inválido.. Tu sabes porquê ;)");
                return;
            }
            if ((inp.name === "name") && (inp.value.length >= 30)) {
                alert("AVISO: input inválido [nome muito longo]");
                return;
            }
            dict[inp.name] = inp.value;
        }
        savedLinks.push(dict);
        chrome.storage.local.set({ savedLinks });
        makeFavsDropup();
        clearOverlay();
    });
}

function addNewLink() {
    chrome.storage.local.get(['savedLinks'], ({ savedLinks }) => {
        if (savedLinks.length >= 10) {
            alert("Número máximo de favoritos atingido!")
            return;
        }
        document.querySelector("._dummy").innerHTML = `<button class="darken _overlay"></button>
        <div class="mypost _overlay">
            <h1>Adicionar Favorito</h1>
            <span class="note">INFO: o link que já está preenchido é o da página atual</span>
            <div class="edit-form">
                <div class="divi">
                    <span>Nome</span>
                    <input type="text" class="inp" name="name">
                </div>
                <div class="divi">
                    <span>Link</span>
                    <input type="text" class="inp" name="link">
                </div>
                <div class="divi">
                    <button class="action-btn" id="cancelar">Cancelar</button>
                    <button class="action-btn" id="adicionar">Adicionar</button>
                </div>
            </div>
        </div>`;

        document.querySelector(".darken").addEventListener("click", clearOverlay);
        document.getElementById("cancelar").addEventListener("click", clearOverlay);
        document.getElementById("adicionar").addEventListener("click", addFav);

        const url_ = new URL(document.URL);

        const inputs = document.querySelectorAll(".inp");
        let dict = {};
        for (const inp of inputs) {
            dict[inp.name] = inp;
        }

        dict.name.value = document.title.split(" - ")[1];
        dict.link.value = url_.pathname + url_.search;
    });
}

function removeLinks() {
    for (const a of document.querySelectorAll(".dropup-block")) {
        a.classList.add("removing");
        a.style.animationDelay = `${(Math.random() - 0.5).toFixed(3)}s`;
    }
    setTimeout(() => {
        for (const a of document.querySelectorAll(".removing")) {
            a.classList.remove("removing");
        }
    }, 8000);
}

function removeSelf() {
    if (this.classList.contains("removing")) {
        chrome.storage.local.get(['savedLinks'], ({ savedLinks }) => {
            for (let i = 0; i < savedLinks.length; i++) {
                const link = savedLinks[i];
                if (link.name === this.dataset.name) {
                    savedLinks.splice(i, 1);
                    break;
                }
            }
            chrome.storage.local.set({ savedLinks });
            this.remove();
            if (savedLinks.length === 0) {
                document.querySelector(".dropup-content").insertAdjacentHTML("afterbegin", '<h5 class="dph_">Ainda não existem páginas nos favoritos</h5>');
            }
        });
        return false;
    }
}