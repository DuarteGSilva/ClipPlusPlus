// import Colors from './modules/colors.js';
// VERSION: 1.1.0
// Changelog: added: comments, docstrings and types; changed: (lines 13-15) substr() [deprecated] -> slice()
// Changelog (old): (line 38) sync -> local

export default class Colors {
    /**
     * changes the color code from hex to hsl
     * @param {string} color
     * @returns {number[]} [h, s, l]
     */
    static hexToHsl(color) {
        let r = parseInt(color.slice(1,3), 16); // Grab the hex representation of red (chars 1-2) and convert to decimal (base 10).
        let g = parseInt(color.slice(3,5), 16);
        let b = parseInt(color.slice(5,7), 16);

        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if(max == min){
            h = s = 0; // achromatic
        }else{
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch(max){
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
            h *= 360;
            s *= 100;
        }
        l *= 100;
        h = Math.round(h);
        s = Math.round(s);
        l = Math.round(l);
        
        return [h, s, l];
    }

    /**
     * checks the current color mode (light, dark or custom) and changes the page accordingly
     */
    static checkModes() {
        chrome.storage.local.get(['dark', 'custom', 'colors'], ({ dark, custom, colors }) => {
            const head = document.querySelector("head");
            if (custom) {
                const color_theme_dark = [colors.dark.acc, colors.dark.bac, colors.dark.txt];
                const color_theme_light = [colors.light.acc, colors.light.bac, colors.light.txt];
                let color_theme = [];
                if (dark) {
                    color_theme = color_theme_dark;
                } else {
                    color_theme = color_theme_light;
                }
                const hsl_accent = this.hexToHsl(color_theme[0]);
                const hsl_back = this.hexToHsl(color_theme[1]);
                head.querySelector("._dark_vars")?.remove();
                head.querySelector("._custom_vars")?.remove();
                head.insertAdjacentHTML('beforeend', 
                `<style class="_custom_vars">
                    :root {
                        --text-color: ${color_theme[2]};
                        --accent-2: ${color_theme[0]};
                        --accent-1: hsl(${hsl_accent[0]}, ${hsl_accent[1]}%, ${(hsl_accent[2] - 6) >= 0 ? hsl_accent[2] - 6 : 0}%);
                        --accent-3: hsla(${hsl_accent[0]}, ${hsl_accent[1]}%, ${hsl_accent[2]}%, 0.27);
                        --background-main: ${color_theme[1]};
                        --background-sec: hsl(${(hsl_back[0] + 10) > 360 ? 360 : hsl_back[0] + 10}, ${(hsl_back[1] - 1) < 0 ? 0 : hsl_back[1] - 1}%, ${(hsl_back[2] + 6) > 360 ? 360 : hsl_back[2] + 6}%);
                        --background-thrd: hsl(${(hsl_back[0] + 20) > 360 ? 360 : hsl_back[0] + 20}, ${(hsl_back[1] - 2) < 0 ? 0 : hsl_back[1] - 2}%, ${(hsl_back[2] + 12) > 360 ? 360 : hsl_back[2] + 12}%);
                    }
                </style>`);
            } else {
                head.querySelector("._custom_vars")?.remove();
                if (dark) {
                    // if dark mode is on this inserts a <style> tag with the replaced :root with dark mode variables that overwrites the light mode ones
                    head.insertAdjacentHTML('beforeend', 
                    `<style class="_dark_vars">
                        :root {
                            --text-color: hsl(36, 5%, 81%);
                            --accent-2: hsl(180, 90%, 40%);
                            --accent-1: hsl(180, 90%, 34%);
                            --accent-3: hsla(180, 90%, 40%, 0.27);
                            --background-main: hsl(200, 6%, 10%);
                            --background-sec: hsl(210, 5%, 16%);
                            --background-thrd: hsl(220, 4%, 22%);
                        }
                    </style>`);
                } else {
                    head.querySelector("._dark_vars")?.remove();
                }
            }
        });
    }

    /**
     * adds an event listener that alters the pages colors if the mode changes from light to dark and vice-versa
     */
    static addOnChangeListener() {
        chrome.storage.onChanged.addListener((changes) => {
            if (changes?.dark) {
                this.checkModes();
            }
        });

        // For smooth transition later if the page changes.
        // timeout because if its added instantly the page will noticeably flash white because 
        // dark mode is always added in with js after the initial page load
        setTimeout(() => {
            document.querySelector("body").style.transition = "background-color 0.8s";
        }, 200);
    }
}
