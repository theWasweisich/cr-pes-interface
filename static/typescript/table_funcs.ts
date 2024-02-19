

class TableEntry {
    id: number | undefined
    crepe: Crêpe | undefined
    row: HTMLTableRowElement | undefined

    constructor(id?: number | undefined, crepe?: Crêpe | undefined, row?: HTMLTableRowElement | undefined) {
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

        amount.innerHTML = this.crepe.amount.toString() + "x";
        name.innerHTML = this.crepe.name;
        price.innerHTML = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(this.crepe.preis)


        this.row = tr; // The row that this TableEntry lives in. Needed for deletion
        return tr;
    }
 
    /**
     * Removes the Crêpe's row in the table
     */
    delete_entry() {
        // console.warn(`Deleting: ${this.crepe} Entry!`)
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

    updateAmount(new_amount: number) {
        this.amount.innerText = `${new_amount}x`;
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

    items: Set<TableEntry> = new Set();


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

        for (let item of this.items) {
            total_value += item.crepe.amount * item.crepe.preis
        }

        total_elem.innerHTML = formatter.format(total_value);
        return total_value
    }

    /**
     * Returns the current total value
     */
    getTotalValue() {
        var total: number = 0;
        for (let item of this.items) {
            total += item.crepe.amount * item.crepe.preis
        }
        return total
    }

    /**
     * Bla
     * @param crepe The Crêpes to addd
     * @returns The new amount
     */
    add_one_crepe(crepe: Crêpe): number {
        if (crepe.amount >= 1) {
            for (let item of this.items) {
                console.assert(typeof(item) !== "undefined", "ALARM: " + "| " + item.crepe.toString() + " " + item.row)

                if (item.crepe == crepe) {
                    crepe.amount += 1
                    this.updateTableEntry(crepe)
                }
            }
        } else {
            crepe.amount += 1
            this.create_new_entry(crepe);
        }
        this.update_total_value()
        return crepe.amount;
    }


    /**
     * Takes a crepe as input and updates the corresponding table entry
     * @param crepe The crêpe to update
     */
    protected updateTableEntry(crepe: Crêpe) {
        var row = this.table.querySelector(`[data-id="${crepe.crepeId}"]`) as HTMLTableRowElement;
        var amount_elem = row.querySelector(`[data-type="amount"]`) as HTMLTableCellElement
        var price_elem = row.querySelector(`[data-type="price"]`) as HTMLTableCellElement

        amount_elem.innerHTML = crepe.amount.toString() + "x";
        price_elem.innerHTML = Intl.NumberFormat("de-DE", { style: 'currency', currency: 'EUR' }).format(crepe.preis * crepe.amount);
        return;
    }


    /**
     * Creates a new Table Entry for a crepe
     * ! Does not check if there is already an entry!
     * @param crepes The Crêpe for which to create a new entry
     */
    protected create_new_entry(crepes: Crêpe) {
        var entry = new TableEntry(crepes.crepeId, crepes, undefined)
        const row = entry.add_to_table(this.table)
        console.assert(entry.row !== undefined, "WARUM? 😭") // das muss !== sein, weil assert ist wenn false
        entry.setRow(row);
        this.items.add(entry)
    };

    /**
     * Removes all units of the given `Crêpe`
     * @param crepe The Crêpes to remove
     * @returns true on success, false on error
     */
    protected remove_table_entry(crepe: Crêpe): boolean | undefined {
        var entry = this.find_crepe_in_items(crepe)
        entry.delete_entry()
        entry.crepe.amount = 0;

        const returned = this.items.delete(entry);
        if (returned != true) {
            console.groupCollapsed("ALARM 🚨")
            console.error("ALARM 🚨");
            console.log(entry)
            console.groupEnd();
            return false;
        } else {
            return true;
        }

    }



    remove_all_table_entries() {
        var iterations: number = 0;
        for (let item of this.items) {
            iterations++;
            let crepe = item.crepe // The Crêpe
            let expected_amount = this.remove_one_crepe(crepe); // Already removes crepe from this.items

            console.assert(expected_amount == crepe.amount, "🚨 FEHLER! " + expected_amount + " != " + String(crepe.amount))
        }
        if (this.items.size != 0) {
            this.remove_all_table_entries();
        }
        this.update_total_value();
    }

    /**
     * Finds the `TableEntry` corresponding to the inputted `Crêpe`
     * @param crepe The Crêpe one is looking for
     * @returns Either the `TableEntry`, if the crepe has been found and `undefined` if none has been found.
     */
    find_crepe_in_items(crepe: Crêpe): TableEntry {
        var found_entry;
        for (let item of this.items) {
            if (item.crepe === crepe) { found_entry = item }
        }
        return found_entry
    }

    /**
     * Removes (substracts) one crepe from the table
     * Does the following:
     *  + Subtracts one crepe
     * 
     * @param crepe The Crêpe of which to remove one unit
     * @returns The new number of Crêpes there are
     */
    remove_one_crepe(crepe: Crêpe): number {
        var entry = this.find_crepe_in_items(crepe);
        var crepe = entry.crepe;

        if (crepe.amount > 1) {
            crepe.amount -= 1;

            console.assert(crepe.amount === entry.crepe.amount, "Nicht se same!")
            const row = entry.row
            if (row === undefined) { console.error("Row is not defined!"); return; }
            const entry_row = new TableRow(entry)

            entry_row.updateAmount(crepe.amount);
        } else if (crepe.amount == 1) {
            this.remove_table_entry(crepe);
        }
        handle_amount_counter(crepe.root_element, crepe.amount);
        this.update_total_value();
        return crepe.amount;
    }
}