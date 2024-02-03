
var sales: SingularSale[] = [];

class SingularSale {
    time: string;
    id: number;
    name: string;
    price: number;
    amount: number;
    total: number;

    constructor (id: number, name: string, price: number, amount: number, time: string) {
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
    var result = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "manual",
        referrerPolicy: "no-referrer",
    })

    if (result.ok) {
        return await result.json();
    } else {
        throw Error("ALARM");
    }
}

async function load_sales() {
    var answer = await get_data("/api/getsales/sales");
    console.log(answer)
    if (answer == false) {
        throw Error("Das hat leider nicht funktioniert! (Fehler #1)")
    }
    
    Object.keys(answer).forEach(key => {
        var total: number = 0;
        var value = answer[key];
        value.items.forEach(item => {
            total+= item.price * item.amount;
            sales.push(new SingularSale(item.ID, item.Name, item.price, item.amount, value.time))
            add_sale_to_table(value.time, item.ID, item.Name, item.amount, item.price);
        });
        add_total_row(total);
    });

    calculate_complete_total();
}

function add_total_row(total: number) {
    const table = document.getElementById("sales") as HTMLTableElement;
    const total_row = table.insertRow();
    for (let i = 0; i < 3; i++) {
        total_row.insertCell();
    }
    var a = total_row.insertCell()
    a.innerText = "Total: " + formatter.format(total);
    total_row.classList.add("endOfSale")
}


function add_sale_to_table(time: string, id: number, crepe: string, amount: number, price: number) {
    const table = document.getElementById("sales-tbody") as HTMLTableElement;
    var row = table.insertRow();
    row.setAttribute("data-sale", `${id}`)
    
    var rowTime = row.insertCell()
    var rowName = row.insertCell()
    var rowAmount = row.insertCell()
    var rowPrice = row.insertCell()

    rowTime.setAttribute("data-cell", "TIME")
    rowName.setAttribute("data-cell", "CrepeName")
    rowAmount.setAttribute("data-cell", "Amount")
    rowPrice.setAttribute("data-cell", "Price")

    var time_ = new Date(time)

    console.log(time_.toUTCString())

    rowTime.innerText = time_.toLocaleString("de-DE", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        era: "long" // ist ja immer noch EVANGELISCHE Jugendschaft zugvogel :)
    });
    rowName.innerText = crepe;
    rowAmount.innerText = String(amount) + "x";
    rowPrice.innerText = formatter.format(price);
}

function calculate_complete_total() {
    var global_total = 0;
    sales.forEach(sale => {
        global_total += sale.total
    });
    var globalTotalElemValue = (document.getElementById("global-total") as HTMLElement).querySelector("span") as HTMLElement;

    globalTotalElemValue.innerText = formatter.format(global_total);

    trigger_heatmap()
}

function trigger_heatmap() {
    const script_elem = document.createElement("script");
    script_elem.innerText = "render_graph()";
    document.body.appendChild(script_elem);
}