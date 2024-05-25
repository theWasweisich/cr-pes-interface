var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
class SingleSale {
    constructor(id, saleTime, total, ownConsumption) {
    }
}
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
        let data = yield get_data("/api/sales/get");
        console.log(data);
        document.getElementById("testing").innerHTML = String(data);
    });
}
function populate_sales_table(sale) {
    let tableBody = document.getElementById("sales-tbody");
    let template = document.getElementById("saleTable_template");
    const clone = template.content.cloneNode(true);
    const row = clone.querySelector("tr");
}
