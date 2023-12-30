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
