
class SingleSale {
    constructor(id: number, saleTime: Date, total: number, ownConsumption: boolean | "unknown") {
        
    }
}

/**
 * 
 * @param url The relative uri endpoint where to fetch from
 * @returns The response, or false if the request fails
 */
async function get_data(url: string): Promise<Response> {
    var result = await send_server(url, "GET")

    if (result.ok) {
        return result;
    } else {
        throw Error("ALARM");
    }
}

async function init() {
    let data = await get_data("/api/sales/get");
    console.log(data);
    document.getElementById("testing").innerHTML = String(data);
}

function populate_sales_table(sale) {
    let tableBody = document.getElementById("sales-tbody") as HTMLTableElement;
    let template = document.getElementById("saleTable_template") as HTMLTemplateElement;

    const clone = template.content.cloneNode(true) as HTMLElement;
    const row = clone.querySelector("tr");
    
}