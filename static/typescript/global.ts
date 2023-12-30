var crepelist: Crêpe2[] = []

class Crêpe2 {
    id: number;
    name: string;
    preis: number;
    crepeId: string;
    amount: number;
    root_element: HTMLElement;

    constructor(id: string, name: string, preis: number, amount: number, root_element: HTMLElement) {
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
    }

    return_for_sending(): Map<string, string | number> {
        var map = new Map()
        map.set("name", this.name)
        map.set("preis", this.preis)
        map.set("amount", this.amount)
        return map;
    }
}

function set_data(root_element: HTMLElement, crepeId?, crepeName?: string, crepePreis?: number) {
    if (crepeName == undefined && crepePreis == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name')
        crepePreis = (root_element.getAttribute('data-preis')) as unknown as number
        crepeId = (root_element.getAttribute('data-id')) as unknown as number
    }
    crepelist.push(new Crêpe2(crepeId, crepeName, crepePreis, 1, root_element))
    return true;
}
/**
 * For formatting number to currency
 */
const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
})

function set_color(crepe: HTMLElement) {
    
    var attr = crepe.getAttribute('data-colour')
    if (attr == "" || attr == null) {
        return;
    }
    var colors = attr.split(",")
    var r = colors[0]
    var g = colors[1]
    var b = colors[2]
    crepe.style.backgroundColor = 'rgba(' + r + ',' + g + ',' + b + ', 0.5)'
}