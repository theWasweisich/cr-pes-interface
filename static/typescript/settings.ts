let send_to_server_list = {
    new: new Array,
    edit: new Array,
    delete: new Array
};


function prepare_loader() {
    const button = document.getElementById('save_btn');
    const text = document.getElementById('save_text');
    const loader = document.getElementById('loader');

    button.addEventListener("mouseover", () => {
        text.style.display = "none";
        loader.style.display = "block";
    })
    button.addEventListener("mouseout", () => {
        text.style.display = "block";
        loader.style.display = "none";
    })
}

prepare_loader();


async function check_sendable() {
    var res: boolean
    var save_btn = document.getElementById('save_btn')
    if (send_to_server_list.new.length != 0) {
        res = await send_to_server();
    }
    else if (send_to_server_list.edit.length != 0) {
        res = await send_to_server();
    } else if (send_to_server_list.delete.length != 0) {
        res = await send_to_server();
    }
    if (res) {
        save_btn.style.backgroundColor = "rgba(0, 255, 0, 1);";
        save_btn.innerText = "Gespeichert!";
        setTimeout(() => {
            save_btn.style.backgroundClip = "auto;";
            save_btn.innerText = "Speichern";
        }, 2000)
    }
}

function change_selected() {
    var select_elem: HTMLElement = document.getElementById('color');

    // @ts-expect-error
    var selected_color = select_elem.value;
    select_elem.style.backgroundColor = selected_color;
}

function check_if_empty() {
    if (document.getElementById('crepes_list').childElementCount == 0) {
        return true;
    } else {
        return false;
    }
}

function show_empty() {
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

function delte_crepe(target) {
    var crepename = target.getAttribute('data-name');
    var elem = document.querySelector(`div[data-name="${crepename}"]`)
    elem.remove()
    show_empty();
}


async function create_crepe(): Promise<boolean> {
    let name = document.getElementById('crepeName');
    let price = document.getElementById('price');
    let ingredients = document.getElementById('ingredients');
    let color = document.getElementById('color');
    
    var crepe_data = {"new": {
        // @ts-expect-error
        "name": name.value,
        // @ts-expect-error
        "price": price.value,
        // @ts-expect-error
        "ingredients": ingredients.value,
        // @ts-expect-error
        "color": color.value
        }
    };
    if ("new" in crepe_data) {
        console.log(crepe_data["new"])
        send_to_server_list.new.push(crepe_data["new"])
    }
    else {console.log("NO!")};
    // check_sendable
    return;
}



async function send_to_server(): Promise<boolean> {
    try {
        var response = await fetch("/api/edit", {
            method: "POST",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            redirect: "manual",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(send_to_server_list)
        })
    
        var answer = response.status;
        console.log(`Status Code: ${answer}`);
        if (answer == 200) {
            return true;
        } else {
            throw Error("Das hat nicht funktioniert")
        }
    } catch (e) {
        console.log(e);
    }
}

function loadCrepe(elem: HTMLSelectElement, crepes_data: Array<any>) {
    var crêpes_name = elem.value;
    var crepes_name = document.getElementById('editCrepeName');
    var crepes_price = document.getElementById('editPrice');
    var crepes_ingredients = document.getElementById('editIngredients');


    crepes_data.forEach(crepes => {
        if (crepes.name == crêpes_name) {
            console.log(crepes);
            // @ts-expect-error
            crepes_name.value = crepes['name'];
            // @ts-expect-error
            crepes_price.value = crepes['price'];
            // @ts-expect-error
            crepes_ingredients.value = crepes['ingredients'];
            return;
        }
    });
}

function editCrepe() {
    
}

function save_changes() {
    console.log(send_to_server_list)
}