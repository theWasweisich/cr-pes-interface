
var crepelist = []


class Crêpe2 {
    name: string;
    preis: number;
    zutaten: Array<string>;
    amount: number;
    root_element: HTMLElement;

    constructor(name, preis, zutaten, amount, root_element) {
        this.name = name;
        this.preis = preis;
        this.zutaten = zutaten;
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

function add_event_listeners() {
    var main = document.getElementById('main');
    var crepes = document.getElementsByClassName('crepe_container');

    Array.from(crepes).forEach(crepe => {
        crepe.addEventListener('click', event_listener, true)
    });
}


function underlayClicked(event, element) {
    if (event.target != element) {
        alert("UPSIDAYSI");
        event.stopPropagation();
        return
    }

}


function set_data(crepeName, crepePreis, crepeZutaten, root_element) {
    crepelist.push(new Crêpe2(crepeName, crepePreis, crepeZutaten, 1, root_element))
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
