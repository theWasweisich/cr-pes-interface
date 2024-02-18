var in_table = []

// Imported: formatter, set_data, Crêpes2, crepelist, set_color from global

/**
 * Function that is called once user clicks one of the crepecontrol
 * @param target The root element of the crepe
 * @param crepes_class The Crêpe class of the crepe
 * @param button (optional) The button that has been clicked on
 */
function button_pressed_action(target: HTMLElement, crepes_class: Crêpe, button?: HTMLButtonElement) {

    if (button == undefined) {
        console.error("Undefined Button!")
        var new_amount = table.add_one_crepe(crepes_class);
    } else 
    {
        if (button.classList.contains('add')) {
            var new_amount = table.add_one_crepe(crepes_class)
        } 
        else if (button.classList.contains('remove')) {
            // console.groupCollapsed("Removing");
            // console.log("Removing!")
            // console.log(crepes_class)
            // console.groupEnd()
            
            table.remove_one_crepe(crepes_class) // FIXME
            var new_amount = crepes_class.amount;
        }
    }
    handle_amount_counter(target, new_amount);
}


/**
 * The global event listener
 * @param ev The mouse event
 */
function event_listener(ev: MouseEvent) {

    /**
     * Returns the Crêpes as a Class when given the HTML Root Element
     * @param root_div The Crepes root element
     * @returns The `Crêpe`-Class of set crepe
     */
    function get_crepes_class(root_div: HTMLElement): Crêpe {
        var target_crêpes_class: Crêpe;
        for (let i = 0; i < crepelist.length; i++) {
            const crepe = crepelist[i];

            if (crepe.crepeId == Number(root_div.getAttribute("data-id"))) {
                target_crêpes_class = crepe
                break;
            }
        }
        if (target_crêpes_class == undefined) {
            throw new Error("Hobbala!");
        }
        return target_crêpes_class
    }

    var original_target = ev.target as HTMLButtonElement; // the button
    var target = ev.currentTarget as HTMLElement; // target = DIV .crepecontainer

    var id = get_crepes_class(target)

    if (original_target.tagName == "BUTTON") {
        button_pressed_action(target, id, original_target)
    } else if (original_target.tagName == "DIV") {
        if (id.amount == 0) {
            // button_pressed_action(target, id) // Currently disabled
        }
    }
}

async function setup() {
    insertEverything().then((status) => {

        if (!status) {
            // Keine Crêpes konnten geladen werden
            const container = document.getElementById("main-content") as HTMLElement

            const root = document.createElement("div")

            const warn = document.createElement("h2")
            warn.innerText = "Es konnten leider keine Crêpes geladen werden!"
            root.appendChild(warn)
            container.appendChild(root)

            throw Error("Keine Crêpes konnten geladen werden")
        }

        var crepes = document.getElementsByClassName('crepe_container') as HTMLCollectionOf<HTMLElement>;
    
        var crepes_list = Array.from(crepes)
    
        crepes_list.forEach(crepe => {
            crepe.addEventListener("click", (ev) => event_listener(ev), true);
            set_data(crepe);
            let price = formatter.format(Number(crepe.getAttribute('data-preis')));
            (crepe.querySelector('[name="price"]') as HTMLElement).innerHTML = price;
        });
    })

}
setup();

/**
 * Use this whenever accessing the Table
 */
var table = new Table()

/**
 * Funktion, mit der man mithilfe des HTMLElementes den Crêpe bekommt
 * @param elem The root div element of the crêpe
 * @returns Crêpe or null, if the crepes has not been found
 */
function get_crepe_from_elem(elem: HTMLElement): Crêpe {
    var id = elem.getAttribute("data-id") as unknown as number

    for (let index = 0; index < crepelist.length; index++) {
        const crepe = crepelist[index];
        console.groupCollapsed("TEHEST")
        console.debug(Number(crepe.crepeId))
        console.debug(Number(id))
        console.debug(typeof (id), typeof (crepe.crepeId))
        console.debug(crepe.crepeId == id)
        console.groupEnd()

        if (crepe.crepeId == id) {
            return crepe;
        }
    }

    return null
}


function reset_crepeslist() {
    for (let index = 0; index < crepelist.length; index++) {
        const element = crepelist[index];
        element.amount = 0;
    }
}