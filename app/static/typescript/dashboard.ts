
var sales: SingularSale[] = [];

/**
 * Represents a singular Sale for the dashboard
 */
class SingularSale {
    time: string;
    id: number;
    name: string;
    price: number;
    amount: number;
    total: number;
    consumption: string;

    constructor (id: number, name: string, price: number, amount: number, time: string, consumption: string) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.amount = amount;
        this.total = this.price * this.amount;
        this.time = time;
    }
}

class SaleGroup {
    saleID: number;
    items: SingularSale[];
}

/**
 * 
 * @param url The relative uri endpoint where to fetch from
 * @returns The response, or false if the request fails
 */
async function get_data(url: string) {
    var result = await send_server(url, "GET")

    if (result.ok) {
        return await result.json();
    } else {
        throw Error("ALARM");
    }
}

