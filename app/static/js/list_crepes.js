// This is used for importing the crêpes into the index html
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
 * Function to get crêpes from the api.
 * @returns The crepes or null if there are no crepes
 */
function fetch_crepes() {
    return __awaiter(this, void 0, void 0, function* () {
        let url = urls.getcrepes;
        var res = yield fetch(url, {
            method: "GET",
            mode: "same-origin",
            cache: "no-cache",
            headers: {
                "Content-Type": "application/json",
                "X-crepeAuth": api_key
            },
            credentials: "include",
            redirect: "manual",
            referrerPolicy: "no-referrer",
        });
        if (!res.ok) {
            return undefined;
        }
        if (res.ok) {
            var jason = yield res.json();
            if (res.status == 403) {
                return undefined;
            }
            try {
                if (jason["status"] == "notAuthorized") {
                    console.error("Autorize nixxe");
                    return undefined;
                }
                else {
                    return jason;
                }
            }
            catch (error) {
                console.error(`Help me! I catched an error! This error to be more precise: ${error}`);
                return null;
            }
        }
        else {
            return null;
        }
    });
}
function insertEverything() {
    return __awaiter(this, void 0, void 0, function* () {
        var crêpes = yield fetch_crepes();
        if (crêpes === undefined) {
            console.log("Need to re-authorize!");
            localStorage.removeItem("auth");
            window.location.reload();
        }
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
            let html_root = insertCrêpe(crêpe);
            var new_crêpe = new Crêpe(crêpe["id"], crêpe["name"], crêpe["price"], 0, crêpe["colour"], html_root);
            crepelist.push(new_crêpe);
        });
        return true;
    });
}
/**
 * ### Please do not look at this function. It is a horrible pile of spaghetti
 * @param crêpe The Crêpe to insert
 */
function insertCrêpe(crêpe) {
    if (crêpe === null) {
        throw Error("DU DUMM DU TROTTL");
    }
    function basic() {
        const root = document.createElement("div");
        root.classList.add("crepe_container");
        root.setAttribute("data-name", crêpe.name);
        root.setAttribute("data-preis", crêpe.price.toString());
        root.setAttribute("data-type", crêpe.type);
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
        price.innerText = currency_formatter.format(crêpe.price);
        root.appendChild(crepecontrol);
        root.appendChild(name);
        root.appendChild(price);
        crepecontrol.appendChild(remove);
        crepecontrol.appendChild(add);
        crepecontrol.appendChild(counter);
        container.appendChild(root);
        crêpe.root_element = root;
    }
    const container = document.getElementById("main-content");
    const templ = document.getElementById("crepeTemplate");
    const clone = templ.content.cloneNode(true);
    const root = clone.querySelector(".crepe_container");
    root.setAttribute("onload", "set_data(this);");
    root.classList.add("crepe_container");
    root.setAttribute("data-name", crêpe.name);
    root.setAttribute("data-preis", crêpe.price.toString());
    root.setAttribute("data-type", crêpe.type);
    root.setAttribute("data-id", crêpe.id.toString());
    root.querySelector('h4').innerText = crêpe.name;
    let priceElem = root.querySelector('p[type="price"]');
    priceElem.innerText = currency_formatter.format(crêpe.price);
    root.addEventListener("click", (ev) => event_listener(ev), true);
    container.appendChild(root);
    let inserted = container.childNodes[container.childNodes.length - 1];
    return inserted;
}
function removeAllCrêpes() {
    table.remove_all_table_entries();
    const root = document.getElementById("main-content");
    while (root.hasChildNodes()) {
        root.removeChild(root.firstChild);
    }
    crepelist.length = 0;
}
