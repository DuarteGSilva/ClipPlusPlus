class Time {
    constructor(horas, mins) {
        this.horas = horas;
        this.mins = mins;
    }

    asString() {
        return `${this.horas}:${this.mins}`;
    }

    asInteger() {
        return this.horas * 100 + this.mins;
    }

    in(aula) {
        return (aula.start_time.asInteger() <= this.asInteger()) && 
            (this.asInteger() < aula.end_time.asInteger());
    }

    equals(other) {
        return this.horas === other.horas && this.mins === other.mins;
    }
}

class Aula {
    //          Time        Time      int  str   str   int     str   'a'   int
    constructor(start_time, end_time, dia, name, type, n_type, info, link, rowspan) {
        this.start_time = start_time;
        this.end_time = end_time;
        this.dia = dia;
        this.name = name;
        this.type = type;
        this.n_type = n_type;
        this.info = info;
        this.link = link;
        this.rowspan = rowspan;
    }

    asString() {
        return `${this.name} [${this.type}.${this.n_type}] (${this.start_time.asString()}-${this.end_time.asString()} ${this.dia}ª)`;
    }
}

class Horario {
    constructor(days_map) {
        this.days_map = days_map;  // Array[int]
        this.dia2 = []; // Array[Aula]
        this.dia3 = [];
        this.dia4 = [];
        this.dia5 = [];
        this.dia6 = [];
        this.dia7 = [];
    }

    asAll() {
        return this.dia2.concat(this.dia3).concat(this.dia4).concat(this.dia5).concat(this.dia6).concat(this.dia7);
    }

    len() {
        return this.asAll().length;
    }
}

function getColumns(dia, horario) {
    let count = 0;
    for (const num of horario.days_map) {
        if (num === dia) {count++}
    }
    return count;
}

function asInt(time) {
    return time.horas * 100 + time.mins;
}

function takeSlot(aula, earliestHour) {
    let y = (aula.start_time.horas - earliestHour) * 2;
    if (aula.start_time.mins) {
        y ++;
    }
    for (const slot of document.querySelectorAll(`.ttslot[data-day="${aula.dia}"][data-y="${y}"]`)) {
        if (!slot.classList.contains("taken")) {
            slot.classList.add("taken");
            slot.innerHTML = `<a class="noAnchor" href="${aula.link}">
                <div class="anchorDiv">
                    <b>${aula.name} [${aula.type}.${aula.n_type}]</b>
                    ${aula.info}
                </div>
            </a>`;
            for (let i = 1; i < aula.rowspan; i++) {
                document.querySelector(`.ttslot[data-x="${slot.dataset.x}"][data-y="${parseInt(slot.dataset.y) + i}"]`).remove();
            }
            slot.setAttribute("rowspan", aula.rowspan);
            break;
        }
    }
}

export function getHorario() {
    let top_tds = Array.from(document.querySelectorAll(".tituloCalendarioColunas")).slice(2, 8);
    let days_map = [];  // [2, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 6]
    for (let i = 2; (i - 2) < top_tds.length; i++) {
        const td = top_tds[i - 2];
        
        let colspan = parseInt(td.getAttribute("colspan"));
        for (let n = 0; n < colspan; n++) {
            days_map.push(i);
        }
    }

    let horario_unprocessed = document.querySelectorAll("tr[valign='center']");
    let horario = new Horario(days_map);
    let map = {
        2: horario.dia2,
        3: horario.dia3,
        4: horario.dia4,
        5: horario.dia5,
        6: horario.dia6,
        7: horario.dia7,
    };
    let hrs = 7;
    let mins;
    for (let i = 0; i < horario_unprocessed.length; i++) {
        const row = horario_unprocessed[i];

        if (i % 2 === 0) {
            mins = 0;
            hrs ++;
        } else {
            mins = 30
        }
        let start_time = new Time(hrs, mins);

        let table_data_ = Array.from(row.querySelectorAll("td")).slice(0, -1); //--------------?
        let dia_counter = 0;
        let horario_temp = new Horario(days_map);
        let temp_map = {
            2: horario_temp.dia2,
            3: horario_temp.dia3,
            4: horario_temp.dia4,
            5: horario_temp.dia5,
            6: horario_temp.dia6,
            7: horario_temp.dia7,
        };
        for (const data of table_data_) {
            const data_class_ = data.classList[0];
            if (data_class_.startsWith("titulo")) {
                continue;
            }

            let dia;
            while_: while (true) {
                dia = days_map[dia_counter];
                for (const aula_ of map[dia]) {
                    let horario_temp_dia = temp_map[dia];
                    if (start_time.in(aula_) && !horario_temp_dia.includes(aula_)) {
                        horario_temp_dia.push(aula_);
                        dia_counter ++;
                    }
                }
                
                if (dia == days_map[dia_counter]) {
                    break while_;
                } else if (dia == 7 && dia_counter >= days_map.length) {
                    break while_;
                }
            }

            if (data_class_.startsWith("celulaSimplesDeCalendario")) {
                dia_counter ++;
            } else {  // startswith("turno")
                let size = parseInt(data.getAttribute("rowspan"));
                let end_time;
                if (!mins) {
                    if (size % 2 === 0) {
                        end_time = new Time(start_time.horas + Math.floor(size / 2), 0);
                    } else {
                        end_time = new Time(start_time.horas + Math.floor(size / 2), 30);
                    }
                } else {
                    if (size % 2 === 0) {
                        end_time = new Time(start_time.horas + Math.round(size / 2), 30);
                    } else {
                        end_time = new Time(start_time.horas + Math.round(size / 2), 0);
                    }
                }
                let link = data.querySelector("a")
                let linkText = link.text;
                let split = linkText.split(".");
                let infoTurno = data.textContent.substring(data.textContent.indexOf(linkText) + linkText.length);
                let aula = new Aula(
                    start_time,
                    end_time,
                    dia,
                    data.querySelector("b").textContent,
                    split[0],
                    parseInt(split[1]),
                    infoTurno,
                    link,
                    size
                );
                
                map[dia].push(aula);
                temp_map[dia].push(aula);
                dia_counter ++;
            }
        }
    }
    return horario;
}

export function drawHorario(horario) {
    let dias = `<tr class="dias">
        <td class="tttime"></td>
        <td class="ttday" colspan="${getColumns(2, horario)}">Segunda</td>
        <td class="ttday" colspan="${getColumns(3, horario)}">Terça</td>
        <td class="ttday" colspan="${getColumns(4, horario)}">Quarta</td>
        <td class="ttday" colspan="${getColumns(5, horario)}">Quinta</td>
        <td class="ttday" colspan="${getColumns(6, horario)}">Sexta</td>
        <td class="ttday" colspan="${getColumns(7, horario)}">Sábado</td>
    </tr>`;

    let diasHorario = [horario.dia2, horario.dia3, horario.dia4, horario.dia5, horario.dia6, horario.dia7];
    let earliestTime;
    let latestTime;
    for (const dia of diasHorario) {
        for (const aula of dia) {
            if ((earliestTime == undefined) || (earliestTime.asInteger() > asInt(aula.start_time))) {
                earliestTime = new Time(aula.start_time.horas, 0);
            }
            if ((latestTime == undefined) || (latestTime.asInteger() < asInt(aula.end_time))) {
                if (aula.end_time.mins) {
                    latestTime = new Time(aula.end_time.horas + 1, 0);
                } else {
                    latestTime = new Time(aula.end_time.horas, 0);
                }
            }
        }
    }
    let rows = [];
    let toMinutes = (time) => {return time.horas * 60 + time.mins}
    for (let time = toMinutes(earliestTime); time < toMinutes(latestTime); time += 30) {
        let quociente = parseInt(time / 60);
        let resto = parseInt(time % 60);

        let tds = "";
        for (let i = 0; i < horario.days_map.length; i++) {
            tds += `<td class="ttslot" data-day="${horario.days_map[i]}" data-x="${i}" data-y="${rows.length}"></td>`
            // (x,y) = (column, row)
        }

        if (resto == 0) {
            rows.push(`
            <tr class="ttrow" data-time="${quociente * 100 + resto}">
                <td class="tttime" rowspan="1">${quociente}:00<div></div></td>

                ${tds}
            </tr>
            `);
        } else {
            rows.push(`
            <tr class="ttrow" data-time="${quociente * 100 + resto}">
                <td class="tttime" id="del_"></td>

                ${tds}
            </tr>
            `);
        }
    }
    
    document.querySelector(".horario-super").insertAdjacentHTML('beforeend', `<table class="horario-table">
    <tbody>
        ${dias}
        ${rows.join("")}
    </tbody>
    </table>
    `);

    for (const dia of diasHorario) {
        for (const aula of dia) {
            takeSlot(aula, earliestTime.horas);
        }
    }

    for (const slot of document.querySelectorAll(".ttslot")) {
        if (!slot.classList.contains("taken") && slot.dataset.y % 2 === 0) {
            const slot2 = document.querySelector(`.ttslot[data-x="${slot.dataset.x}"][data-y="${parseInt(slot.dataset.y) + 1}"]`);
            if (slot2 && !slot2.classList.contains("taken")) {
                slot.setAttribute("rowspan", 2);
                slot2.remove();
            }
        }
    }

    // if nothing on saturdays: delete saturday
    if (horario.dia7.length == 0) {
        for (let el of document.querySelectorAll("td:last-of-type")) {
            if ((el.classList.contains("ttday")) || (el.dataset.day == 7)) {
                el.remove()
            }
        }
    }
}