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
function event_listener(ev) {
    var original_target = ev.target;
    var target = ev.currentTarget;
    if (original_target.tagName == "BUTTON") {
        console.groupCollapsed("Draufgedrückt");
        console.log(original_target);
        console.log(target);
        console.groupEnd();
    }
    else {
        console.log("nönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönönö");
        // console.log(target)
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
        set_color(crepe);
        crepe.querySelector('[type="price"]').innerHTML = formatter.format(Number(crepe.getAttribute('data-preis')));
    });
}
setup();
function underlayClicked(event, element) {
    if (event.target != element) {
        alert("UPSIDAYSI");
        event.stopPropagation();
        return;
    }
}
/**
 * Adds a crepe
 * @param {Crêpe2} crepe The crepe to add
 */
function append_to_table(crepe) {
    var table = document.getElementById("crepe_table");
    var new_row = table.insertRow();
    new_row.setAttribute('data-id', String(crepe.id));
    var anz = new_row.insertCell(0);
    var name = new_row.insertCell(1);
    var preis = new_row.insertCell(2);
    anz.innerHTML = String(crepe.amount);
    name.innerHTML = crepe.name;
    preis.innerHTML = formatter.format(crepe.preis);
    return true;
}
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
function editing_table(data, remove) {
    var table = document.getElementById("crepe_table");
    // alle TableRows sollten ein data-id attribute haben, um sie den crepes zuordnen zu können.
    // Alle TableCells sollten ein data-type attribut haben (amount, name, price)
    if (remove != null && remove && table.querySelector("[data-id=\"".concat(data.id, "\"]")) != null) {
        remove_table_entry(data, table);
    }
    if (table.querySelector("[data-id=\"".concat(data.id, "\"]")) == null) {
        create_new_entry(data, table);
    }
    else {
        edit_table_entry(data);
    }
    function edit_table_entry(crepe) {
        var translator = Intl.NumberFormat("de-DE");
        var row = table.querySelector("[data-id=\"".concat(crepe.id, "\"]"));
        row.querySelector("[data-type=\"amount\"]").innerHTML = crepe.amount.toString();
        row.querySelector("[data-type=\"price\"]").innerHTML = translator.format(crepe.preis * crepe.amount);
    }
    function create_new_entry(crepes, table) {
        var tr = table.insertRow();
        var amount = tr.insertCell(0);
        var name = tr.insertCell(1);
        var price = tr.insertCell(2);
        amount.innerHTML = crepes.amount.toString();
        name.innerHTML = crepes.name;
        price.innerHTML = Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(crepes.preis);
        var index = tr.rowIndex;
        tr.setAttribute("data-id", crepes.id.toString());
    }
    ;
    function remove_table_entry(crêpe, table) {
        table.querySelector("[data-id=\"".concat(crêpe.id, "\"]")).remove();
        crêpe.amount == 0;
    }
}
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
