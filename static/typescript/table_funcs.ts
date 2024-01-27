class TableEntry {
    id: number | undefined
    crepe: Crêpe | undefined
    row: HTMLTableRowElement | undefined

    constructor(id: number | undefined, crepe: Crêpe | undefined, row: HTMLTableRowElement | undefined) {
        this.id = id
        this.crepe = crepe
        this.row = row
    }

    setRow(row: HTMLTableRowElement) {
        this.row = row
        if (this.row === undefined) {
            throw Error("Nein 😩")
        }
    }

    /**
     * A function to Add the html row to a table, it returns the newly created row.
     * @param table The table to add the crepe to
     * @returns The new row
     */
    add_to_table(table: HTMLTableElement): HTMLTableRowElement {
        var tr = table.insertRow()
        tr.setAttribute("data-id", String(this.crepe.crepeId))

        var amount = tr.insertCell(0)
        var name = tr.insertCell(1)
        var price = tr.insertCell(2)

        amount.setAttribute("data-type", "amount")
        name.setAttribute("data-type", "name")
        price.setAttribute("data-type", "price")

        // amount.setAttribute("data-type", "amount")
        // name.setAttribute("data-type", "name")
        // price.setAttribute("data-type", "price")

        amount.innerHTML = this.crepe.amount.toString()
        name.innerHTML = this.crepe.name
        price.innerHTML = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(this.crepe.preis)


        this.row = tr; // The row that this TableEntry lives in. Needed for deletion
        return tr;
    }

    /**
     * Removes the Crêpe's row in the table
     */
    delete_entry() {
        console.warn(`Deleting: ${this.crepe} Entry!`)
        this.row.remove();
    }


}

class TableRow {
    amount: HTMLElement;
    name: HTMLElement;
    price: HTMLElement;

    constructor (entry: TableEntry) {
        this.amount = entry.row.querySelector('[data-type="amount"]') as HTMLElement;
        this.name = entry.row.querySelector('[data-type="name"]') as HTMLElement;
        this.price = entry.row.querySelector('[data-type="price"]') as HTMLElement;
    }

    updateAmount(new_value: number) {
        this.amount.innerText = `${new_value}x`;
    }

    updateName(new_name: string) {
        this.name.innerText = new_name;
    }

    updatePrice(new_price: number) {
        this.price.innerText = formatter.format(new_price);
    }
}

class Table {
    table = document.getElementById("crepe_table") as HTMLTableElement;

    items: TableEntry[] = [];

    /**
     * 
     * @returns The Crêpes that have been sold
     */
    return_for_sending(): Crêpe[] {
        var to_return: Crêpe[] = [];
        this.items.forEach(item => {
            to_return.push(item.crepe);
        })
        return to_return
    }

    /**
     * Iterates over each crepe and adds
     */
    protected update_total_value(override: boolean = false) {
        var total_heading = this.table.parentElement.getElementsByTagName("h2")[0]
        var total_elem = total_heading.children[0] as HTMLElement

        var total_value: number = 0

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i].crepe;

            total_value += item.preis * item.amount
        }

        total_elem.innerHTML = formatter.format(total_value);
        return total_value
    }

    /**
     * Bla
     * @param crepe The Crêpes to addd
     * @returns The new amount
     */
    add_one_crepe(crepe: Crêpe): number {
        if (crepe.amount >= 1) {
            for (let i = 0; i < this.items.length; i++) {
                console.assert(typeof(this.items[i]) === "undefined", "ALARM: " + i + "| " + this.items[i].crepe.toString() + " " + this.items[i].row)
                const item = this.items[i].crepe;

                if (item == crepe) {
                    crepe.amount += 1
                    var res = this.edit_table_entry(crepe)
                    console.assert(res, "huh?")
                }
            }
        } else {
            crepe.amount += 1
            this.create_new_entry(crepe);
        }
        this.update_total_value()
        return crepe.amount;
    }


    protected edit_table_entry(crepe: Crêpe): boolean {
        var row = this.table.querySelector(`[data-id="${crepe.crepeId}"]`) as HTMLTableRowElement;
        var amount_elem = row.querySelector(`[data-type="amount"]`) as HTMLTableCellElement
        var price_elem = row.querySelector(`[data-type="price"]`) as HTMLTableCellElement

        amount_elem.innerHTML = crepe.amount.toString();
        price_elem.innerHTML = Intl.NumberFormat("de-DE", { style: 'currency', currency: 'EUR' }).format(crepe.preis * crepe.amount);
        return true;
    }


    protected create_new_entry(crepes: Crêpe) {
        var entry = new TableEntry(crepes.crepeId, crepes, undefined)
        const row = entry.add_to_table(this.table)
        console.assert(entry.row === undefined, "WARUM? 😭")
        entry.setRow(row);
        console.assert(entry.row === undefined, "HÄÄÄÄÄÄÄÄÄÄÄÄÄ 😭")

        this.items.push(entry)
    };

    /**
     * Removes all units of the given `Crêpe`
     * @param crepe The Crêpes to remove
     * @returns The new amount of the crêpes or undefined, if there was an error
     */
    protected remove_table_entry(crepe: Crêpe): number | undefined {
        // console.trace()
        // console.log("Removing crepe from table")
        // var crepeEntry: TableEntry;

        // for (let i = 0; i < this.items.length; i++) {
        //     const item = this.items[i];

        //     if (item.crepe == crepe) {
        //         crepeEntry = item;
        //     }
        // }

        // console.assert(crepeEntry.crepe === crepe, "Ooopps")
        // crepe = crepeEntry.crepe;

        // this.remove_table_entry(crepe)

        // crepe.amount -= 1

        // this.update_total_value();

        // return crepe.amount;
        return

    }



    remove_all_table_entries() {
        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i]; // The TableEntry class
            const item_id = this.items.findIndex(x => x == item);

            let crepe = item.crepe // The Crêpe
            let root_elem = crepe.root_element
            item.delete_entry()


            root_elem.querySelector(".crepes_counter").innerHTML = "";
            crepe.amount = 0;
            delete this.items[item_id];
        }
        if (this.items.length != 0) {
            this.remove_all_table_entries();
        }
        this.update_total_value();
    }

    /**
     * Finds the `TableEntry` corresponding to the inputted `Crêpe`
     * 
     * ---
     * 
     * &nbsp;
     * 
     * @param crepe The Crêpe one is looking for
     * @returns Either the `TableEntry`, if the crepe has been found and `undefined` if none has been found.
     */
    find_crepe_in_items(crepe: Crêpe) {
        const found_crepe = this.items.find((elem, index, array) => {
            return elem.crepe === crepe
        })
        return found_crepe
    }

    remove_one_crepe(crepe: Crêpe) {
        var entry = this.find_crepe_in_items(crepe);
        var crepe = entry.crepe;

        if (crepe.amount > 1) {
            crepe.amount -= 1;
            console.assert(crepe.amount === entry.crepe.amount, "Nicht se same!")
            const row = entry.row
            if (row === undefined) { console.error("Row is not defined!"); return; }
            const entry_row = new TableRow(entry)

            entry_row.updatePrice(crepe.amount);
        }
    }
}