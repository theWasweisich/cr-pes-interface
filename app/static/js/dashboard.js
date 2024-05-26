var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var sales_data = [];
/**
 *
 * @param url The relative uri endpoint where to fetch from
 * @returns The response, or false if the request fails
 */
function get_data(url) {
    return __awaiter(this, void 0, void 0, function* () {
        var result = yield send_server(url, "GET");
        if (result.ok) {
            return result;
        }
        else {
            throw Error("ALARM");
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield get_data(urls.getsales);
        if (!data) {
            throw Error("Keine Daten?");
        }
        let all_data = map_data(data);
        populate_with_all(all_data);
    });
}
/**
 * Funktion nimmt `data` und verpackt alles in eine schönes Array :)
 * @param data Das von der fetch-Funktion erhaltene Objekt
 * @returns Ein Array mit allen Verkäufen, alles aufgedröselt
 */
function map_data(data) {
    let sales = [];
    Object.keys(data).forEach(key => {
        let sale = new Map();
        let singularSale = data[key];
        switch (singularSale["ownConsumption"]) {
            case "false":
                sale.set("ownConsumption", false);
                break;
            case "true":
                sale.set("ownConsumption", true);
                break;
            case "unknown":
                sale.set("ownConsumption", "unknown");
            default:
                throw Error("ownConsumption hat einen ungültigen Wert! " + `${singularSale["ownConsumption"]}`);
        }
        sale.set("id", singularSale["id"]);
        sale.set("saleItems", map_sale_items(singularSale["saleItems"]));
        sale.set("saleTime", new Date(singularSale["saleTime"]));
        sale.set("total", Number(singularSale["total"]));
        sales.push(sale);
    });
    return sales;
}
function map_sale_items(items) {
    let s_items = [];
    Object.keys(items).forEach(item => {
        let to_list = new Map();
        let saleitem = items[item];
        to_list.set("amount", Number(saleitem["amount"]));
        to_list.set("fullPrice", Number(saleitem["price"]));
        to_list.set("crepe_name", saleitem["crepe"]["name"]);
        to_list.set("crepe_single_price", saleitem["crepe"]["price"]);
        to_list.set("crepe_ingredients", saleitem["crepe"]["ingredients"]);
        s_items.push(to_list);
    });
    return s_items;
}
function populate_with_all(map) {
    Object.keys(map).forEach(key => {
        let salesMap = map[key];
        populate_sales_table(salesMap);
    });
}
function populate_sales_table(sale) {
    let tableBody = document.getElementById("sales-tbody");
    let template = document.getElementById("saleTable_template");
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector("tr");
    let saleTime = format_time(sale.get("saleTime"));
    let total = format_money(sale.get("total"));
    row.setAttribute("data-id", sale.get("id"));
    row.querySelector('td[data-cell="Time"]').innerHTML = saleTime;
    row.querySelector('td[data-cell="Revenue"]').innerHTML = total;
    tableBody.appendChild(row);
}
function format_time(time) { return time_formatter.format(time); }
function format_money(money) { return currency_formatter.format(money); }
