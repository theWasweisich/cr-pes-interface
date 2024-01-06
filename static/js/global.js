var crepelist = [];
var Crêpe2 = /** @class */ (function () {
    function Crêpe2(id, name, preis, amount, root_element) {
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
    }
    return Crêpe2;
}());
function set_data(root_element, crepeId, crepeName, crepePreis) {
    if (crepeName == undefined && crepePreis == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name');
        crepePreis = (root_element.getAttribute('data-preis'));
        crepeId = (root_element.getAttribute('data-id'));
    }
    crepelist.push(new Crêpe2(Number(crepeId), crepeName, Number(crepePreis), 0, root_element));
    return;
}
/**
 * For formatting number to currency
 */
var formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
});
function set_color(crepe) {
    var attr = crepe.getAttribute('data-colour');
    if (attr == "" || attr == null) {
        return;
    }
    var colors = attr.split(",");
    var r = colors[0];
    var g = colors[1];
    var b = colors[2];
    crepe.style.backgroundColor = 'rgba(' + r + ',' + g + ',' + b + ', 0.5)';
}
