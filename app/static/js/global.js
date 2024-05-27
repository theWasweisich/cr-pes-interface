var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * These are all urls pointing to the api. For quick access
 */
const urls = {
    newsale: "/api/crepes/sold",
    resistor: "/api/sales/failResister",
    getsales: "/api/sales/get",
    getcrepes: "/api/crepes/get",
    delCrepe: "/api/crepes/delete",
    editCrepe: "/api/crepes/edit",
    newCrepe: "/api/crepes/new",
};
var api_key = "";
if (localStorage.getItem("auth") === null) {
    window.location.assign("/init");
}
else {
    api_key = localStorage.getItem("auth");
}
function send_server(url, method, body) {
    return __awaiter(this, void 0, void 0, function* () {
        var response;
        try {
            if (body != undefined) {
                response = yield fetch(url, {
                    method: method,
                    mode: "same-origin",
                    cache: "no-cache",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-crepeAuth": api_key
                    },
                    redirect: "manual",
                    referrerPolicy: "no-referrer",
                    body: JSON.stringify(body)
                });
            }
            else {
                response = yield fetch(url, {
                    method: method,
                    mode: "same-origin",
                    cache: "no-cache",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                        "X-crepeAuth": api_key
                    },
                    redirect: "manual",
                    referrerPolicy: "no-referrer",
                });
            }
        }
        catch (error) {
            alert("Es gab einen Fehler!");
            throw { "name": "Error" };
        }
        if (response.status == 304) {
            localStorage.removeItem("auth");
            location.reload();
        }
        return response;
    });
}
var crepelist = [];
var crepemap = new Map();
var connectionError = false;
class Crêpe {
    constructor(id, name, price, amount, type, root_element, table_root_element) {
        this.table_element = undefined;
        this.crepeId = id;
        this.name = name;
        this.price = price;
        this.amount = amount;
        this.type = type;
        this.root_element = root_element;
        this.table_element = table_root_element;
    }
    toString() {
        return `\n${this.crepeId} ; ${this.name} ; ${this.price} ; ${this.amount}\n`;
    }
}
/**
 * Adds all crêpes to the crepelist
 * @param root_element The root element of the crepe
 * @param crepeId The id of the crepe
 * @param crepeName The name of the crepe
 * @param crepeprice the Price of the crepe
 * @returns Nothing
 */
function set_data(root_element, crepeId, crepeName, crepeprice) {
    if (crepeName == undefined && crepeprice == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name');
        crepeprice = (root_element.getAttribute('data-price'));
        crepeId = (root_element.getAttribute('data-id'));
    }
    crepelist.push(new Crêpe(Number(crepeId), crepeName, Number(crepeprice), 0, null, root_element));
    return;
}
/**
 * For formatting number to currency
 */
const currency_formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
});
const time_formatter = new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
});
/**
 * Updates the small amount hint below the crepecontrol
 * @param root The Crêpes' root element
 * @param new_amount The value to update to
 */
function handle_amount_counter(root, new_amount) {
    const counter = root.querySelector(".crepes_counter");
    if (new_amount == 0) {
        counter.innerHTML = "";
    }
    else {
        counter.innerHTML = String(new_amount) + "x";
    }
}
