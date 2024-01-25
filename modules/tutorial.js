export class Dialog {
    // VERSION: 1.0.1
    // Changelog: (line 6) array<object> -> object[]
    /**
     * Inicia uma instância do objeto Dialog (tutorial)
     * @param {object[]} text instancias de texto de um tutorial [{ text: "Olá, eu sou...", element: document.query() | null, special: "arrow" | "buttons" | null }, {...}]
     * @param {function} endAction função que corre ao acabar de ser mostrado o diálogo
     */
    constructor(text, endAction) {
        this.text = text;
        this.endAction = endAction;

        this.playing = false;
        this.index = 0;
    }

    /**
     * Privado - Verifica se há algum evento especial que deve acontecer em conjunto com o texto atual e executa-o
     * @param {object} currentText 
     */
    static #checkSpecial(currentText) {
        for (const el of document.querySelectorAll(".tut-spec")) {
            el.remove();
        }

        if (currentText && currentText.special) {
            switch (currentText.special[0]) {
                case "arrow": {
                    document.querySelector("._dummy").insertAdjacentHTML("beforeend", `
                    <div class="dialog-seta tut-el tut-spec">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <path d="M246.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 109.3 361.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 
                            0-45.3l-160-160zm160 352l-160-160c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L224 301.3 361.4 438.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3z"/>
                        </svg>
                    </div>
                    `);
                    }

                    break;
                
                case "buttons": {
                    document.querySelector(".dialog-div").insertAdjacentHTML("beforeend", `
                    <div class="dialog-buttons tut-spec">
                        <button class="tutorial-button0">Sim</button>
                        <button class="tutorial-button1">Talvez mais tarde</button>
                    </div>
                    `);

                    document.querySelector(".tutorial-button0").addEventListener("click", function() {
                        currentText.special[1]();
                    });
                    document.querySelector(".tutorial-button1").addEventListener("click", function() {
                        currentText.special[2]();
                    });
                    }

                    break;
            
                default:
                    break;
            }
        }
    }

    /**
     * Começa a mostra do tutorial
     */
    play() {
        let currentText = this.text[0];
        currentText.element?.style.setProperty('z-index', '3');

        document.querySelector("._dummy").innerHTML = `
        <button class="darken tut-el"></button>
        <div class="dialog-scaffold tut-el">
            <div class="dialog-inner-scaffold">
                <div class="dialog-div">
                    <span class="dialog">
                        ${currentText.text}
                    </span>
                </div>
                <img src="${chrome.runtime.getURL('./images/clipppmascot.png')}" alt="Clip++ Mascot" class="mascot">
            </div>
        </div>`;

        Dialog.#checkSpecial(currentText);

        addEventListener('click', () => {
            this.next();
        });
        this.playing = true;
    }

    /**
     * avança para o próximo texto dando conta de todos os eventos necessários
     */
    next() {
        if (!this.playing) {
            return;
        } else if (Object.hasOwn(this.text[this.index], "special") && this.text[this.index].special[0] === "buttons") {
            return;
        }
        let currentText = this.text[this.index];
        currentText.element?.style.setProperty('z-index', '0');

        this.index++;
        if (this.index < this.text.length) {
            currentText = this.text[this.index];
            currentText.element?.style.setProperty('z-index', '3');

            document.querySelector(".dialog-div").remove();
            document.querySelector(".dialog-inner-scaffold").insertAdjacentHTML("afterbegin", `
            <div class="dialog-div">
                <span class="dialog">
                    ${currentText.text}
                </span>
            </div>
            `);

            Dialog.#checkSpecial(currentText);
        } else {
            this.playing = false;
            for (const el of document.querySelectorAll(".tut-el")) {
                el.remove();
            }
            if (this.endAction) {
                this.endAction();
            }
        }
    }
}

export function passTutorial(from, to) {
    chrome.storage.local.get('tutorialStatus', ({ tutorialStatus }) => {
        if (tutorialStatus === from) {
            tutorialStatus = to;
            chrome.storage.local.set({ tutorialStatus });
        }
    });
}

export function checkTutorial(value, fun) {
    chrome.storage.local.get('tutorialStatus', ({ tutorialStatus }) => {
        if (tutorialStatus === value) {
            fun();
        }
    });
}
