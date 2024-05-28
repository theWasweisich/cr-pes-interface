// Imported: formatter, set_data, Crêpes2, crepelist from global

// Some useful Variables
var crepes_selected = false;

document.addEventListener("onbeforeunload", function () {
    if ((send_to_server_list.delete.length > 0) || (send_to_server_list.edit.length > 0) || (send_to_server_list.new.length > 0)) {
        event.preventDefault();
    }    
})


let send_to_server_list = {
    new: new Array,
    edit: new Array,
    delete: new Array,
};

/**
 * Clears the list of crepes and then re-populates it with newly fetched crepes
 */
async function getCurrentCrepes() {
    const res = await send_server(urls.getcrepes, "GET")

    const crêpes = await res.json()

    crepelist.length = 0

    for (var i = 0; i < await crêpes.length; i++) {
        let crêpe = await crêpes[i];

        let crepe_id = crêpe["id"];
        let crepe_name = crêpe["name"];
        let crepe_price = crêpe["price"];
        let crepe_type  = crêpe["type"];

        var new_crêpe = new Crêpe(crepe_id, crepe_name, crepe_price, 0, crepe_type)
        crepelist.push(new_crêpe)

    }
    populateCrêpesList(crepelist);

    /**
     * Populates the Crepes Elements using the variable crepelist
     */
    function populateCrêpesList(list: Crêpe[]) {
        const toAppendTo = document.getElementById("crepes_list")
        const template = document.getElementById("crepeslist_tmpl") as HTMLTemplateElement;

        function delete_current_crepes() {
            let to_delete = (toAppendTo.children as HTMLCollectionOf<HTMLDivElement>)
            for (let i = 0; i < to_delete.length; i++) {
                to_delete[i].remove();
            }
        }


        delete_current_crepes();

        for (let i = 0; i < list.length; i++) {
            let crepe = list[i];
            
            let elem_copy = template.content.cloneNode(true) as HTMLDivElement;

            // attributes on .crepe_container: data-id data-name data-preis data-type
            let crepe_container = elem_copy.querySelector("div.crepe_container") as HTMLDivElement;
            crepe_container.setAttribute("data-id", String(crepe.crepeId))
            crepe_container.setAttribute("data-name", String(crepe.name))
            crepe_container.setAttribute("data-price", String(crepe.price))
            crepe_container.setAttribute("data-type", String(crepe.type));

            (crepe_container.querySelector(".crepe-name") as HTMLElement).innerText = String(crepe.name);
            (crepe_container.querySelector(".crepe-price") as HTMLElement).innerText = currency_formatter.format(crepe.price);
            
            toAppendTo.appendChild(elem_copy);
        }
    }
}

function editButtonFunc(btnElement: HTMLButtonElement) {
    const crepe_container = btnElement.parentElement.parentElement as HTMLDivElement
    const dialog = document.getElementById("edit_crepe_dialog") as HTMLDialogElement;
    const crepeId = Number(crepe_container.getAttribute("data-id"))
    
    const crepeNameInput = document.getElementById("edit_crepe_name") as HTMLInputElement;
    const crepePriceInput = document.getElementById("edit_crepe_price") as HTMLInputElement;
    const crepeTypeInput = document.getElementById("edit_crepe_type") as HTMLSelectElement;
    const commitButton = document.getElementById("edit_crepe_save") as HTMLButtonElement;
    
    let crepe_edit: Crêpe;
    let index_exit: number;


    crepelist.some(crepe => {
        if (crepe.crepeId === crepeId) {
            index_exit = crepelist.indexOf(crepe);
            crepe_edit = crepe;
            return true;
        }
    });

    crepeNameInput.value = crepe_edit.name;
    crepePriceInput.value = currency_formatter.format(crepe_edit.price);
    crepeTypeInput.querySelector(`[value="${crepe_edit.type}"]`).setAttribute("selected", "");

    commitButton.addEventListener('click', () => {
        handleEditCommit(index_exit);
    })

    if (!dialog.open) {
        dialog.showModal();
    }

    dialog.addEventListener('click', function (event: MouseEvent) {
        if ((event.target as HTMLElement).id === "edit_crepe_dialog") {
            dialog.close();
        }
    });
}

function handleEditCommit(index_of_crepe: number) {
    const dialog = document.getElementById("edit_crepe_dialog") as HTMLDialogElement;

    const crepeNameInput = document.getElementById("edit_crepe_name") as HTMLInputElement;
    const crepePriceInput = document.getElementById("edit_crepe_price") as HTMLInputElement;
    const crepeTypeInput = document.getElementById("edit_crepe_type") as HTMLSelectElement;
    const commitButton = document.getElementById("edit_crepe_save") as HTMLButtonElement;

    let new_price = crepePriceInput.value
        .replace(/[^\d,]+/, "")     // Removes everything but numerics and commas
        .replace(/[,]/, ".");       // Replaces comma with  dot => Should be a valid number now :)
    let new_name = crepeNameInput.value
    let new_type = crepeTypeInput.options[crepeTypeInput.selectedIndex].value;

    if (Number.isNaN(new_price) || new_price === "") {
        crepePriceInput.setCustomValidity("Kein gültiger Preis!");
        crepePriceInput.reportValidity();
        return;
    }
    let new_price_number: number = Number(new_price);

    console.log(`Editation: Price: ${new_price}; Numeric_Price: ${new_price_number}; Name: ${new_name}; Type: ${new_type}`);

    let crêpe = crepelist[index_of_crepe];

    let has_been_edited = {
        price: false,
        name: false,
        type: false
    }

    if (new_price_number !== crêpe.price) { has_been_edited.price = true; } 
    if (new_name !== crêpe.name) { has_been_edited.name = true; } 
    if (new_type !== crêpe.type) { has_been_edited.type = true; }
    
    if (!has_been_edited.name && !has_been_edited.price && !has_been_edited.type) {
        // Nichts wurde bearbeitet
        send_feedback_message("Nichts wurde bearbeitet!", 2, "red")
    }

    dialog.close();
}

/**
 * 
 * @param message The message to be sent
 * @param duration The duration the message should last (in Seconds)
 * @param color The color of the message container. CSS valid color value.
 */
function send_feedback_message(message: string, duration: number = 2, color: string) {
    const container = document.getElementById("feedback_message_container") as HTMLDivElement;
    const feedback_message = document.getElementById("feedback_message") as HTMLParagraphElement;

    feedback_message.innerText = message;
    container.classList.add("show")
    setTimeout(() => {
        container.classList.remove("show")
    }, duration * 100);
}

/**
 * Function that is called by #save_btn
 * Sends changes to the server and colors the button accordingly
 */
async function button_save_changes_to_server() {

    var save_btn = document.getElementById('save_btn')

    if (await save_changes()) {
        save_btn.style.backgroundColor = "rgba(0, 255, 0, 1);";
        save_btn.innerText = "Gespeichert!";
        setTimeout(() => {
            save_btn.style.backgroundColor = "auto;";
            save_btn.innerText = "Speichern";
        }, 2000)
    }
}

/**
 * Funktion prüft, ob die Liste mit Crêpes leer ist
 * @returns boolean
 */
function check_if_empty() {
    if (document.getElementById('crepes_list').childElementCount == 0) {
        return true;
    } else {
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
    } else {
        list_elem.style.display = "block";
        error_elem.style.display = "none";
    }
}

/**
 * Entfernt crêpes von der liste und fügt sie der send_to_server_list an.
 * @param target Der Löschen Knopf
 */
function delte_crepe(target: HTMLElement) {
    var root = target.parentElement.parentElement.parentElement;
    if (!root.classList.contains("crepe_container")) {
        console.group("Error")
        console.error("FATAL ERROR. Function: delete_crepe")
        console.info(root)
        console.groupEnd()
    }
    var crepename = root.getAttribute('data-name');
    root.remove();
    toggle_empty();
    var id = root.getAttribute("data-id")
    send_to_server_list.delete.push({
        "id": id,
        "name": crepename
    });
    check_if_need_to_speichern();
}


function loadCrepe(elem: HTMLSelectElement, crepes_data: Array<any>) {
    var crepes_id = document.getElementById('editID') as HTMLInputElement;
    var crepes_name = document.getElementById('editCrepeName') as HTMLInputElement;
    var crepes_price = document.getElementById('editPrice') as HTMLInputElement;
    var crepes_ingredients = document.getElementById('editIngredients') as HTMLInputElement;

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

function create_crepe(): boolean {
    let name = document.getElementById('crepeName') as HTMLInputElement;
    let price = document.getElementById('price') as HTMLInputElement;
    let ingredients = document.getElementById('ingredients') as HTMLInputElement;
    let color = document.getElementById('color') as HTMLSelectElement;
    let form = document.getElementById("newForm") as HTMLFormElement;
    
    var crepe_data = {
        "name": name.value,
        "price": price.value,
        "ingredients": ingredients.value,
        "color": color.value
        };

    send_to_server_list.new.push(crepe_data)
    check_if_need_to_speichern();

    form.classList.add("success")
    setTimeout(() => {
        form.classList.remove("success")
    }, 250);

    color.selectedIndex = 0
    form.reset()

    return;
}


/**
 * 
 */
async function send_settings_to_server(): Promise<boolean> {
    

    async function send_delete() {
        var response = await send_server(urls.delCrepe, "DELETE", send_to_server_list.delete)

        var text = await response.text()

        if (response.ok) {
            console.log(text)
            return true;
        } else {
            console.warn(text)
            return false;
        }
    }
    async function send_edit() {
        var response = await send_server(urls.editCrepe, "PATCH", send_to_server_list.edit)

        var text = await response.text()

        if (response.ok) {
            console.log(text)
            return true;
        } else {
            console.warn(text)
            return false;
        }
    };
    async function send_new() {
        console.log("Send new!")
        var response = await send_server(urls.newCrepe, "PUT", send_to_server_list.new)

        var text = await response.text()

        if (response.ok) {
            console.groupCollapsed("Gespeichert")
            console.log(text)
            console.groupEnd()
            return true;
        } else {
            console.warn("Fehler: ")
            console.warn(text)
            return false;
        }
    };

    var return_value: boolean = false
    if (send_to_server_list.new.length >= 1) { return_value = true; send_new() }
    if (send_to_server_list.edit.length >= 1) { return_value = true; send_edit() }
    if (send_to_server_list.delete.length >= 1) { return_value = true; send_delete() }

    return return_value;

}

/**
 * Sendet alles an den Server
 * 
 * **Letzte funktion, die das Senden verhindern kann**
 */
async function save_changes(): Promise<boolean> {
    console.warn("Folgendes wird versandt: ");
    console.warn(send_to_server_list)
    const res = await send_settings_to_server();
    if (res) {
        send_to_server_list.delete = []
        send_to_server_list.edit = []
        send_to_server_list.new = []
        changes_saved(true);
        getCurrentCrepes();
        return true;
    } else {
        changes_saved(false);
        return false;
    }

    /**
     * Takes around 3000 ms
     * @param status If saving was successfull or not
     */
    function changes_saved(status: boolean) {
        var elem = document.getElementById("feedback_message_container")
        var elem_txt = elem.children[0] as HTMLElement
    
        if (status) {
            elem.style.backgroundColor = "green"
            elem_txt.innerHTML = "Erfolgreich gespeichert"
        } else {
            elem.style.backgroundColor = "red"
            elem_txt.innerHTML = "Fehler beim Speichern"
        }
        animation_in()
        setTimeout(animation_out, 2000)
    
        function animation_in() {
            const Anim = new KeyframeEffect(elem, [{opacity: "1", top: "15px"}], {duration: 500, fill: "forwards"})
            new Animation(Anim, document.timeline).play()
        }
        function animation_out() {
            const Anim = new KeyframeEffect(elem, [{opacity: "0", top: "0"}], {duration: 500, fill: "forwards"})
            new Animation(Anim, document.timeline).play();
            check_if_need_to_speichern()
        }
    }
}

/**
 * Function checks if the user needs to save changes.
 * @returns true, if there are unsaved-changes
 * @returns false, if there are no unsaved-changes
 */
function check_if_need_to_speichern(): boolean {

    /**
     * Checks if send_to_server_list is empty
     */
    function is_all_empty(): boolean {
        if (send_to_server_list.delete.length > 0 || send_to_server_list.edit.length > 0 || send_to_server_list.new.length > 0) {
            return false;
        } else {
            return true;
        }
    }

    let btn = document.getElementById('save_btn') as HTMLButtonElement
    const empty = is_all_empty()

    if (empty) {
        btn.style.filter = "brightness(50%);";
        btn.style.backgroundColor = "rgb(120, 120, 120)";
        window.onbeforeunload = () => {}
        return false
    } else {
        btn.style.filter = "brightness(1);";
        btn.style.backgroundColor = "rgb(0, 133, 35)";
        return true
    }
}

function input_changed(elem: HTMLInputElement) {
    var container = elem.parentElement
    var marker = container.getElementsByClassName("edited_hint")[0] as HTMLElement


    elem.addEventListener("focusout", () => {
        if (elem.value != elem.defaultValue) {
        } else {
        };
    },
    { once: true}
    );

    elem.addEventListener("oninput", () => {
        validate_input(elem)
    })

    if (elem.value != elem.defaultValue) {
        elem.checkValidity();
        container.setAttribute("was_edited", "true")
        marker.style.display = "block"
        check_if_need_to_speichern();
    } else {
        elem.checkValidity();
        marker.style.display = "none"
        container.setAttribute("was_edited", "false")
        check_if_need_to_speichern();
    }
}

function validate_all() {
    var elems = document.getElementsByTagName("input") as HTMLCollectionOf<HTMLInputElement>
    for (let elem of Object(elems)) {
        validate_input(elem)
    }
}

/**
 * Validates set element and reports the validity afterwards
 * @param elem The Input element to check against
 */
function validate_input(elem: HTMLInputElement) {
    const validity = elem.validity
    const value = elem.value;

    if (validity.patternMismatch) {
        elem.setCustomValidity("Nee, das passt noch ned so ganz");
    } else if (validity.valueMissing) {
        elem.setCustomValidity("Ey, da muss schon was stehen!")
    } else if (validity.valid) {
        elem.setCustomValidity("");
    }
    elem.reportValidity()
}

/**
 * Made to be called just before sending to server
 */
function check_for_edits() {
    console.log("Check'in for edits")
    var list = document.getElementById("crepes_list")
    var crepes = list.getElementsByClassName("crepe_container");

    send_to_server_list.edit = []
    
    for (let i = 0; i < crepes.length; i++) {
        const crepe = crepes[i];
        
        var name_input = crepe.querySelector('input[name="Crêpes Name"]') as HTMLInputElement
        var price_input = crepe.querySelector('input[name="Crêpes Preis"]') as HTMLInputElement

        
        if (crepe.getAttribute("was_edited") == "true") {
            var id = crepe.getAttribute("data-id")
            var name = name_input.value
            var price = price_input.value

            send_to_server_list.edit.push({
                "id": id,
                "name": name,
                "price": price
            })
            check_if_need_to_speichern();
        }
    };
}

check_if_need_to_speichern()