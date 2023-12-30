var in_table = []

// Imported: formatter, set_data, Crêpes2, crepelist, set_color from global


function event_listener(ev: MouseEvent) {
    var original_target = ev.target as HTMLElement;
    var target = ev.currentTarget as HTMLElement;

    if (original_target.tagName == "BUTTON") {
        console.groupCollapsed("Draufgedrückt")
        console.log(original_target)
        console.log(target)
        console.groupEnd()
    } else {
        console.log("nönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönö")
        // console.log(target)
    }
}

function setup() {
    
    var crepes = document.getElementsByClassName('crepe_container') as HTMLCollectionOf<HTMLElement>;

    var crepes_list = Array.from(crepes)

    crepes_list.forEach(crepe => {
        crepe.addEventListener("click", function(ev) {
            event_listener(ev);
        }, true);
        set_data(crepe);
        set_color(crepe);
        (crepe.querySelector('[type="price"]') as HTMLElement).innerHTML = formatter.format(Number(crepe.getAttribute('data-preis')))
    });
}
setup()


function underlayClicked(event, element) {
    if (event.target != element) {
        alert("UPSIDAYSI");
        event.stopPropagation();
        return
    }

}





/**
 * Adds a crepe
 * @param {Crêpe2} crepe The crepe to add 
 */
function append_to_table(crepe: Crêpe2) {
    const table = document.getElementById("crepe_table") as HTMLTableElement;

    const new_row = table.insertRow();
    new_row.setAttribute('data-id', String(crepe.id));

    const anz = new_row.insertCell(0);
    const name = new_row.insertCell(1);
    const preis = new_row.insertCell(2);

    anz.innerHTML = String(crepe.amount);
    name.innerHTML = crepe.name;
    preis.innerHTML = formatter.format(crepe.preis);

    return true;

}

// sending the crepes data (in dictionary format) to the server (localhost)
async function send_crepes(data) {
    try {
        const response = await fetch(
            "http://localhost:80", {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            console.log(result);

    } catch (error) {
        console.log("Error: " + error);
    }
}

/**
 * Daten in der Tabelle verändern
 */
function editing_table(data: Crêpe2, remove?: boolean) {
    const table = document.getElementById("crepe_table") as HTMLTableElement;

    // alle TableRows sollten ein data-id attribute haben, um sie den crepes zuordnen zu können.
    // Alle TableCells sollten ein data-type attribut haben (amount, name, price)

    if (remove != null && remove && table.querySelector(`[data-id="${data.id}"]`) != null) {
        remove_table_entry(data, table);        
    }

    if (table.querySelector(`[data-id="${data.id}"]`) == null) {
        create_new_entry(data, table);
    } else {
        edit_table_entry(data)
    }

    function edit_table_entry(crepe: Crêpe2) {
        var translator = Intl.NumberFormat("de-DE");
        var row = table.querySelector(`[data-id="${crepe.id}"]`) as HTMLTableRowElement
        (row.querySelector(`[data-type="amount"]`) as HTMLTableCellElement).innerHTML = crepe.amount.toString();
        (row.querySelector(`[data-type="price"]`) as HTMLTableCellElement).innerHTML = translator.format(crepe.preis * crepe.amount);
    }

    function create_new_entry(crepes: Crêpe2, table: HTMLTableElement) {
            var tr = table.insertRow()

            var amount = tr.insertCell(0)
            var name = tr.insertCell(1)
            var price = tr.insertCell(2)

            amount.innerHTML = crepes.amount.toString()
            name.innerHTML = crepes.name
            price.innerHTML = Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(crepes.preis)

            var index = tr.rowIndex
            tr.setAttribute("data-id", crepes.id.toString())
        };

    function remove_table_entry(crêpe: Crêpe2, table: HTMLTableElement) {
        table.querySelector(`[data-id="${crêpe.id}"]`).remove();
        crêpe.amount == 0;
    }
}

/**
 * Funktion, mit der man mithilfe des HTMLElementes den Crêpe bekommt
 * @param elem The root div element of the crêpe
 * @returns Crêpe2 or null, if the crepes has not been found
 */
function get_crepe_from_elem(elem: HTMLElement): Crêpe2 {
    var id = elem.getAttribute("data-id")

    for (let index = 0; index < crepelist.length; index++) {
        const crepe = crepelist[index];
        console.groupCollapsed("TEHEST")
        console.debug(Number(crepe.crepeId))
        console.debug(Number(id))
        console.debug(typeof(id), typeof(crepe.crepeId))
        console.debug(crepe.crepeId == id)
        console.groupEnd()
    
        if (crepe.crepeId == id) {
            console.log("Ja")
            return crepe;
        }        
    }

    return null
}

function reset_crepeslist() {
    for (let index = 0; index < crepelist.length; index++) {
        const element = crepelist[index];
        element.amount = 1;
    }
}