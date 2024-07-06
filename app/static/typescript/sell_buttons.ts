const btns_container = document.getElementById("sell_buttons") as HTMLElement

const payed = btns_container.querySelector('[data-function="payed"]') as HTMLButtonElement
const payback = btns_container.querySelector('[data-function="pay_back"]') as HTMLButtonElement
const own_consumption = btns_container.querySelector('[data-function="own_consumption"]') as HTMLButtonElement
const reset_button = btns_container.querySelector('[data-function="reset"]') as HTMLButtonElement

function set_listeners_up() {
    payed.addEventListener('click', () => {payed_func(false);})
    payback.addEventListener('click', change_dialog_handler)
    own_consumption.addEventListener('click', own_consumption_func)
    reset_button.addEventListener('click', reset_list_func)
}

async function send_sell_to_server(sale: Crêpe[] | string, own_consumption: boolean | string) {
    console.log("SENDING");
    let url: string = urls.newsale; // urls defined in global

    if (typeof (sale) == "string") {
        url = urls.resistor;
    }

    var headers: HeadersInit = {
        "Content-Type": "application/json",
        "ownConsumption": String(own_consumption),
        "X-crepeAuth": api_key,
    }

    console.log("Have to send!")

    var response = await fetch(url, {
        method: "POST",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: headers,
        redirect: "manual",
        referrerPolicy: "no-referrer",
        body: JSON.stringify(sale)
    })

    if (response.status == 200) {
        console.log("OK")
        return true;
    } else {
        console.log("NICHT OK")
        return false;
    }
}

async function payed_func(own_consumption: boolean = false) {

    function appendToLocalStorage(sold_crepes: Crêpe[]) {
        let current_sold = localStorage.getItem("sold");
        if (current_sold == null) {
            current_sold = "[]";
        }
        let current_json: object[] = JSON.parse(current_sold)

        // let to_storage: string[] = []
        let to_storage_str: string;

        for (let i = 0; i < sold_crepes.length; i++) {
            const crepe = sold_crepes[i];

            // to_storage.push(crepe.toString())
            current_json.push(crepe);
        }

        // to_storage_str = to_storage.join("|")

        to_storage_str = JSON.stringify(current_json);

        localStorage.setItem("sold", to_storage_str);
    }

    var crepes: Crêpe[] = table.return_for_sending();

    appendToLocalStorage(crepes);

    if (crepes.length == 0) {
        return
    }

    let response: boolean = false;
    response = await send_sell_to_server(crepes, own_consumption ? true : false);

    if (response) {
        setFavicon(true);
        reset_list_func();
        return true;
    } else {
        setFavicon(false)
        reset_list_func();
        return false;
    }
}

/**
 * 
 * @param state TRUE: normal favicon || FALSE: red favicon
 */
function setFavicon(state: boolean) {
    var link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (state) // If state == true, show normal Favicon
    {
        link.href = "/favicon.ico";
    }
    else // show red favicon
    {
        link.href = "/favicon_warn.ico";
    }
}


/**
 * Function to be called when the "Eigenverbrauch" Button is pressed
 */
function own_consumption_func() {
    console.log("Own consumption!")
    let own_consump = document.querySelector('[data-function="own_consumption"]') as HTMLButtonElement

    if (table.items.size < 1) {
        console.log("DA IS JA GARNIX!")
        own_consump.style.backgroundColor = "rgb(255, 0, 0)"
        setTimeout(() => {
            own_consump.style.backgroundColor = ""
        }, 100)
    }
    
    payed_func(true);
}

/**
 * The function called by the "Zurücksetzen" Button
 */
function reset_list_func() {
    table.remove_all_table_entries();
}

/**
 * Function to be called when there has been an error whilst transmitting the sale
 */
function fail_resistor() {
    var stored = localStorage.getItem('sold');
    var res = send_sell_to_server(stored, "emergencyTransmission");
    if (res) {
        connectionError = false;
        localStorage.removeItem('sold')
    }
}

/**
 * Shows red warning message, if transmission didn't work
 */
function trigger_alarm() {
    if (connectionError) {
        const alert = document.getElementById("popup-alert")
        alert.classList.add("activate")
        setTimeout(() => {
            alert.classList.remove("activate")
        }, 5000);
    }
}

/**
 * This function is used to handle the change "Rückgeld" dialog 😃
 */
function change_dialog_handler() {
    // console.debug("Need some change?")
    const dialog = document.getElementById("cashback-dialog-main") as HTMLDialogElement
    const dial_opener = document.querySelector('#sell_buttons>[data-function="pay_back"]') as HTMLButtonElement
    const payedDisplay = document.getElementById("cashback-payed") as HTMLInputElement
    const cashback_to_hand_out = document.getElementById("cashback-leftover") as HTMLInputElement
    const cashback_still_needed = document.getElementById("cashback-needed") as HTMLInputElement;
    
    var selectedValue: number = 0.0

    calculate_still_needed()
    
    dialog.addEventListener('click', (event) => {
        
        // Schließt den Dialog, wenn außerhalb geklickt wird
        var rect = dialog.getBoundingClientRect()
        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        
        if (!isInDialog) {
            close_dialog()
        }
    })

    dialog.addEventListener('click', (event) => {
        let eventElem = event.target as HTMLElement;

        if (eventElem.nodeName == "BUTTON") {

            if (eventElem.classList.contains("reset-btn")) {
                selectedValue = 0;
            } 

            else {
                let upperElem = eventElem.parentElement as HTMLElement
                let value = upperElem.getAttribute("data-value");
                let numValue = Number.parseInt(value);


                if (eventElem.classList.contains("overlay-add")) {
                    selectedValue += numValue;            
                }
                else if (eventElem.classList.contains("overlay-remove")) {
                    selectedValue -= numValue;
                }
            }

            if (selectedValue <= 0) {
                selectedValue = 0;
            }
            payedDisplay.value = currency_formatter.format(selectedValue);
            calculate_cashback();
        }
    })

    function calculate_cashback() {
        let to_cash_out = selectedValue - table.getTotalValue();
        let to_cash_out_formatted = currency_formatter.format(to_cash_out);
        if (to_cash_out <= 0) {
            to_cash_out_formatted = "-,-- €"
        }
        calculate_still_needed()

        cashback_to_hand_out.disabled = false;
        cashback_to_hand_out.value = to_cash_out_formatted;
        cashback_to_hand_out.disabled = true;
    }

    function calculate_still_needed() {
        let still_to_pay = selectedValue - table.getTotalValue();
        let still_to_pay_formatted = currency_formatter.format(still_to_pay);

        if (still_to_pay >= 0) {
            still_to_pay_formatted = "-,-- €"
        } else {
            still_to_pay_formatted = currency_formatter.format(Math.abs(still_to_pay));
        }

        cashback_still_needed.disabled = false;
        cashback_still_needed.value = still_to_pay_formatted;
        cashback_still_needed.disabled = true;
    }
    
    function open_dialog(): boolean {
        if (table.getTotalValue() == 0) {
            dial_opener.style.backgroundColor = "red";
            setTimeout(() => {
                dial_opener.style.backgroundColor = "";
            }, 100)
            return false;
        } else {
            dialog.showModal();
            return true;
        }
    }

    function close_dialog() { 
        try {
            dialog.close();
        } catch (error) {
            return false;
        }
        return true;
    }


    if (dialog.open) {
        return close_dialog()
    } else {
        // console.debug("Opening dialog!")
        return open_dialog()
    }

}