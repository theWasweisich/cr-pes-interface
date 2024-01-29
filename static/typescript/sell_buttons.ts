const btns_container = document.getElementById("sell_buttons") as HTMLElement

const payed = btns_container.querySelector('[data-function="payed"]') as HTMLButtonElement
const payback = btns_container.querySelector('[data-function="pay_back"]') as HTMLButtonElement
const own_consumption = btns_container.querySelector('[data-function="own_consumption"]') as HTMLButtonElement
const reset_button = btns_container.querySelector('[data-function="reset"]') as HTMLButtonElement

async function send_sell_to_server(sale: Crêpe[] | string) {
    console.log("SENDING");
    
    var response = await fetch(urls["newSale"], { // url defined in global
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

    function appendToLocalStorage() {
        var current_sold = localStorage.getItem("sold")
        
        var to_storage: string[] = []
        var to_storage_str: string;
        
        for (let i = 0; i < crepes.length; i++) {
            const crepe = crepes[i];
            
            to_storage.push(crepe.toString())
        }
        
        to_storage_str = to_storage.join("|")
        
        if (current_sold == null) {
            localStorage.setItem("sold", to_storage_str);        
        } else {
            localStorage.setItem("sold", current_sold += to_storage_str);
        }
    }

    var crepes: Crêpe[] = table.return_for_sending();

    appendToLocalStorage();

    if (crepes.length == 0) {
        return
    }

    let response = await send_sell_to_server(crepes);

    if (response) {
        reset_list_func();
        return true;
    } else {
        connectionError = true;
        reset_list_func();
        return false;
    };
}

/**
 * 
 * @param state TRUE: normal favicon || FALSE: red favicon
 */
function setFavicon(state: boolean) {
    var link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (state) // If state == true, show normal Favicon
    {
        link.href = "./favicon.ico"
    }
    else // else, show red favicon
    {

    }
}

function payback_func() {
    
}

function own_consumption_func() {
    
}

function reset_list_func() {
    table.remove_all_table_entries();
}

function fail_resistor() {
    var stored = localStorage.getItem('sold');
    var res = send_sell_to_server(stored);
    if (res) {
        connectionError = false;
        localStorage.removeItem('sold')
    }
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
    reset_button.addEventListener('click', reset_list_func)
}

set_listeners_up();