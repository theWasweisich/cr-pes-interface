/**
 * This is used for importing the crêpes into the index html
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function fetch_crepes() {
    return __awaiter(this, void 0, void 0, function* () {
        let url = urls.getcrepes;
        var res = yield fetch(url, {
            method: "GET",
            mode: "cors",
            cache: "no-cache",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            redirect: "manual",
            referrerPolicy: "no-referrer",
        });
        if (res.ok) {
            console.log("Fetched crêpes, starting to insert now");
            return res.json();
        }
    });
}
function insertCrêpes(name, price) {
    const container = document.getElementById("main-content");
    const template = document.querySelector("template");
    var clone = template.content.cloneNode(true);
    let body = clone;
    body.setAttribute("", "");
    container.appendChild(clone);
}
