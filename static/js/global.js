var crepelist = [];
var Crêpe2 = /** @class */ (function () {
    function Crêpe2(id, name, preis, amount, root_element) {
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
    }
    Crêpe2.prototype.return_for_sending = function () {
        var map = new Map();
        map.set("name", this.name);
        map.set("preis", this.preis);
        map.set("amount", this.amount);
        return map;
    };
    return Crêpe2;
}());
function set_data(root_element, crepeId, crepeName, crepePreis) {
    if (crepeName == undefined && crepePreis == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name');
        crepePreis = (root_element.getAttribute('data-preis'));
        crepeId = (root_element.getAttribute('data-id'));
    }
    crepelist.push(new Crêpe2(crepeId, crepeName, crepePreis, 1, root_element));
    return true;
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
