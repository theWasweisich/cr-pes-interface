const btns_container = document.getElementById("sell_buttons") as HTMLElement

const payed = btns_container.querySelector('[data-function="payed"]') as HTMLButtonElement
const payback = btns_container.querySelector('[data-function="pay_back"]') as HTMLButtonElement
const own_consumption = btns_container.querySelector('[data-function="own_consumption"]') as HTMLButtonElement

async function send_sell_to_server(sale: Crêpe2[]) {
    console.log("SENDING");
    
    var response = await fetch("/api/sold", {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "manual",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(sale)
    })

    if (response.ok) {
        console.log("OK")
        return true;
    } else {
        console.log("NICHT OK")
        return false;
    }
}

async function payed_func() {
    var crepes: Crêpe2[] = table.return_for_sending();

    if (crepes.length == 0) {
        return
    }

    
    var current_sold = localStorage.getItem("sold")
    
    var to_storage: string[] = []
    var to_storage_str: string;
    
    for (let i = 0; i < crepes.length; i++) {
        const crepe = crepes[i];
        
        to_storage.push(crepe.toString())
    }
    
    to_storage_str = to_storage.join("|")
    
    if (current_sold == null) {
        localStorage.setItem("sold: ", to_storage_str);        
    } else {
        localStorage.setItem("sold: ", current_sold += to_storage_str);
    }
    let response = await send_sell_to_server(crepes);

    if (response) {
        table.remove_all_table_entries(); // wohnt in ./index.ts
        return true;
    } else {
        return false;
    };
}

function payback_func() {
    
}

function own_consumption_func() {
    
}

function trigger_alarm() {
    const alert = document.getElementById("popup-alert")
    alert.classList.add("activate")
    setTimeout(() => {
        alert.classList.remove("activate")
    }, 5000);
}

function set_listeners_up() {
    payed.addEventListener('click', payed_func)
    payback.addEventListener('click', payback_func)
    own_consumption.addEventListener('click', own_consumption_func)
}

set_listeners_up();