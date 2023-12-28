
var crepelist = []
var in_table = []


class Crêpe2 {
    id: number;
    name: string;
    preis: number;
    crepeId: number;
    amount: number;
    root_element: HTMLElement;

    constructor(id, name, preis, amount, root_element) {
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
    }

    return_for_sending(): Map<string, unknown> {
        var map = new Map()
        map.set("name", this.name)
        map.set("preis", this.preis)
        map.set("amount", this.amount)
        return map;
    }
}


function event_listener(ev) {
    if (ev.target != "div.crepe_container") {
        console.log("Nö")
        console.log(ev.target)
        return false;
    } else {
        console.log("YAY")
    }
}

function setup() {
    
    var crepes = document.getElementsByClassName('crepe_container') as HTMLCollectionOf<HTMLElement>;

    var crepes_list = Array.from(crepes)

    crepes_list.forEach(crepe => {
        crepe.addEventListener("click", function(ev) {
            ev.stopPropagation()
            console.log(ev.target);
        });
        set_data(crepe);
    });
}


function underlayClicked(event, element) {
    if (event.target != element) {
        alert("UPSIDAYSI");
        event.stopPropagation();
        return
    }

}


function set_data(root_element: HTMLElement, crepeId?, crepeName?: string, crepePreis?: number) {
    if (crepeName == undefined && crepePreis == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name')
        crepePreis = (root_element.getAttribute('data-preis')) as unknown as number
        crepeId = (root_element.getAttribute('data-id')) as unknown as number
    }
    crepelist.push(new Crêpe2(crepeId, crepeName, crepePreis, 1, root_element))
    return true;
}

/**
 * For formatting number to currency
 */
const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
})

/**
 * Adds a crepe
 * @param {Crêpe2} crepe The crepe to add 
 */
function append_to_table(crepe: Crêpe2) {
    const table = document.getElementById("crepe_table");

    const new_row = document.createElement("tr");
    new_row.setAttribute('data-crepe', crepe.name);

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
    const table = document.getElementById("crepe_table");

    // alle TableRows sollten ein data-id attribute haben, um sie den crepes zuordnen zu können.
    // Alle TableCells sollten ein data-type attribut haben (amount, name, price)

    

    function edit_table_entry(crepe: Crêpe2, new_amount: number) {
        var translator = Intl.NumberFormat("de-DE");
        var row = table.querySelector(`[data-id="${crepe.id}"]`) as HTMLTableRowElement
        (row.querySelector(`[data-type="amount"]`) as HTMLTableCellElement).innerHTML = new_amount.toString();
        (row.querySelector(`[data-type="price"]`) as HTMLTableCellElement).innerHTML = translator.format(crepe.preis * new_amount);
    }

    function create_new_entry(data: Array<Crêpe2>, table: HTMLTableElement) {
        data.forEach(crepes => {
            var tr = table.insertRow()
    
            var amount = tr.insertCell(0)
            var name = tr.insertCell(1)
            var price = tr.insertCell(2)

            amount.innerHTML = crepes.amount.toString()
            name.innerHTML = crepes.name
            price.innerHTML = Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(crepes.preis)

            var index = tr.rowIndex
            tr.setAttribute("data-id", index.toString())
        });
    }

    function remove_table_entry(id: number) {
        table.querySelector(`[data-id="${id}"]`).remove();
    }
}

