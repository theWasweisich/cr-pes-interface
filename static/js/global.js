var crepelist = [];
var Crêpe = /** @class */ (function () {
    function Crêpe(id, name, preis, amount, root_element, table_root_element) {
        this.table_element = undefined;
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
        this.table_element = table_root_element;
    }
    Crêpe.prototype.toString = function () {
        return "\n".concat(this.crepeId, "\n").concat(this.name, "\n").concat(this.preis, "\n").concat(this.amount, "\n");
    };
    return Crêpe;
}());
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
    crepelist.push(new Crêpe(Number(crepeId), crepeName, Number(crepePreis), 0, root_element));
    return;
}
/**
 * For formatting number to currency
 */
var formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
});
