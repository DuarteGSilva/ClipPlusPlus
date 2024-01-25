import Colors from "./modules/colors.js";
// for webpack to minimmize css 
import "./popup.css"

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

function update_button_color(is_onoff, list) {
    if (is_onoff) {
        chrome.storage.local.get('on', ({ on }) => {
            color_button(list, on);
        });
    } else {
        chrome.storage.local.get('dark', ({ dark }) => {
            color_button(list, dark);
        });
    }
}

function main() {
    let onoff_list = document.getElementsByName('onoff');
    let mode_list = document.getElementsByName('mode');

    // no clue porque mas se custom=false color_button() não da cor aos botoes pq accent3='', ent e preciso um setTimeout()
    setTimeout(() => {
        Colors.checkModes();

        chrome.storage.local.get('dark', ({ dark }) => {
            color_button(mode_list, dark);
        });

        chrome.storage.local.get('on', ({ on }) => {
            color_button(onoff_list, on);
        });
    }, 100)

    onoff_list[0].addEventListener('click', async () => {
        chrome.storage.local.get('on', ({ on }) => {
            if (!on) {
                on = true;
                chrome.storage.local.set({ on });
                setTimeout(() => {color_button(onoff_list, on);}, 100);
                update_button_color(false, mode_list)
            }
        });
    });

    onoff_list[1].addEventListener('click', async () => {
        chrome.storage.local.get('on', ({ on }) => {
            if (on) {
                on = false;
                chrome.storage.local.set({ on });
                setTimeout(() => {color_button(onoff_list, on);}, 100);
                update_button_color(false, mode_list)
            }
        });
    });

    mode_list[0].addEventListener('click', async () => {
        chrome.storage.local.get('dark', ({ dark }) => {
            if (!dark) {
                dark = true;
                chrome.storage.local.set({ dark });
                // check_modes();
                Colors.checkModes();
                setTimeout(() => {color_button(mode_list, dark);}, 100);
                update_button_color(true, onoff_list)
            }
        });
    });

    mode_list[1].addEventListener('click', async () => {
        chrome.storage.local.get('dark', ({ dark }) => {
            if (dark) {
                dark = false;
                chrome.storage.local.set({ dark });
                // check_modes();
                Colors.checkModes();
                setTimeout(() => {color_button(mode_list, dark);}, 100);
                update_button_color(true, onoff_list)
            }
        });
    });

    document.querySelector(".options").addEventListener("click", () => {
        chrome.runtime.openOptionsPage();
    });

    // make an anchor tag <a> work on popup.html
    document.querySelector(".github").addEventListener("click", function () {
        chrome.tabs.create({url: this.href});
        return false;
    });

    Colors.addOnChangeListener();
}

main();
