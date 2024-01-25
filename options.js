import Colors from "./modules/colors.js";
// for webpack to minimmize css 
import "./options.css"


function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:application/json;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename + ".json");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function compareArrays(array1, array2) {
    const array2Sorted = array2.slice().sort();
    return array1.length === array2.length && array1.slice().sort().every(function(value, index) {
        return value === array2Sorted[index];
    });
}

function checkIfSafeJSON(data) {
    console.log('data :>> ', data);
    console.log('data :>> ', Object.keys(data));
    console.log('data :>> ', Object.values(data));

    if (compareArrays(Object.keys(data), ['dark', 'light']) 
        && Object.values(data).every(function(value) {
            if (typeof value === "object"
                && compareArrays(Object.keys(value), ["acc", "bac", "txt"])
                && Object.values(value).every(function(value) {
                    if (typeof value === "string"
                        && value.startsWith("#")
                        && value.length <= 7) {
                            return true;
                        }
                    return false;
                })
                ) {
                return true;
            }
            return false;
        })
        ) {
        return true;
    }
    return false;
}

function handleFile(files) {
    const file = files[0];
    if (file.type !== "application/json") {
        alert("Erro: O ficheiro deve ser do tipo '.json'");
        return;
    }
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function() {
        const data = JSON.parse(reader.result);
        console.log(':>> ', checkIfSafeJSON(data));
        if (checkIfSafeJSON(data)) {
            let colors = data;
            chrome.storage.local.set({ colors });
            Colors.checkModes();
            colorSelectButtons();
        } 
    }
}

function apply_colors() {
    const color_selects = document.querySelectorAll(".color_select");
    color_selects[0].value
    const colors = {
        "light": {
            "acc": color_selects[0].value,
            "bac": color_selects[1].value,
            "txt": color_selects[2].value,
        },
        "dark": {
            "acc": color_selects[3].value,
            "bac": color_selects[4].value,
            "txt": color_selects[5].value,
        },
    }
    chrome.storage.local.set({ colors });
    Colors.checkModes();
}

function color_button(button_list, on) {
    const accent3 = window.getComputedStyle(document.documentElement).getPropertyValue('--accent-3');
    if (on) {
        button_list[0].style.backgroundColor = accent3;
        button_list[1].style = "";
    } else {
        button_list[1].style.backgroundColor = accent3;
        button_list[0].style = "";
    }
}

function colorSelectButtons() {
    chrome.storage.local.get(['custom', 'colors', 'dark'], ({ colors }) => {
        const color_selects = document.querySelectorAll(".color_select");
        const color_theme_dark = [colors.dark.acc, colors.dark.bac, colors.dark.txt];
        const color_theme_light = [colors.light.acc, colors.light.bac, colors.light.txt];
        for (let i = 0; i < 6; i++) {
            const selector = color_selects[i];
            if (i < 3) {
                selector.value = color_theme_light[i];
            } else {
                selector.value = color_theme_dark[i - 3];
            }
        }
    });
}

function main() {
    const in_div_buttons = document.querySelectorAll(".in-div-button");
    Colors.checkModes();
    colorSelectButtons();

    // no clue porque mas se custom=false color_button() não da cor ao botao pq accent3='' ent e preciso um setTimeout()
    setTimeout(() => {
        chrome.storage.local.get('custom', ({ custom }) => {
            color_button(in_div_buttons, custom);
            // AVISO: pode causar problemas se forem adicionados mais botões como estes
        });
    }, 100);

    in_div_buttons[0].addEventListener('click', async () => {
        chrome.storage.local.get('custom', ({ custom }) => {
            if (!custom) {
                custom = true;
                chrome.storage.local.set({ custom });
                Colors.checkModes();
                colorSelectButtons();
                setTimeout(() => {color_button(in_div_buttons, custom)}, 100);
            }
        });
    });

    in_div_buttons[1].addEventListener('click', async () => {
        chrome.storage.local.get('custom', ({ custom }) => {
            if (custom) {
                custom = false;
                chrome.storage.local.set({ custom });
                Colors.checkModes();
                colorSelectButtons();
                setTimeout(() => {color_button(in_div_buttons, custom)}, 100);
            }
        });
    });

    const apply = document.querySelector(".apply_colors")
    apply.addEventListener("click", function() {
        apply_colors();
    })

    document.querySelector(".download_colors").addEventListener("click", function() {
        chrome.storage.local.get('colors', ({ colors }) => {
            const text = JSON.stringify(colors);
            const filename = "theme_v1";
            
            download(filename, text);
        });
    }, false);

    document.querySelector(".upload_colors").addEventListener("change", function() {
        handleFile(this.files);
    }, false);

    document.querySelector(".reset-tutorial").addEventListener("click", function() {
        let tutorialStatus = 0;
        chrome.storage.local.set({ tutorialStatus });
        alert("Da próxima vez que fizeres login no clip++ o tutorial vai aparecer");
    });

    Colors.addOnChangeListener();
}

main();
