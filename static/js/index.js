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
/**
 * Function that is called once user clicks one of the crepecontrol
 * @param target The root element of the crepe
 * @param crepes_class The Crêpe class of the crepe
 * @param button (optional) The button that has been clicked on
 */
function button_pressed_action(target, crepes_class, button) {
    if (button == undefined) {
        console.error("Undefined Button!");
        var new_amount = table.add_one_crepe(crepes_class);
    }
    else {
        if (button.innerText == "+") {
            var new_amount = table.add_one_crepe(crepes_class);
        }
        else if (button.innerText == "-") {
            table.remove_one_crepe(crepes_class); // FIXME
            var new_amount = crepes_class.amount;
        }
    }
    handle_amount_counter(target, new_amount);
}
/**
 * Updates the small amount hint below the crepecontrol
 * @param root The Crêpes' root element
 * @param new_amount The value to update to
 */
function handle_amount_counter(root, new_amount) {
    var counter = root.querySelector(".crepecontrol .crepes_counter");
    if (new_amount == 0) {
        counter.innerHTML = "";
    }
    else {
        counter.innerHTML = String(new_amount) + "x";
    }
}
/**
 * The global event listener
 * @param ev The mouse event
 */
function event_listener(ev) {
    /**
     * Returns the Crêpes as a Class when given the HTML Root Element
     * @param root_div The Crepes root element
     * @returns The `Crêpe`-Class of set crepe
     */
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
            // button_pressed_action(target, id) // Currently disabled
        }
    }
}
function setup() {
    var crepes = document.getElementsByClassName('crepe_container');
    var crepes_list = Array.from(crepes);
    crepes_list.forEach(function (crepe) {
        crepe.addEventListener("click", function (ev) { return event_listener(ev); }, true);
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
var TableEntry = /** @class */ (function () {
    function TableEntry(id, crepe, row) {
        this.id = id;
        this.crepe = crepe;
        this.row = row;
    }
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
    };
    /**
     * Removes the Crêpe's row in the table
     */
    TableEntry.prototype.delete_entry = function () {
        console.warn("Deleting: ".concat(this.crepe, " Entry!"));
        this.row.remove();
    };
    return TableEntry;
}());
var table = new Table();
/**
 * Funktion, mit der man mithilfe des HTMLElementes den Crêpe bekommt
 * @param elem The root div element of the crêpe
 * @returns Crêpe or null, if the crepes has not been found
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
        element.amount = 0;
    }
}
