var TableEntry = /** @class */ (function () {
    function TableEntry(id, crepe, row) {
        this.id = id;
        this.crepe = crepe;
        this.row = row;
    }
    TableEntry.prototype.setRow = function (row) {
        this.row = row;
        if (this.row === undefined) {
            throw Error("Nein 😩");
        }
    };
    /**
     * A function to Add the html row to a table, it returns the newly created row.
     * @param table The table to add the crepe to
     * @returns The new row
     */
    TableEntry.prototype.add_to_table = function (table) {
        var tr = table.insertRow();
        tr.setAttribute("data-id", String(this.crepe.crepeId));
        var amount = tr.insertCell(0);
        var name = tr.insertCell(1);
        var price = tr.insertCell(2);
        amount.setAttribute("data-type", "amount");
        name.setAttribute("data-type", "name");
        price.setAttribute("data-type", "price");
        // amount.setAttribute("data-type", "amount")
        // name.setAttribute("data-type", "name")
        // price.setAttribute("data-type", "price")
        amount.innerHTML = this.crepe.amount.toString();
        name.innerHTML = this.crepe.name;
        price.innerHTML = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(this.crepe.preis);
        this.row = tr; // The row that this TableEntry lives in. Needed for deletion
        return tr;
    };
    /**
     * Removes the Crêpe's row in the table
     */
    TableEntry.prototype.delete_entry = function () {
        // console.warn(`Deleting: ${this.crepe} Entry!`)
        this.row.remove();
    };
    return TableEntry;
}());
var TableRow = /** @class */ (function () {
    function TableRow(entry) {
        this.amount = entry.row.querySelector('[data-type="amount"]');
        this.name = entry.row.querySelector('[data-type="name"]');
        this.price = entry.row.querySelector('[data-type="price"]');
    }
    TableRow.prototype.updateAmount = function (new_amount) {
        console.groupCollapsed("Updating Price");
        console.log("Updating Price Element:");
        console.log(this.amount);
        console.log("to: ".concat(new_amount));
        console.groupEnd();
        this.amount.innerText = "".concat(new_amount, "x");
    };
    TableRow.prototype.updateName = function (new_name) {
        this.name.innerText = new_name;
    };
    TableRow.prototype.updatePrice = function (new_price) {
        this.price.innerText = formatter.format(new_price);
    };
    return TableRow;
}());
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
                console.assert(typeof (this.items[i]) !== "undefined", "ALARM: " + i + "| " + this.items[i].crepe.toString() + " " + this.items[i].row);
                var item = this.items[i].crepe;
                if (item == crepe) {
                    crepe.amount += 1;
                    var res = this.edit_table_entry(crepe);
                    console.assert(res, "huh?");
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
        var row = entry.add_to_table(this.table);
        console.assert(entry.row !== undefined, "WARUM? 😭"); // das muss !== sein, weil assert ist wenn false
        entry.setRow(row);
        this.items.push(entry);
    };
    ;
    /**
     * Removes all units of the given `Crêpe`
     * @param crepe The Crêpes to remove
     * @returns true on success, false on error
     */
    Table.prototype.remove_table_entry = function (crepe) {
        var entry = this.find_crepe_in_items(crepe);
        entry.delete_entry();
        entry.crepe.amount = 0;
        var id = this.items.findIndex(function (item) {
            item === entry;
        });
        var returned = this.items.splice(id, 1);
        if (!(returned[0] === entry)) {
            console.error("ALARM 🚨");
            return false;
        }
        else {
            return true;
        }
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
     * @param crepe The Crêpe one is looking for
     * @returns Either the `TableEntry`, if the crepe has been found and `undefined` if none has been found.
     */
    Table.prototype.find_crepe_in_items = function (crepe) {
        var found_crepe = this.items.find(function (elem, index, array) {
            return elem.crepe === crepe;
        });
        return found_crepe;
    };
    /**
     * Removes (substracts) one crepe from the table
     * @param crepe The Crêpe of which to remove one unit
     * @returns The new number of Crêpes there are
     */
    Table.prototype.remove_one_crepe = function (crepe) {
        var entry = this.find_crepe_in_items(crepe);
        var crepe = entry.crepe;
        if (crepe.amount > 1) {
            crepe.amount -= 1;
            console.assert(crepe.amount === entry.crepe.amount, "Nicht se same!");
            var row = entry.row;
            if (row === undefined) {
                console.error("Row is not defined!");
                return;
            }
            var entry_row = new TableRow(entry);
            entry_row.updateAmount(crepe.amount);
        }
        else if (crepe.amount == 1) {
            this.remove_table_entry(crepe);
        }
        this.update_total_value();
        return crepe.amount;
    };
    return Table;
}());
