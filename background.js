// background.js

// general stuff
let on = true;  // executar ou não clipppcode.js (css vai sempre)
let dark = true;  // dark mode on/off
let custom = false;  // custom colors on/off
let colors = {  // custom colors
    "light": {
        "acc": "#bbccbb",
        "bac": "#aadddd",
        "txt": "#000000",
    },
    "dark": {
        "acc": "#ffaa00",
        "bac": "#000000",
        "txt": "#ffffff",
    }
}

// links das páginas do clip favoritas (!guardar um max de 10(?) !)
// Link = {name: <str>, link: <str>}
let savedLinks = [];

// tutorial completion int (0 se nenhum esta completo [0 => 1 : se completou o tt da pag x, etc])
let tutorialStatus = 0;
// 0 -> 1 : password
// 1 -> 2 : / OU /utente/eu
// 2 -> 3 : /utente/eu/aluno
// 3 -> 4 : /utente/eu/aluno/ano_lectivo
// 4 -> 5 : /utente/eu/aluno/ano_lectivo/unidades

// add variables to extension storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.set({ on, dark, custom, colors, savedLinks, tutorialStatus });   // [!] LEMBRAR Q TEM Q SE METER/TIRAR AQUI AS VARIAVEIS QUANDO SE ADICIONA/TIRA [!]
});
