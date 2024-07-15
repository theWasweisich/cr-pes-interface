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
var crepes_selected = false;
/**
 * The handler is used to update the Save Button
 * as soon as the send_to_server_list is changed
 */
const handler = {
    set(target, prop, value, receiver) {
        check_if_need_to_speichern();
        return Reflect.set(target, prop, value, receiver);
    },
    get(target, prop, receiver) {
        const value = Reflect.get(target, prop, receiver);
        if (typeof value === 'object' && value !== null) {
            return new Proxy(value, handler);
        }
        return value;
    }
};
let send_to_server_list = {
    new: new Array(),
    edit: new Array(),
    delete: new Array(),
};
/** The monitor is used to change the save button state */
const send_to_server_list_with_monitor = new Proxy(send_to_server_list, handler);
/**
 * Clears the list of crepelist and then re-populates it with newly fetched crepes
 */
function getCurrentCrepes() {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield send_server(urls.getcrepes, "GET");
        const crêpes = yield res.json();
        // crepelist.length = 0
        while (crepelist.length > 0) {
            crepelist.pop();
        }
        for (var i = 0; i < (yield crêpes.length); i++) {
            let crêpe = yield crêpes[i];
            let crepe_id = crêpe["id"];
            let crepe_name = crêpe["name"];
            let crepe_price = crêpe["price"];
            let crepe_type = crêpe["type"];
            var new_crêpe = new Crêpe(crepe_id, crepe_name, crepe_price, 0, crepe_type);
            crepelist.push(new_crêpe);
        }
        console.assert(crepelist.length == crêpes.length, "Hoppala");
        populateCrêpesList();
        /**
         * Populates the Crepes Elements using the variable crepelist
         */
        function populateCrêpesList() {
            const toAppendTo = document.getElementById("crepes_list");
            const template = document.getElementById("crepeslist_tmpl");
            function delete_current_crepes() {
                let to_delete = toAppendTo.children;
                for (let i = 0; i < to_delete.length; i++) {
                    to_delete[i].parentNode.removeChild(to_delete[0]);
                }
                if (toAppendTo.children.length !== 0) {
                    delete_current_crepes();
                }
            }
            function get_max_crepeId() {
                let max_crepeId = -1;
                for (let i = 0; i < crepelist.length; i++) {
                    if (crepelist[i].crepeId > max_crepeId) {
                        max_crepeId = crepelist[i].crepeId;
                    }
                }
                return max_crepeId;
            }
            crepelist.sort((a, b) => {
                if (a.crepeId > a.crepeId) {
                    return 1;
                }
                else {
                    return -1;
                }
            });
            delete_current_crepes();
            for (let i = 0; i < crepelist.length; i++) {
                let crepe = crepelist[i];
                if (i === 0 && crepe.name !== "Zimt & Zucker") {
                    console.error("Wasn hier los?");
                }
                let elem_copy = template.content.cloneNode(true);
                // attributes on .crepe_container: data-id data-name data-preis data-type
                let crepe_container = elem_copy.querySelector("div.crepe_container");
                crepe_container.setAttribute("data-id", String(crepe.crepeId));
                crepe_container.setAttribute("data-name", String(crepe.name));
                crepe_container.setAttribute("data-price", String(crepe.price));
                crepe_container.setAttribute("data-type", String(crepe.type));
                crepe_container.querySelector(".crepe-name").innerText = String(crepe.name);
                crepe_container.querySelector(".crepe-price").innerText = currency_formatter.format(crepe.price);
                toAppendTo.appendChild(elem_copy);
                crepelist[i].root_element = crepe_container;
            }
        }
    });
}
/**
 * Opens the edit dialog and attaches the {@link handleEditCommit} function
 * @param crepe The crepe that needs to be edited
 */
function edit_crepe_dialog_function(crepe) {
    const crepeNameInput = document.getElementById("edit_crepe_name");
    const crepePriceInput = document.getElementById("edit_crepe_price");
    const crepeTypeInput = document.getElementById("edit_crepe_type");
    const commitButton = document.getElementById("edit_crepe_save");
    const deleteButton = document.getElementById("edit_crepe_delete");
    const dialog = document.getElementById("edit_crepe_dialog");
    crepeNameInput.value = crepe.name;
    crepePriceInput.value = currency_formatter.format(crepe.price);
    crepeTypeInput.querySelector(`[value="${crepe.type}"]`).setAttribute("selected", "");
    commitButton.addEventListener('click', () => {
        handleEditCommit(crepe.crepeId);
    });
    deleteButton.addEventListener('click', () => {
        handleDeleteCommit(crepe.crepeId);
    });
    if (!dialog.open) {
        dialog.showModal();
    }
    dialog.addEventListener('click', function (event) {
        if (event.target.id === "edit_crepe_dialog") {
            dialog.close();
        }
    });
}
function editButtonFunc(btnElement) {
    const crepe_container = btnElement.parentElement.parentElement;
    const crepeId = Number(crepe_container.getAttribute("data-id"));
    let crepe_edit;
    for (const crepe of crepelist) {
        if (crepe.crepeId == crepeId) {
            crepe_edit = crepe;
            break;
        }
    }
    console.log(`Editing: "${crepe_edit.name}"`);
    edit_crepe_dialog_function(crepe_edit);
}
function get_crepe_by_id(id) {
    for (const crepe of crepelist) {
        if (crepe.crepeId === id) {
            return crepe;
        }
    }
}
function get_crepe_index_by_id(id) {
    for (const [index, crepe] of crepelist.entries()) {
        if (crepe.crepeId == id) {
            return index;
        }
    }
}
/**
 * Function called when the "Bearbeitung abschließen" Button is pressed
 * @param crepeId the crepeId of the crêpes being edited
 */
function handleEditCommit(crepeId) {
    const dialog = document.getElementById("edit_crepe_dialog");
    const crepeNameInput = document.getElementById("edit_crepe_name");
    const crepePriceInput = document.getElementById("edit_crepe_price");
    const crepeTypeInput = document.getElementById("edit_crepe_type");
    const commitButton = document.getElementById("edit_crepe_save");
    let new_price = crepePriceInput.value
        .replace(/[^\d,]+/, "") // Removes everything but numerics and commas
        .replace(/[,]/, "."); // Replaces comma with  dot => Should be a valid number now :)
    let new_name = crepeNameInput.value;
    let new_type = crepeTypeInput.options[crepeTypeInput.selectedIndex].value;
    if (Number.isNaN(new_price) || new_price === "") {
        crepePriceInput.setCustomValidity("Kein gültiger Preis!");
        crepePriceInput.reportValidity();
        return;
    }
    let new_price_number = Number(new_price);
    let crêpe = get_crepe_by_id(crepeId);
    let has_been_edited = {
        price: false,
        name: false,
        type: false
    };
    if (new_price_number !== crêpe.price) {
        has_been_edited.price = true;
    }
    if (new_name !== crêpe.name) {
        has_been_edited.name = true;
    }
    if (new_type !== crêpe.type) {
        has_been_edited.type = true;
    }
    if (!has_been_edited.name && !has_been_edited.price && !has_been_edited.type) {
        // Nichts wurde bearbeitet
        console.log("Dialog closed, but nothing was changed!");
        send_feedback_message("Nichts wurde bearbeitet!", 2, "red");
    }
    else {
        let edited_crêpe = new Crêpe(crêpe.crepeId, has_been_edited.name ? new_name : crêpe.name, has_been_edited.price ? new_price_number : crêpe.price, crêpe.amount, has_been_edited.type ? new_type : crêpe.type, crêpe.root_element);
        let to_list = {
            id: edited_crêpe.crepeId,
            name: edited_crêpe.name,
            price: edited_crêpe.price,
            type: edited_crêpe.type
        };
        console.log("to_list: ", to_list);
        send_to_server_list_with_monitor.edit.push(to_list);
        update_crepe_item(edited_crêpe);
    }
    dialog.close();
}
function handleDeleteCommit(crepeId) {
    const dialog = document.getElementById("edit_crepe_dialog");
    const crepe = get_crepe_by_id(crepeId);
    const confirmation = confirm(`Möchten Sie "${crepe.name}" wirklich löschen?`);
    if (confirmation) {
        console.log("User hat akzeptiert");
        const send_to_server_list = {
            id: crepe.crepeId,
            name: crepe.name,
            price: crepe.price,
            type: crepe.type
        };
        send_to_server_list_with_monitor.delete.push(send_to_server_list);
        dialog.close();
    }
    else {
        console.log("User hat abgelehnt");
        dialog.close();
    }
}
function update_crepe_item(crepe) {
    const rootelem = crepe.root_element;
    const elem_name = rootelem.querySelector("h3.crepe-name");
    const elem_price = rootelem.querySelector("h4.crepe-price");
    elem_name.textContent = crepe.name;
    elem_price.textContent = currency_formatter.format(crepe.price);
    rootelem.setAttribute("data-type", crepe.type);
}
/**
 *
 * @param message The message to be sent
 * @param duration The duration the message should last (in Seconds)
 * @param color The color of the message container. CSS valid color value.
 */
function send_feedback_message(message, duration = 2, color) {
    const container = document.getElementById("feedback_message_container");
    const feedback_message = document.getElementById("feedback_message");
    feedback_message.textContent = message;
    container.classList.add("show");
    setTimeout(() => {
        container.classList.remove("show");
    }, duration * 100);
}
/**
 * Function that is called by #save_btn
 * Sends changes to the server and colors the button accordingly
 */
function button_save_changes_to_server() {
    return __awaiter(this, void 0, void 0, function* () {
        var save_btn = document.getElementById('save_btn');
        if (yield save_changes()) {
            save_btn.disabled = false;
            save_btn.style.backgroundColor = "rgba(0, 255, 0, 1);";
            save_btn.innerText = "Gespeichert!";
            setTimeout(() => {
                save_btn.removeAttribute("style"); // resets style
                save_btn.innerText = "Speichern";
                save_btn.disabled = true;
            }, 2000);
        }
    });
}
/**
 * Checks, if crepes_list is empty and if it is, shows the empty elem instead.
*/
function toggle_empty() {
    /**
     * Funktion prüft, ob die Liste mit Crêpes leer ist
     * @returns boolean
     */
    function check_if_empty() {
        return document.getElementById('crepes_list').childElementCount === 0;
    }
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
 * Entfernt crêpes von der liste und fügt sie der send_to_server_list_with_monitor an.
 * @param target Der Löschen Knopf
 */
function delte_crepe(target) {
    var root = target.parentElement.parentElement.parentElement;
    if (!root.classList.contains("crepe_container")) {
        console.group("Error");
        console.error("FATAL ERROR. Function: delete_crepe");
        console.info(root);
        console.groupEnd();
    }
    var crepename = root.getAttribute('data-name');
    root.remove();
    toggle_empty();
    var id = Number(root.getAttribute("data-id"));
    send_to_server_list_with_monitor.delete.push({ id: id, name: crepename });
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
function editCrepe(crepe_id) {
    let crepe_to_edit;
    for (const [index, crepe] of crepelist.entries()) {
        if (crepe.crepeId === crepe_id) {
        }
    }
}
function create_crepe() {
    let name = document.getElementById('crepeName');
    let price = document.getElementById('price');
    let ingredients = document.getElementById('ingredients');
    let color = document.getElementById('color');
    let form = document.getElementById("newForm");
    var crepe_data = {
        name: name.value,
        price: Number(price.value),
        ingredients: ingredients.value,
        type: color.value
    };
    send_to_server_list_with_monitor.new.push(crepe_data);
    form.classList.add("success");
    setTimeout(() => {
        form.classList.remove("success");
    }, 250);
    color.selectedIndex = 0;
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
                var response = yield send_server(urls.delCrepe, "DELETE", send_to_server_list_with_monitor.delete);
                var text = yield response.text();
                if (response.ok) {
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
                var response = yield send_server(urls.editCrepe, "PATCH", send_to_server_list_with_monitor.edit);
                var text = yield response.text();
                if (response.ok) {
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
                var response = yield send_server(urls.newCrepe, "PUT", send_to_server_list_with_monitor.new);
                var text = yield response.text();
                if (response.ok) {
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
        if (send_to_server_list_with_monitor.new.length >= 1) {
            return_value = true;
            send_new();
        }
        if (send_to_server_list_with_monitor.edit.length >= 1) {
            return_value = true;
            send_edit();
        }
        if (send_to_server_list_with_monitor.delete.length >= 1) {
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
        console.warn(send_to_server_list_with_monitor);
        const res = yield send_settings_to_server();
        if (res) {
            send_to_server_list_with_monitor.delete = [];
            send_to_server_list_with_monitor.edit = [];
            send_to_server_list_with_monitor.new = [];
            changes_saved(true);
            getCurrentCrepes();
            return true;
        }
        else {
            changes_saved(false);
            getCurrentCrepes();
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
/**
 * Function checks if the user needs to save changes.
 * @returns true, if there are unsaved-changes
 * @returns false, if there are no unsaved-changes
 */
function check_if_need_to_speichern() {
    /**
     * Checks if send_to_server_list_with_monitor is empty
     */
    function is_all_empty() {
        return (send_to_server_list_with_monitor.delete.length == 0 && send_to_server_list_with_monitor.edit.length == 0 && send_to_server_list_with_monitor.new.length == 0);
    }
    let btn = document.getElementById('save_btn');
    const empty = is_all_empty();
    if (empty) {
        btn.style.filter = "brightness(50%);";
        btn.style.backgroundColor = "rgb(120, 120, 120)";
        window.onbeforeunload = () => { };
        btn.disabled = true;
        return false;
    }
    else {
        btn.style.filter = "brightness(1);";
        btn.style.backgroundColor = "rgb(0, 133, 35)";
        btn.disabled = false;
        window.onbeforeunload = (ev) => { ev.preventDefault(); };
        return true;
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
    }
    else {
        elem.checkValidity();
        marker.style.display = "none";
        container.setAttribute("was_edited", "false");
    }
    check_if_need_to_speichern();
}
function validate_all() {
    var elems = document.getElementsByTagName("input");
    for (let elem of Object(elems)) {
        validate_input(elem);
    }
}
/**
 * Validates set crepe and reports the validity afterwards
 * @param elem The Input crepe to check against
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
    send_to_server_list_with_monitor.edit = [];
    for (let i = 0; i < crepes.length; i++) {
        const crepe = crepes[i];
        var name_input = crepe.querySelector('input[name="Crêpes Name"]');
        var price_input = crepe.querySelector('input[name="Crêpes Preis"]');
        if (crepe.getAttribute("was_edited") == "true") {
            var id = Number(crepe.getAttribute("data-id"));
            var name = name_input.value;
            var price = Number(price_input.value);
            let to_list = {
                id: id,
                name: name,
                price: price
            };
            send_to_server_list_with_monitor.edit.push(to_list);
        }
    }
    ;
}
