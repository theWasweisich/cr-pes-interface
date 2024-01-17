var crepelist: Crêpe2[] = []

class Crêpe2 {
    id: number;
    name: string;
    preis: number;
    crepeId: number;
    amount: number;
    root_element: HTMLElement;

    constructor(id: number, name: string, preis: number, amount: number, root_element: HTMLElement) {
        this.crepeId = id;
        this.name = name;
        this.preis = preis;
        this.amount = amount;
        this.root_element = root_element;
    }
}

function set_data(root_element: HTMLElement, crepeId?: string, crepeName?: string, crepePreis?: number) {
    if (crepeName == undefined && crepePreis == undefined && crepeId == undefined) {
        crepeName = root_element.getAttribute('data-name')
        crepePreis = (root_element.getAttribute('data-preis')) as unknown as number
        crepeId = (root_element.getAttribute('data-id'))
    }

    crepelist.push(new Crêpe2(Number(crepeId), crepeName, Number(crepePreis), 0, root_element))
    return;
}

/**
 * For formatting number to currency
 */
const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
})