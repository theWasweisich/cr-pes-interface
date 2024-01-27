var Table = /** @class */ (function () {
    function Table() {
        this.table = document.getElementById("crepe_table");
        this.items = [];
    }
    /**
     *
     * @returns The Crêpes that have been sold
     */
    Table.prototype.return_for_sending = function () {
        var to_return = [];
        this.items.forEach(function (item) {
            to_return.push(item.crepe);
        });
        return to_return;
    };
    /**
     * Iterates over each crepe and adds
     */
    Table.prototype.update_total_value = function (override) {
        if (override === void 0) { override = false; }
        var total_heading = this.table.parentElement.getElementsByTagName("h2")[0];
        var total_elem = total_heading.children[0];
        var total_value = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i].crepe;
            total_value += item.preis * item.amount;
        }
        total_elem.innerHTML = formatter.format(total_value);
        return total_value;
    };
    /**
     * Bla
     * @param crepe The Crêpes to addd
     * @returns The new amount
     */
    Table.prototype.add_one_crepe = function (crepe) {
        if (crepe.amount >= 1) {
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i].crepe;
                if (item == crepe) {
                    crepe.amount += 1;
                    this.edit_table_entry(crepe);
                }
            }
        }
        else {
            crepe.amount += 1;
            this.create_new_entry(crepe);
        }
        this.update_total_value();
        return crepe.amount;
    };
    Table.prototype.edit_table_entry = function (crepe) {
        var row = this.table.querySelector("[data-id=\"".concat(crepe.crepeId, "\"]"));
        var amount_elem = row.querySelector("[data-type=\"amount\"]");
        var price_elem = row.querySelector("[data-type=\"price\"]");
        amount_elem.innerHTML = crepe.amount.toString();
        price_elem.innerHTML = Intl.NumberFormat("de-DE", { style: 'currency', currency: 'EUR' }).format(crepe.preis * crepe.amount);
        return true;
    };
    Table.prototype.create_new_entry = function (crepes) {
        var entry = new TableEntry(crepes.crepeId, crepes, undefined);
        entry.add_to_table(this.table);
        this.items.push(entry);
    };
    ;
    /**
     * Bla
     * @param crepe The Crêpes to remove
     * @returns The new amount of the crêpes or undefined, if there was an error
     */
    Table.prototype.remove_one_crepe = function (crepe) {
        var crepeEntry;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item.crepe == crepe) {
                crepeEntry = item;
            }
        }
        crepe = crepeEntry.crepe;
        crepe.amount -= 1;
        this.update_total_value();
        return crepe.amount;
    };
    Table.prototype.remove_table_entry = function (item) {
        if (item.crepe.amount != 0) {
            console.error("Anzahl sollte bereits auf 0 gesetzt worden sein!");
            item.crepe.amount = 0; // sollte eigentlich schon passiert sein!
        }
        item.delete_entry();
        var id = this.items.findIndex(function (x) { return x === item; });
        delete this.items[id];
        this.update_total_value();
    };
    Table.prototype.remove_all_table_entries = function () {
        var _loop_1 = function (i) {
            var item = this_1.items[i]; // The TableEntry class
            var item_id = this_1.items.findIndex(function (x) { return x == item; });
            var crepe = item.crepe; // The Crêpe
            var root_elem = crepe.root_element;
            item.delete_entry();
            root_elem.querySelector(".crepes_counter").innerHTML = "";
            crepe.amount = 0;
            delete this_1.items[item_id];
        };
        var this_1 = this;
        for (var i = 0; i < this.items.length; i++) {
            _loop_1(i);
        }
        if (this.items.length != 0) {
            this.remove_all_table_entries();
        }
        this.update_total_value();
    };
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
    Table.prototype.find_crepe_in_items = function (crepe) {
        var found_crepe = this.items.find(function (elem, index, array) {
            return elem.crepe === crepe;
        });
        return found_crepe;
    };
    return Table;
}());
