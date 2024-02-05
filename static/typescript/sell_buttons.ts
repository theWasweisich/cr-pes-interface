const btns_container = document.getElementById("sell_buttons") as HTMLElement

const payed = btns_container.querySelector('[data-function="payed"]') as HTMLButtonElement
const payback = btns_container.querySelector('[data-function="pay_back"]') as HTMLButtonElement
const own_consumption = btns_container.querySelector('[data-function="own_consumption"]') as HTMLButtonElement
const reset_button = btns_container.querySelector('[data-function="reset"]') as HTMLButtonElement

function set_listeners_up() {
    payed.addEventListener('click', payed_func)
    payback.addEventListener('click', payback_func)
    own_consumption.addEventListener('click', own_consumption_func)
    reset_button.addEventListener('click', reset_list_func)
}

set_listeners_up();

async function send_sell_to_server(sale: Crêpe[] | string) {
    console.log("SENDING");
    let url: string = urls.newSale;

    if (typeof (sale) == "string") {
        url = urls.resistor;
    }


    var response = await fetch(url, { // url defined in global
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
        link.href = "/favicon.ico"
    }
    else // else, show red favicon
    {
        link.href = "/favicon_warn.ico";
    }
}



function payback_func() {
    change_dialog_handler();
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

/**
 * This function is used to handle the change "Rückgeld" dialog 😃
 */
function change_dialog_handler() {
    console.debug("Need some change?")
    const dialog = document.getElementById("cashback-dialog-main") as HTMLDialogElement
    
    function open_dialog() {
        if (table.getTotalValue() == 0) {
            return -1;
        } else {
            dialog.showModal();
            return 1;
        }
    }

    function close_dialog() { 
        dialog.close();
    }


    if (dialog.open) {
        console.debug("Dialog already open! Doin' nothin'")
        return close_dialog()
    } else {
        console.debug("Opening dialog!")
        return open_dialog()
    }


    table.getTotalValue()
}