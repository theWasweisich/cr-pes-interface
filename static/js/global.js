const urls = {
    newSale: "/api/crepes/sold",
    resistor: "/api/sold/failresistor",
    getcrepes: "/api/crepes/get"
};
var crepelist = [];
var crepemap = new Map();
var connectionError = false;
class Crêpe {
    constructor(id, name, preis, amount, color, root_element, table_root_element) {
        this.table_element = undefined;
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.color = color;
        this.root_element = root_element;
        this.table_element = table_root_element;
    }
    toString() {
        return `\n${this.crepeId} ; ${this.name} ; ${this.preis} ; ${this.amount}\n`;
    }
}
/**
 * Adds all crêpes to the crepelist
 * @param root_element The root element of the crepe
 * @param crepeId The id of the crepe
 * @param crepeName The name of the crepe
 * @param crepePreis the Price of the crepe
 * @returns Nothing
 */
function set_data(root_element, crepeId, crepeName, crepePreis) {
    if (crepeName == undefined && crepePreis == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name');
        crepePreis = (root_element.getAttribute('data-preis'));
        crepeId = (root_element.getAttribute('data-id'));
    }
    crepelist.push(new Crêpe(Number(crepeId), crepeName, Number(crepePreis), 0, null, root_element));
    return;
}
/**
 * For formatting number to currency
 */
const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
});
/**
 * Updates the small amount hint below the crepecontrol
 * @param root The Crêpes' root element
 * @param new_amount The value to update to
 */
function handle_amount_counter(root, new_amount) {
    const counter = root.querySelector(".crepecontrol .crepes_counter");
    if (new_amount == 0) {
        counter.innerHTML = "";
    }
    else {
        counter.innerHTML = String(new_amount) + "x";
    }
}
