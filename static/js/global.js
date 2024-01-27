var crepelist = [];
var Crêpe = /** @class */ (function () {
    function Crêpe(id, name, preis, amount, root_element) {
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
    }
    Crêpe.prototype.toString = function () {
        return "".concat(this.crepeId, ";").concat(this.name, ";").concat(this.preis, ";").concat(this.amount);
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
