var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var sales = [];
class SingularSale {
    constructor(id, name, price, amount, time) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.amount = amount;
        this.total = this.price * this.amount;
        this.time = time;
    }
}
class SaleGroup {
}
/**
 *
 * @param url The relative uri endpoint where to fetch from
 * @returns The response, or false if the request fails
 */
function get_data(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var result = yield fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            redirect: "manual",
            referrerPolicy: "no-referrer",
        });
        if (result.ok) {
            return yield result.json();
        }
        else {
            throw Error("ALARM");
        }
    });
}
function load_sales() {
    return __awaiter(this, void 0, void 0, function* () {
        var answer = yield get_data("/api/getsales/sales");
        console.log(answer);
        if (answer == false) {
            throw Error("Das hat leider nicht funktioniert! (Fehler #1)");
        }
        Object.keys(answer).forEach(key => {
            var total = 0;
            var value = answer[key];
            value.items.forEach(item => {
                total += item.price * item.amount;
                sales.push(new SingularSale(item.ID, item.Name, item.price, item.amount, value.time));
                add_sale_to_table(value.time, item.ID, item.Name, item.amount, item.price);
            });
            add_total_row(total);
        });
        calculate_complete_total();
    });
}
function add_total_row(total) {
    const table = document.getElementById("sales");
    const total_row = table.insertRow();
    for (let i = 0; i < 3; i++) {
        total_row.insertCell();
    }
    var a = total_row.insertCell();
    a.innerText = "Total: " + formatter.format(total);
    total_row.classList.add("endOfSale");
}
function add_sale_to_table(time, id, crepe, amount, price) {
    const table = document.getElementById("sales-tbody");
    var row = table.insertRow();
    row.setAttribute("data-sale", `${id}`);
    var rowTime = row.insertCell();
    var rowName = row.insertCell();
    var rowAmount = row.insertCell();
    var rowPrice = row.insertCell();
    rowTime.setAttribute("data-cell", "TIME");
    rowName.setAttribute("data-cell", "CrepeName");
    rowAmount.setAttribute("data-cell", "Amount");
    rowPrice.setAttribute("data-cell", "Price");
    var time_ = new Date(time);
    console.log(time_.toUTCString());
    rowTime.innerText = time_.toLocaleString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        era: "long" // ist ja immer noch EVANGELISCHE Jugendschaft zugvogel :)
    });
    rowName.innerText = crepe;
    rowAmount.innerText = String(amount) + "x";
    rowPrice.innerText = formatter.format(price);
}
function calculate_complete_total() {
    var global_total = 0;
    sales.forEach(sale => {
        global_total += sale.total;
    });
    var globalTotalElemValue = document.getElementById("global-total").querySelector("span");
    globalTotalElemValue.innerText = formatter.format(global_total);
    trigger_heatmap();
}
function trigger_heatmap() {
    const script_elem = document.createElement("script");
    script_elem.innerText = "render_graph()";
    document.body.appendChild(script_elem);
}
