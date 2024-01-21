var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var in_table = [];
// Imported: formatter, set_data, Crêpes2, crepelist, set_color from global
function button_pressed_action(target, crepes_class, button) {
    var crepes_id = target.getAttribute("data-id");
    if (button == undefined) {
        var new_value = table.add_one_crepe(crepes_class);
    }
    else {
        if (button.innerText == "+") {
            var new_value = table.add_one_crepe(crepes_class);
        }
        else if (button.innerText == "-") {
            var new_value = table.remove_one_crepe(crepes_class);
        }
    }
    handle_amount_counter(target, new_value);
}
function handle_amount_counter(root, new_value) {
    var counter = root.querySelector(".crepecontrol .crepes_counter");
    if (new_value == 0) {
        counter.innerHTML = "";
    }
    else {
        counter.innerHTML = String(new_value) + "x";
    }
}
function event_listener(ev) {
    function get_crepes_class(root_div) {
        var target_crêpes_class;
        for (var i = 0; i < crepelist.length; i++) {
            var crepe = crepelist[i];
            if (crepe.crepeId == Number(root_div.getAttribute("data-id"))) {
                target_crêpes_class = crepe;
                break;
            }
        }
        if (target_crêpes_class == undefined) {
            throw new Error("Hobbala!");
        }
        return target_crêpes_class;
    }
    var original_target = ev.target; // the button
    var target = ev.currentTarget; // target = DIV .crepecontainer
    var id = get_crepes_class(target);
    if (original_target.tagName == "BUTTON") {
        button_pressed_action(target, id, original_target);
    }
    else if (original_target.tagName == "DIV") {
        if (id.amount == 0) {
            button_pressed_action(target, id);
        }
    }
}
function setup() {
    var crepes = document.getElementsByClassName('crepe_container');
    var crepes_list = Array.from(crepes);
    crepes_list.forEach(function (crepe) {
        crepe.addEventListener("click", function (ev) {
            event_listener(ev);
        }, true);
        set_data(crepe);
        crepe.querySelector('[type="price"]').innerHTML = formatter.format(Number(crepe.getAttribute('data-preis')));
    });
}
setup();
// sending the crepes data (in dictionary format) to the server (localhost)
function send_crepes(data) {
    return __awaiter(this, void 0, void 0, function () {
        var response, result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetch("http://localhost:80", {
                            method: 'POST',
                            headers: {
                                "Content-Type": "application/json",
                            },
                            body: JSON.stringify(data),
                        })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, response.json()];
                case 2:
                    result = _a.sent();
                    console.log(result);
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.log("Error: " + error_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
/**
 * Daten in der Tabelle verändern
*/
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
        return this.items;
    };
    Table.prototype.update_total_value = function () {
        var total_heading = this.table.parentElement.getElementsByTagName("h2")[0];
        var total_elem = total_heading.children[0];
        var total_value = 0;
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            total_value += item.preis * item.amount;
        }
        total_elem.innerHTML = formatter.format(total_value);
    };
    /**
     * Bla
     * @param crepe The Crêpes to addd
     * @returns The new amount
     */
    Table.prototype.add_one_crepe = function (crepe) {
        if (crepe.amount >= 1) {
            for (var i = 0; i < this.items.length; i++) {
                var item = this.items[i];
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
        var tr = this.table.insertRow();
        var amount = tr.insertCell(0);
        var name = tr.insertCell(1);
        var price = tr.insertCell(2);
        amount.setAttribute("data-type", "amount");
        name.setAttribute("data-type", "name");
        price.setAttribute("data-type", "price");
        amount.innerHTML = crepes.amount.toString();
        name.innerHTML = crepes.name;
        price.innerHTML = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(crepes.preis);
        var index = tr.rowIndex;
        tr.setAttribute("data-id", String(crepes.crepeId));
        this.items.push(crepes);
    };
    ;
    /**
     * Bla
     * @param crepe The Crêpes to remove
     * @returns The new amount of the crêpes
     */
    Table.prototype.remove_one_crepe = function (crepe) {
        if (crepe.amount == 0) {
            // console.error("Es gibt keinen Crêpe zu entfernen!");
            this.update_total_value();
            return crepe.amount;
        }
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            if (item != crepe) {
                continue;
            }
            if (crepe.amount > 1) {
                var row = this.table.querySelector("[data-id=\"".concat(String(crepe.crepeId), "\"]")); // Problems
                crepe.amount -= 1;
                row.querySelector("[data-type=\"amount\"]").innerHTML = crepe.amount.toString();
                this.update_total_value();
                return crepe.amount;
            }
            else if (crepe.amount == 1) {
                this.remove_table_entry(crepe);
                crepe.amount = 0;
                this.update_total_value();
                return crepe.amount;
            }
            else {
                // console.error("There is no crêpe to remove!");
                this.update_total_value();
                return;
            }
        }
        ;
        // console.error("Da ist wohl was schiefgelaufen")
        throw Error("Hmm. Da ist wohl was schiefgelaufen");
    };
    Table.prototype.remove_table_entry = function (crêpe) {
        var row = this.table.querySelector("[data-id=\"".concat(crêpe.crepeId, "\"]"));
        this.items.splice(this.items.indexOf(crêpe));
        row.remove();
    };
    Table.prototype.remove_all_table_entries = function () {
        var rows = this.table.getElementsByTagName("tr");
        console.info(rows);
        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];
            console.debug("Deleting: ".concat(row.innerHTML));
            if (!(row.hasAttribute("data-id") && row.getAttribute("data-id") == "XXX")) {
                row.remove();
            }
        }
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            handle_amount_counter(item.root_element, 0);
        }
        this.items = [];
        this.update_total_value();
    };
    return Table;
}());
var table = new Table();
/**
 * Funktion, mit der man mithilfe des HTMLElementes den Crêpe bekommt
 * @param elem The root div element of the crêpe
 * @returns Crêpe2 or null, if the crepes has not been found
 */
function get_crepe_from_elem(elem) {
    var id = elem.getAttribute("data-id");
    for (var index = 0; index < crepelist.length; index++) {
        var crepe = crepelist[index];
        console.groupCollapsed("TEHEST");
        console.debug(Number(crepe.crepeId));
        console.debug(Number(id));
        console.debug(typeof (id), typeof (crepe.crepeId));
        console.debug(crepe.crepeId == id);
        console.groupEnd();
        if (crepe.crepeId == id) {
            console.log("Ja");
            return crepe;
        }
    }
    return null;
}
function reset_crepeslist() {
    for (var index = 0; index < crepelist.length; index++) {
        var element = crepelist[index];
        element.amount = 1;
    }
}
