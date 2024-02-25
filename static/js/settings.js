// Imported: formatter, set_data, Crêpes2, crepelist from global
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Some useful Variables
var need_to_speichern = false;
var crepes_selected = false;
window.onbeforeunload = function () {
    if (need_to_speichern) {
        return "U SURE?";
    }
    else
        return;
};
let send_to_server_list = {
    new: new Array,
    edit: new Array,
    delete: new Array
};
function getCurrentCrepes() {
    return __awaiter(this, void 0, void 0, function* () {
        var res = yield send_server(urls.getcrepes, "GET");
        var crêpes = yield res.json();
        crepelist.length = 0;
        for (var i = 0; i < (yield crêpes.length); i++) {
            let crêpe = yield crêpes[i];
            var new_crêpe = new Crêpe(crêpe["id"], crêpe["name"], crêpe["price"], 0, crêpe["colour"]);
            crepelist.push(new_crêpe);
        }
        populateCrêpesList();
    });
}
function populateCrêpesList() {
    const toAppendTo = document.getElementById("crepes_list");
    const templ = document.getElementById("crepeslist_tmpl");
    for (let i = 0; i < crepelist.length; i++) {
        let crepe = crepelist[i];
        let htmlString = templ.innerHTML;
        htmlString = htmlString.replace(/!! ID !!/g, String(crepe.crepeId));
        htmlString = htmlString.replace(/!! NAME !!/g, crepe.name);
        htmlString = htmlString.replace(/!! PRICE !!/g, String(crepe.preis));
        htmlString = htmlString.replace(/!! PRICE_STR !!/g, formatter.format(crepe.preis));
        htmlString = htmlString.replace(/!! COLOUR !!/g, crepe.color);
        let newElem = document.createElement("div");
        newElem.innerHTML = htmlString;
        var elem = toAppendTo.appendChild(newElem);
        elem.querySelector('input[name="Crêpes Preis"]').value = formatter.format(crepe.preis);
    }
}
function set_settings_up() {
    if (crepelist.length == 0) {
        var list = document.getElementById("crepes_list");
        var elems = list.querySelectorAll(".crepe_container");
        for (let i = 0; i < elems.length; i++) {
            const crepe = elems[i];
            var id = crepe.getAttribute("data-id");
            var name = crepe.getAttribute("data-name");
            var price = crepe.getAttribute('data-price');
            var preis = crepe.querySelector('input[name="Crêpes Preis"]');
            var preis_machine_value = preis.getAttribute("data-value");
            var preis_human_value = formatter.format(preis_machine_value);
            preis.setAttribute("value", preis_human_value);
            preis.setAttribute("placeholder", preis_human_value);
            crepelist.push(new Crêpe(Number(id), name, price, 0, null, crepe));
        }
    }
}
function prepare_loader() {
    const button = document.getElementById('save_btn');
    const text = document.getElementById('save_text');
    const loader = document.getElementById('loader');
    button.addEventListener("mouseenter", () => {
        text.style.display = "none";
        loader.style.display = "block";
    });
    button.addEventListener("mouseout", () => {
        text.style.display = "block";
        loader.style.display = "none";
    });
}
getCurrentCrepes().then(() => {
    set_settings_up();
    prepare_loader();
});
/**
 * Function that is called by #save_btn
 */
function button_save_changes_to_server() {
    return __awaiter(this, void 0, void 0, function* () {
        var save_btn = document.getElementById('save_btn');
        if (yield save_changes()) {
            save_btn.style.backgroundColor = "rgba(0, 255, 0, 1);";
            save_btn.innerText = "Gespeichert!";
            setTimeout(() => {
                save_btn.style.backgroundColor = "auto;";
                save_btn.innerText = "Speichern";
            }, 2000);
        }
    });
}
function change_selected() {
    var select_elem = document.getElementById('color');
    var selected_color = select_elem.value;
    select_elem.style.backgroundColor = selected_color;
}
/**
 * Funktion prüft, ob die Liste mit Crêpes leer ist
 */
function check_if_empty() {
    if (document.getElementById('crepes_list').childElementCount == 0) {
        return true;
    }
    else {
        return false;
    }
}
/**
 * Checks, if crepes_list is empty and if it is, shows the empty elem instead.
 */
function toggle_empty() {
    var error_elem = document.getElementById('no_crepes');
    var list_elem = document.getElementById('crepes_list');
    if (check_if_empty()) {
        list_elem.style.display = "none";
        error_elem.style.display = "block";
    }
    else {
        list_elem.style.display = "block";
        error_elem.style.display = "none";
    }
}
/**
 * Entfernt crêpes von der liste und fügt sie der send_to_server_list an.
 * @param target Der Löschen Knopf
 */
function delte_crepe(target) {
    var root = target.parentElement.parentElement.parentElement;
    if (!('crepe_container' in root.classList)) {
        console.group("Error");
        console.error("FATAL ERROR. Function: delete_crepe");
        console.info(root);
        console.groupEnd();
    }
    var crepename = root.getAttribute('data-name');
    root.remove();
    toggle_empty();
    var id = root.getAttribute("data-id");
    send_to_server_list.delete.push({
        "id": id,
        "name": crepename
    });
    need_to_speichern = true;
    check_if_need_to_speichern();
}
function loadCrepe(elem, crepes_data) {
    var crepes_id = document.getElementById('editID');
    var crepes_name = document.getElementById('editCrepeName');
    var crepes_price = document.getElementById('editPrice');
    var crepes_ingredients = document.getElementById('editIngredients');
    if (elem.value == "select") {
        crepes_id.value, crepes_name.value, crepes_price.value, crepes_ingredients.value = "";
        crepes_selected = false;
        return;
    }
    var crêpes_name = elem.value;
    crepes_data.forEach(crepes => {
        if (crepes.name == crêpes_name) {
            crepes_id.value = crepes['id'];
            crepes_name.value = crepes['name'];
            crepes_price.value = crepes['price'];
            crepes_ingredients.value = crepes['ingredients'];
            return;
        }
    });
    crepes_selected = true;
}
function editCrepe() {
}
function create_crepe() {
    let name = document.getElementById('crepeName');
    let price = document.getElementById('price');
    let ingredients = document.getElementById('ingredients');
    let color = document.getElementById('color');
    let sumitter = document.getElementById("newSubmit");
    let form = document.getElementById("newForm");
    var crepe_data = {
        // @ts-expect-error
        "name": name.value,
        // @ts-expect-error
        "price": price.value,
        // @ts-expect-error
        "ingredients": ingredients.value,
        // @ts-expect-error
        "color": color.value
    };
    send_to_server_list.new.push(crepe_data);
    need_to_speichern = true;
    check_if_need_to_speichern();
    console.log("Crêpes Created!");
    form.classList.add("success");
    setTimeout(() => {
        form.classList.remove("success");
    }, 250);
    form.reset();
    return;
}
/**
 *
 */
function send_settings_to_server() {
    return __awaiter(this, void 0, void 0, function* () {
        function send_delete() {
            return __awaiter(this, void 0, void 0, function* () {
                var response = yield send_server(urls.delCrepe, "DELETE", send_to_server_list.delete);
                var text = yield response.text();
                if (response.ok) {
                    need_to_speichern = false;
                    console.log(text);
                    return true;
                }
                else {
                    console.warn(text);
                    return false;
                }
            });
        }
        function send_edit() {
            return __awaiter(this, void 0, void 0, function* () {
                var response = yield send_server(urls.editCrepe, "PATCH", send_to_server_list.edit);
                var text = yield response.text();
                if (response.ok) {
                    need_to_speichern = false;
                    console.log(text);
                    return true;
                }
                else {
                    console.warn(text);
                    return false;
                }
            });
        }
        ;
        function send_new() {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Send new!");
                var response = yield send_server(urls.newCrepe, "PUT", send_to_server_list.new);
                var text = yield response.text();
                if (response.ok) {
                    need_to_speichern = false;
                    console.groupCollapsed("Gespeichert");
                    console.log(text);
                    console.groupEnd();
                    return true;
                }
                else {
                    console.warn("Fehler: ");
                    console.warn(text);
                    return false;
                }
            });
        }
        ;
        var return_value = false;
        if (send_to_server_list.new.length >= 1) {
            return_value = true;
            send_new();
        }
        if (send_to_server_list.edit.length >= 1) {
            return_value = true;
            send_edit();
        }
        if (send_to_server_list.delete.length >= 1) {
            return_value = true;
            send_delete();
        }
        return return_value;
    });
}
/**
 * Sendet alles an den Server
 *
 * **Letzte funktion, die das Senden verhindern kann**
 */
function save_changes() {
    return __awaiter(this, void 0, void 0, function* () {
        console.warn("Folgendes wird versandt: ");
        console.warn(send_to_server_list);
        const res = yield send_settings_to_server();
        if (res) {
            setTimeout(function () {
                location.reload();
            }, 3500);
            changes_saved(true);
            return true;
        }
        else {
            changes_saved(false);
            return false;
        }
        /**
         * Takes around 3000 ms
         * @param status If saving was successfull or not
         */
        function changes_saved(status) {
            var elem = document.getElementById("feedback_message_container");
            var elem_txt = elem.children[0];
            if (status) {
                elem.style.backgroundColor = "green";
                elem_txt.innerHTML = "Erfolgreich gespeichert";
            }
            else {
                elem.style.backgroundColor = "red";
                elem_txt.innerHTML = "Fehler beim Speichern";
            }
            animation_in();
            setTimeout(animation_out, 2000);
            function animation_in() {
                const Anim = new KeyframeEffect(elem, [{ opacity: "1", top: "15px" }], { duration: 500, fill: "forwards" });
                new Animation(Anim, document.timeline).play();
            }
            function animation_out() {
                const Anim = new KeyframeEffect(elem, [{ opacity: "0", top: "0" }], { duration: 500, fill: "forwards" });
                new Animation(Anim, document.timeline).play();
            }
        }
    });
}
function check_if_need_to_speichern() {
    /**
     * Checks if send_to_server_list is empty
     */
    function is_all_empty() {
        if (send_to_server_list.delete.length != 0 && send_to_server_list.edit.length != 0 && send_to_server_list.new.length != 0) {
            return true;
        }
        else {
            return false;
        }
    }
    var btn = document.getElementById('save_btn');
    if (is_all_empty()) {
        need_to_speichern = false;
        btn.style.backgroundColor = "rgb(120, 120, 120)";
    }
    else {
        need_to_speichern = true;
        btn.style.backgroundColor = "rgb(0, 133, 35)";
    }
}
function input_changed(elem) {
    var container = elem.parentElement;
    var marker = container.getElementsByClassName("edited_hint")[0];
    elem.addEventListener("focusout", () => {
        if (elem.value != elem.defaultValue) {
        }
        else {
        }
        ;
    }, { once: true });
    elem.addEventListener("oninput", () => {
        validate_input(elem);
    });
    if (elem.value != elem.defaultValue) {
        elem.checkValidity();
        container.setAttribute("was_edited", "true");
        marker.style.display = "block";
        need_to_speichern = true;
        check_if_need_to_speichern();
    }
    else {
        elem.checkValidity();
        marker.style.display = "none";
        container.setAttribute("was_edited", "false");
        need_to_speichern = true;
        check_if_need_to_speichern();
    }
}
function validate_all() {
    var elems = document.getElementsByTagName("input");
    for (let elem of Object(elems)) {
        validate_input(elem);
    }
}
/**
 * Validates set element and reports the validity afterwards
 * @param elem The Input element to check against
 */
function validate_input(elem) {
    const validity = elem.validity;
    const value = elem.value;
    if (validity.patternMismatch) {
        elem.setCustomValidity("Nee, das passt noch ned so ganz");
    }
    else if (validity.valueMissing) {
        elem.setCustomValidity("Ey, da muss schon was stehen!");
    }
    else if (validity.valid) {
        elem.setCustomValidity("");
    }
    elem.reportValidity();
}
/**
 * Made to be called just before sending to server
 */
function check_for_edits() {
    console.log("Check'in for edits");
    var list = document.getElementById("crepes_list");
    var crepes = list.getElementsByClassName("crepe_container");
    send_to_server_list.edit = [];
    for (let i = 0; i < crepes.length; i++) {
        const crepe = crepes[i];
        var name_input = crepe.querySelector('input[name="Crêpes Name"]');
        var price_input = crepe.querySelector('input[name="Crêpes Preis"]');
        if (crepe.getAttribute("was_edited") == "true") {
            var id = crepe.getAttribute("data-id");
            var name = name_input.value;
            var price = price_input.value;
            send_to_server_list.edit.push({
                "id": id,
                "name": name,
                "price": price
            });
            need_to_speichern = true;
            check_if_need_to_speichern();
        }
    }
    ;
}
check_if_need_to_speichern();
