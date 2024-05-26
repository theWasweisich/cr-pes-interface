
var sales_data: Map<string, any>[] = []

/**
 * 
 * @param url The relative uri endpoint where to fetch from
 * @returns The response, or false if the request fails
 */
async function get_data(url: string): Promise<object> {
    var result = await send_server(url, "GET")

    if (result.ok) {
        return result;
    } else {
        throw Error("ALARM");
    }
}

async function init() {
    let data = await get_data(urls.getsales);
    if (!data) {
        throw Error("Keine Daten?")
    }
    let all_data = map_data(data);
    populate_with_all(all_data);
}

/**
 * Funktion nimmt `data` und verpackt alles in eine schönes Array :)
 * @param data Das von der fetch-Funktion erhaltene Objekt
 * @returns Ein Array mit allen Verkäufen, alles aufgedröselt
 */
function map_data(data: object) {
    let sales: Map<string, any>[] = []
    Object.keys(data).forEach(key => {
        let sale: Map<string, any> = new Map();
        let singularSale = data[key];

        switch (singularSale["ownConsumption"]) {
            case "false":
                sale.set("ownConsumption", false);
                break;
            case "true":
                sale.set("ownConsumption", true);
                break;
            case "unknown":
                sale.set("ownConsumption", "unknown");
            default:
                throw Error("ownConsumption hat einen ungültigen Wert! " + `${singularSale["ownConsumption"]}`);
        }

        sale.set("id", singularSale["id"]);
        sale.set("saleItems", map_sale_items(singularSale["saleItems"]));
        sale.set("saleTime", new Date(singularSale["saleTime"]));
        sale.set("total", Number(singularSale["total"]));

        sales.push(sale);
    })
    sales_data = sales
    return sales
}

function map_sale_items(items: any) {
    let s_items: Map<String, any>[] = []
    Object.keys(items).forEach(item => {
        let to_list: Map<String, any> = new Map()
        let saleitem = items[item];
        to_list.set("amount", Number(saleitem["amount"]));
        to_list.set("fullPrice", Number(saleitem["price"]));
        to_list.set("crepe_name", saleitem["crepe"]["name"]);
        to_list.set("crepe_single_price", saleitem["crepe"]["price"]);
        to_list.set("crepe_ingredients", saleitem["crepe"]["ingredients"]);

        s_items.push(to_list);
    })
    return s_items
}

function populate_with_all(map: Array<Map<string, any>>) {
    Object.keys(map).forEach(key => {
        let salesMap = map[key];
        populate_sales_table(salesMap);
    })
}

function saleDetailsDialogFunc(saleId: number) {
    const dialog = document.getElementById("saleDetailsDialog") as HTMLDialogElement;
    const template = dialog.querySelector("template");
    
    const tbody = dialog.querySelector("tbody");
    
    function closeDialog() {
        for (let i = 0; i < tbody.children.length; i++) {
            const child = tbody.children[i];
            child.remove();
        }
        dialog.close();
    }

    dialog.addEventListener('click', (event) => {
        event.stopPropagation();

        var rect = dialog.getBoundingClientRect()
        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            closeDialog();
        }
    })

    if (dialog.open) {
        closeDialog();
    } else {
        dialog.showModal();
    }

    
    sales_data.forEach(sale_map => {
        let all_crepes = sale_map.get("saleItems") as Array<Map<string, any>>;
        all_crepes.forEach(crepe => {
            let clone = template.content.cloneNode(true) as HTMLElement;
            let crêpeAmount = Number(crepe.get("amount"));
            let fullPrice = Number(crepe.get("fullPrice"));
            let crepe_name = crepe.get("crepe_name");
            let crepe_single_price = Number(crepe.get("crepe_single_price"));
            let crepe_ingredients = crepe.get("crepe_ingredients");             // TODO: Das könnte noch irgendwie verwendet werden irgendwo?
            
            clone.querySelector('td[data-cell="amount"]').innerHTML = String(crêpeAmount);
            clone.querySelector('td[data-cell="name"]').innerHTML = crepe_name;
            clone.querySelector('td[data-cell="singlePrice"]').innerHTML = currency_formatter.format(crepe_single_price);
            clone.querySelector('td[data-cell="combinedPrice"]').innerHTML = currency_formatter.format(fullPrice);

            tbody.appendChild(clone);
        });
    });
}

function populate_sales_table(sale: Map<string, any>) {
    let tableBody = document.getElementById("sales-tbody") as HTMLTableElement;
    let template = document.getElementById("saleTable_template") as HTMLTemplateElement;

    const clone = template.content.cloneNode(true) as HTMLElement;
    const row = clone.querySelector("tr");

    let saleTime = format_time(sale.get("saleTime"))
    let total = format_money(sale.get("total"))

    let saleId = sale.get("id");

    row.setAttribute("data-id", saleId);
    row.querySelector('td[data-cell="Time"]').innerHTML = saleTime
    row.querySelector('td[data-cell="Revenue"]').innerHTML = total

    let detailsBtn = row.querySelector('td[data-cell="Details"]') as HTMLTableCellElement;
    detailsBtn.setAttribute("onclick", `saleDetailsDialogFunc(${saleId});`)

    tableBody.appendChild(row);
}

function format_time(time: Date) { return time_formatter.format(time) }
function format_money(money: number) { return currency_formatter.format(money) }