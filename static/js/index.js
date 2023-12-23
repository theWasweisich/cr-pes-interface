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
var crepelist = [];
var Crêpe2 = /** @class */ (function () {
    function Crêpe2(name, preis, zutaten, amount, root_element) {
        this.name = name;
        this.preis = preis;
        this.zutaten = zutaten;
        this.amount = amount;
        this.root_element = root_element;
    }
    Crêpe2.prototype.return_for_sending = function () {
        var map = new Map();
        map.set("name", this.name);
        map.set("preis", this.preis);
        map.set("amount", this.amount);
        return map;
    };
    return Crêpe2;
}());
function event_listener(ev) {
    if (ev.target != "div.crepe_container") {
        console.log("Nö");
        console.log(ev.target);
        return false;
    }
    else {
        console.log("YAY");
    }
}
function add_event_listeners() {
    var crepes = document.getElementsByClassName('crepe_container');
    var crepes_list = Array.from(crepes);
    crepes_list.forEach(function (crepe) {
        crepe.addEventListener("click", function (ev) {
            ev.stopPropagation();
            console.log(ev.target);
        });
    });
}
add_event_listeners();
function underlayClicked(event, element) {
    if (event.target != element) {
        alert("UPSIDAYSI");
        event.stopPropagation();
        return;
    }
}
function set_data(crepeName, crepePreis, crepeZutaten, root_element) {
    crepelist.push(new Crêpe2(crepeName, crepePreis, crepeZutaten, 1, root_element));
    return true;
}
/**
 * For formatting number to currency
 */
var formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
});
/**
 * Adds a crepe
 * @param {Crêpe2} crepe The crepe to add
 */
function append_to_table(crepe) {
    var table = document.getElementById("crepe_table");
    var new_row = document.createElement("tr");
    new_row.setAttribute('data-crepe', crepe.name);
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
