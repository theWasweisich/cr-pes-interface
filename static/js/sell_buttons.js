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
var btns_container = document.getElementById("sell_buttons");
var payed = btns_container.querySelector('[data-function="payed"]');
var payback = btns_container.querySelector('[data-function="pay_back"]');
var own_consumption = btns_container.querySelector('[data-function="own_consumption"]');
function send_sell_to_server(sale) {
    return __awaiter(this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("SENDING");
                    return [4 /*yield*/, fetch("/api/sold", {
                            method: "POST",
                            mode: "cors",
                            cache: "no-cache",
                            credentials: "same-origin",
                            headers: { "Content-Type": "application/json" },
                            redirect: "manual",
                            referrerPolicy: "no-referrer",
                            body: JSON.stringify(sale)
                        })];
                case 1:
                    response = _a.sent();
                    if (response.ok) {
                        console.log("OK");
                        return [2 /*return*/, true];
                    }
                    else {
                        console.log("NICHT OK");
                        return [2 /*return*/, false];
                    }
                    return [2 /*return*/];
            }
        });
    });
}
function payed_func() {
    return __awaiter(this, void 0, void 0, function () {
        var crepes, current_sold, to_storage, to_storage_str, i, crepe, response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    crepes = table.return_for_sending();
                    if (crepes.length == 0) {
                        return [2 /*return*/];
                    }
                    current_sold = localStorage.getItem("sold");
                    to_storage = [];
                    for (i = 0; i < crepes.length; i++) {
                        crepe = crepes[i];
                        to_storage.push(crepe.toString());
                    }
                    to_storage_str = to_storage.join("|");
                    if (current_sold == null) {
                        localStorage.setItem("sold: ", to_storage_str);
                    }
                    else {
                        localStorage.setItem("sold: ", current_sold += to_storage_str);
                    }
                    return [4 /*yield*/, send_sell_to_server(crepes)];
                case 1:
                    response = _a.sent();
                    if (response) {
                        table.remove_all_table_entries(); // wohnt in ./index.ts
                        return [2 /*return*/, true];
                    }
                    else {
                        return [2 /*return*/, false];
                    }
                    ;
                    return [2 /*return*/];
            }
        });
    });
}
function payback_func() {
}
function own_consumption_func() {
}
function trigger_alarm() {
    var alert = document.getElementById("popup-alert");
    alert.classList.add("activate");
    setTimeout(function () {
        alert.classList.remove("activate");
    }, 5000);
}
function set_listeners_up() {
    payed.addEventListener('click', payed_func);
    payback.addEventListener('click', payback_func);
    own_consumption.addEventListener('click', own_consumption_func);
}
set_listeners_up();
