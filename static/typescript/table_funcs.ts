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
        entry.add_to_table(this.table)

        this.items.push(entry)
    };

    /**
     * Bla
     * @param crepe The Crêpes to remove
     * @returns The new amount of the crêpes or undefined, if there was an error
     */
    remove_one_crepe(crepe: Crêpe): number | undefined {
        var crepeEntry: TableEntry;

        for (let i = 0; i < this.items.length; i++) {
            const item = this.items[i];

            if (item.crepe == crepe) {
                crepeEntry = item;
            }
        }
        crepe = crepeEntry.crepe;

        crepe.amount -= 1

        this.update_total_value();

        return crepe.amount;

    }

    protected remove_table_entry(item: TableEntry) {
        if (item.crepe.amount != 0) {
            console.error("Anzahl sollte bereits auf 0 gesetzt worden sein!")
            item.crepe.amount = 0; // sollte eigentlich schon passiert sein!
        }
        
        item.delete_entry()

        const id = this.items.findIndex(x => x === item)

        delete this.items[id]

        this.update_total_value()
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
}