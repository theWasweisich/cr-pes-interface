var in_table = []

// Imported: formatter, set_data, Crêpes2, crepelist, set_color from global

function button_pressed_action(target: HTMLElement, crepes_class: Crêpe2, button?: HTMLButtonElement) {
    const crepes_id = target.getAttribute("data-id")

    if (button == undefined) {
        var new_value = table.add_one_crepe(crepes_class)
    } else {
        if (button.innerText == "+") {
            var new_value = table.add_one_crepe(crepes_class)
        } else if (button.innerText == "-") {
            table.remove_one_crepe(crepes_class) // FIXME
            var new_value = crepes_class.amount
        }
    }
    handle_amount_counter(target, new_value);
}

function handle_amount_counter(root: HTMLElement, new_value: number) {
    const counter = root.querySelector(".crepecontrol .crepes_counter") as HTMLElement
    if (new_value == 0) {
        counter.innerHTML = ""
    } else {
        counter.innerHTML = String(new_value) + "x"
    }
}

/**
 * The global event listener
 * @param ev The mouse event
 */
function event_listener(ev: MouseEvent) {

    /**
     * Returns the Crêpes as a Class when given the HTML Root Element
     * @param root_div The Crepes root element
     * @returns The `Crêpe2`-Class of set crepe
     */
    function get_crepes_class(root_div: HTMLElement): Crêpe2 {
        var target_crêpes_class: Crêpe2;
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

function setup() {
    
    var crepes = document.getElementsByClassName('crepe_container') as HTMLCollectionOf<HTMLElement>;

    var crepes_list = Array.from(crepes)

    crepes_list.forEach(crepe => {
        crepe.addEventListener("click", function(ev) {
            event_listener(ev);
        }, true);
        set_data(crepe);
        (crepe.querySelector('[type="price"]') as HTMLElement).innerHTML = formatter.format(Number(crepe.getAttribute('data-preis')))
    });
}
setup()

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

class TableEntry {
    id: number | undefined
    crepe: Crêpe2 | undefined
    row: HTMLTableRowElement | undefined

    constructor(id: number | undefined, crepe: Crêpe2 | undefined, row: HTMLTableRowElement | undefined) {
        this.id = id
        this.crepe = crepe
        this.row = row
    }

    add_to_table(table: HTMLTableElement) {
        var tr = table.insertRow()
        tr.setAttribute("data-id", String(this.crepe.crepeId))
        
        var amount = tr.insertCell(0)
        var name = tr.insertCell(1)
        var price = tr.insertCell(2)
        
        amount.setAttribute("data-type", "amount")
        name.setAttribute("data-type", "name")
        price.setAttribute("data-type", "price")
        
        amount.setAttribute("data-type", "amount")
        name.setAttribute("data-type", "name")
        price.setAttribute("data-type", "price")
        
        amount.innerHTML = this.crepe.amount.toString()
        name.innerHTML = this.crepe.name
        price.innerHTML = Intl.NumberFormat('de-DE', {style: 'currency', currency: 'EUR'}).format(this.crepe.preis)
        
        
        this.row = tr; // The row that this TableEntry lives in. Needed for deletion
    }

    delete_entry() {
        this.row.remove();
    }
    

}

class Table {
    table = document.getElementById("crepe_table") as HTMLTableElement;
    
    items: TableEntry[] = [];
    
    /**
     * 
     * @returns The Crêpes that have been sold
     */
    return_for_sending(): Crêpe2[] {
        var to_return: Crêpe2[] = [];
        this.items.forEach(item => {
            to_return.push(item.crepe);
        })
        return to_return
    }

    private update_total_value() {
    var total_heading = this.table.parentElement.getElementsByTagName("h2")[0]
        var total_elem = total_heading.children[0] as HTMLElement

        var total_value: number = 0

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i].crepe;
            
            total_value += item.preis * item.amount
        }

        total_elem.innerHTML = formatter.format(total_value);
    }

    /**
     * Bla
     * @param crepe The Crêpes to addd
     * @returns The new amount
     */
    add_one_crepe(crepe: Crêpe2): number {
        if (crepe.amount >= 1) {
            for (let i = 0; i < this.items.length; i++) {
                const item = this.items[i].crepe;
                
                if (item == crepe) {
                    crepe.amount += 1
                    this.edit_table_entry(crepe)
                }
            }
        } else {
            crepe.amount += 1
            this.create_new_entry(crepe);
        }
        this.update_total_value()
        return crepe.amount;
    }

    
    private edit_table_entry(crepe: Crêpe2): boolean {
        var row = this.table.querySelector(`[data-id="${crepe.crepeId}"]`) as HTMLTableRowElement;
        var amount_elem = row.querySelector(`[data-type="amount"]`) as HTMLTableCellElement
        var price_elem = row.querySelector(`[data-type="price"]`) as HTMLTableCellElement
        
        amount_elem.innerHTML = crepe.amount.toString();
        price_elem.innerHTML = Intl.NumberFormat("de-DE", {style: 'currency', currency: 'EUR'}).format(crepe.preis * crepe.amount);
        return true;
    }
    
    private create_new_entry(crepes: Crêpe2) {
        var entry = new TableEntry(crepes.crepeId, crepes, undefined)
        entry.add_to_table(this.table)
        
        this.items.push(entry)
    };

    /**
     * Bla
     * @param crepe The Crêpes to remove
     * @returns The new amount of the crêpes
     */
    remove_one_crepe(crepe: Crêpe2) {
        console.info(`Removing: ${crepe}`);

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            
            if (item.crepe == crepe) {
                console.log("Removing Crêpe: " + crepe.toString())

                if (crepe.crepeId) {

                }
            }
        }

    }

    private remove_table_entry(crêpe: Crêpe2) {
        for (let i = 0; i < this.items.length; i++) {
            const entry = this.items[i];

            if (crêpe == entry.crepe) {
                entry.delete_entry()
                let index = this.items.indexOf(entry)
                if (index > -1) {
                    this.items.slice()
                } else {
                    throw new Error("Tabelleneintrag nicht gefunden!")
                }
            }
        }
        this.update_total_value()
    }
    
    remove_all_table_entries() {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];
            let crepe = item.crepe
            let root_elem = crepe.root_element
            item.delete_entry()
            // console.log(root_elem)
            root_elem.querySelector(".crepes_counter").innerHTML = "";
            crepe.amount = 0;
            this.items.splice(i, 1);
        }
        if (this.items.length > 0) {
            this.remove_all_table_entries();
        }
        this.update_total_value();
    }
}

var table = new Table()

/**
 * Funktion, mit der man mithilfe des HTMLElementes den Crêpe bekommt
 * @param elem The root div element of the crêpe
 * @returns Crêpe2 or null, if the crepes has not been found
 */
function get_crepe_from_elem(elem: HTMLElement): Crêpe2 {
    var id = elem.getAttribute("data-id") as unknown as number

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
        element.amount = 0;
    }
}