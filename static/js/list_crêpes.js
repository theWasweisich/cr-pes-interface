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
            redirect: "manual",
            referrerPolicy: "no-referrer",
        });
        if (res.ok) {
            var jason = yield res.json();
            return jason;
        }
        else {
            return null;
        }
    });
}
function insertEverything() {
    return __awaiter(this, void 0, void 0, function* () {
        var crêpes = yield fetch_crepes();
        if (crêpes === null) {
            return false;
        }
        try {
            crêpes = Object(crêpes);
        }
        catch (Error) {
            return false;
        }
        removeAllCrêpes();
        crêpes.forEach(crêpe => {
            var new_crêpe = new Crêpe(crêpe["id"], crêpe["name"], crêpe["price"], 0, crêpe["colour"]);
            console.assert(typeof (new_crêpe.color) === "string", "WHAI?");
            crepelist.push(new_crêpe);
        });
        crepelist.forEach(crêpe => {
            insertCrêpe(crêpe);
        });
        return true;
    });
}
/**
 * ### Please do not look at this function. It is a horrible pile of spaghetti
 * @param crêpe The Crêpe to insert
 */
function insertCrêpe(crêpe) {
    return __awaiter(this, void 0, void 0, function* () {
        if (crêpe === null) {
            throw Error("DU DUMM DU TROTTL");
        }
        const container = document.getElementById("main-content");
        const root = document.createElement("div");
        root.classList.add("crepe_container");
        root.setAttribute("data-name", crêpe.name);
        root.setAttribute("data-preis", crêpe.preis.toString());
        root.setAttribute("data-color", crêpe.color);
        root.setAttribute("data-id", crêpe.crepeId.toString());
        const crepecontrol = document.createElement("div");
        crepecontrol.classList.add("crepecontrol");
        const remove = document.createElement("button");
        remove.classList.add("remove");
        remove.innerText = "-";
        const add = document.createElement("button");
        add.classList.add("add");
        add.innerText = "+";
        const counter = document.createElement("p");
        counter.classList.add("crepes_counter");
        const name = document.createElement("h4");
        name.setAttribute("name", "name");
        name.innerText = crêpe.name;
        const price = document.createElement("p");
        price.setAttribute("name", "price");
        price.innerText = formatter.format(crêpe.preis);
        root.appendChild(crepecontrol);
        root.appendChild(name);
        root.appendChild(price);
        crepecontrol.appendChild(remove);
        crepecontrol.appendChild(add);
        crepecontrol.appendChild(counter);
        container.appendChild(root);
        crêpe.root_element = root;
    });
}
function removeAllCrêpes() {
    table.remove_all_table_entries();
    const root = document.getElementById("main-content");
    while (root.hasChildNodes()) {
        root.removeChild(root.firstChild);
    }
    crepelist.length = 0;
}
