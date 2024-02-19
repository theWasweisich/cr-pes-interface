class TableEntry {
    constructor(id, crepe, row) {
        this.id = id;
        this.crepe = crepe;
        this.row = row;
    }
    setRow(row) {
        this.row = row;
        if (this.row === undefined) {
            throw Error("Nein 😩");
        }
    }
    /**
     * A function to Add the html row to a table, it returns the newly created row.
     * @param table The table to add the crepe to
     * @returns The new row
     */
    add_to_table(table) {
        var tr = table.insertRow();
        tr.setAttribute("data-id", String(this.crepe.crepeId));
        var amount = tr.insertCell(0);
        var name = tr.insertCell(1);
        var price = tr.insertCell(2);
        amount.setAttribute("data-type", "amount");
        name.setAttribute("data-type", "name");
        price.setAttribute("data-type", "price");
        amount.innerHTML = this.crepe.amount.toString() + "x";
        name.innerHTML = this.crepe.name;
        price.innerHTML = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(this.crepe.preis);
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
    constructor(entry) {
        this.amount = entry.row.querySelector('[data-type="amount"]');
        this.name = entry.row.querySelector('[data-type="name"]');
        this.price = entry.row.querySelector('[data-type="price"]');
    }
    updateAmount(new_amount) {
        this.amount.innerText = `${new_amount}x`;
    }
    updateName(new_name) {
        this.name.innerText = new_name;
    }
    updatePrice(new_price) {
        this.price.innerText = formatter.format(new_price);
    }
}
class Table {
    constructor() {
        this.table = document.getElementById("crepe_table");
        this.items = new Set();
    }
    /**
     *
     * @returns The Crêpes that have been sold
     */
    return_for_sending() {
        var to_return = [];
        this.items.forEach(item => {
            to_return.push(item.crepe);
        });
        return to_return;
    }
    /**
     * Iterates over each crepe and adds
     */
    update_total_value(override = false) {
        var total_heading = this.table.parentElement.getElementsByTagName("h2")[0];
        var total_elem = total_heading.children[0];
        var total_value = 0;
        for (let item of this.items) {
            total_value += item.crepe.amount * item.crepe.preis;
        }
        total_elem.innerHTML = formatter.format(total_value);
        return total_value;
    }
    /**
     * Returns the current total value
     */
    getTotalValue() {
        var total = 0;
        for (let item of this.items) {
            total += item.crepe.amount * item.crepe.preis;
        }
        return total;
    }
    /**
     * Bla
     * @param crepe The Crêpes to addd
     * @returns The new amount
     */
    add_one_crepe(crepe) {
        if (crepe.amount >= 1) {
            for (let item of this.items) {
                console.assert(typeof (item) !== "undefined", "ALARM: " + "| " + item.crepe.toString() + " " + item.row);
                if (item.crepe == crepe) {
                    crepe.amount += 1;
                    this.updateTableEntry(crepe);
                }
            }
        }
        else {
            crepe.amount += 1;
            this.create_new_entry(crepe);
        }
        this.update_total_value();
        return crepe.amount;
    }
    /**
     * Takes a crepe as input and updates the corresponding table entry
     * @param crepe The crêpe to update
     */
    updateTableEntry(crepe) {
        var row = this.table.querySelector(`[data-id="${crepe.crepeId}"]`);
        var amount_elem = row.querySelector(`[data-type="amount"]`);
        var price_elem = row.querySelector(`[data-type="price"]`);
        amount_elem.innerHTML = crepe.amount.toString() + "x";
        price_elem.innerHTML = Intl.NumberFormat("de-DE", { style: 'currency', currency: 'EUR' }).format(crepe.preis * crepe.amount);
        return;
    }
    /**
     * Creates a new Table Entry for a crepe
     * ! Does not check if there is already an entry!
     * @param crepes The Crêpe for which to create a new entry
     */
    create_new_entry(crepes) {
        var entry = new TableEntry(crepes.crepeId, crepes, undefined);
        const row = entry.add_to_table(this.table);
        console.assert(entry.row !== undefined, "WARUM? 😭"); // das muss !== sein, weil assert ist wenn false
        entry.setRow(row);
        this.items.add(entry);
    }
    ;
    /**
     * Removes all units of the given `Crêpe`
     * @param crepe The Crêpes to remove
     * @returns true on success, false on error
     */
    remove_table_entry(crepe) {
        var entry = this.find_crepe_in_items(crepe);
        entry.delete_entry();
        entry.crepe.amount = 0;
        const returned = this.items.delete(entry);
        if (returned != true) {
            console.groupCollapsed("ALARM 🚨");
            console.error("ALARM 🚨");
            console.log(entry);
            console.groupEnd();
            return false;
        }
        else {
            return true;
        }
    }
    remove_all_table_entries() {
        var iterations = 0;
        for (let item of this.items) {
            iterations++;
            let crepe = item.crepe; // The Crêpe
            let expected_amount = this.remove_one_crepe(crepe); // Already removes crepe from this.items
            console.assert(expected_amount == crepe.amount, "🚨 FEHLER! " + expected_amount + " != " + String(crepe.amount));
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
    find_crepe_in_items(crepe) {
        var found_entry;
        for (let item of this.items) {
            if (item.crepe === crepe) {
                found_entry = item;
            }
        }
        return found_entry;
    }
    /**
     * Removes (substracts) one crepe from the table
     * Does the following:
     *  + Subtracts one crepe
     *
     * @param crepe The Crêpe of which to remove one unit
     * @returns The new number of Crêpes there are
     */
    remove_one_crepe(crepe) {
        var entry = this.find_crepe_in_items(crepe);
        var crepe = entry.crepe;
        if (crepe.amount > 1) {
            crepe.amount -= 1;
            console.assert(crepe.amount === entry.crepe.amount, "Nicht se same!");
            const row = entry.row;
            if (row === undefined) {
                console.error("Row is not defined!");
                return;
            }
            const entry_row = new TableRow(entry);
            entry_row.updateAmount(crepe.amount);
        }
        else if (crepe.amount == 1) {
            this.remove_table_entry(crepe);
        }
        handle_amount_counter(crepe.root_element, crepe.amount);
        this.update_total_value();
        return crepe.amount;
    }
}
