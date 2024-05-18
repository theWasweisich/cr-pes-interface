var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const btns_container = document.getElementById("sell_buttons");
const payed = btns_container.querySelector('[data-function="payed"]');
const payback = btns_container.querySelector('[data-function="pay_back"]');
const own_consumption = btns_container.querySelector('[data-function="own_consumption"]');
const reset_button = btns_container.querySelector('[data-function="reset"]');
function set_listeners_up() {
    payed.addEventListener('click', () => { payed_func(false); });
    payback.addEventListener('click', change_dialog_handler);
    own_consumption.addEventListener('click', own_consumption_func);
    reset_button.addEventListener('click', reset_list_func);
}
function send_sell_to_server(sale, own_consumption) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("SENDING");
        let url = urls.newsale; // urls defined in global
        if (typeof (sale) == "string") {
            url = urls.resistor;
        }
        var headers = {
            "Content-Type": "application/json",
            "ownConsumption": String(own_consumption),
            "X-crepeAuth": api_key,
        };
        console.log("Have to send!");
        var response = yield fetch(url, {
            method: "POST",
            mode: "same-origin",
            cache: "no-cache",
            credentials: "same-origin",
            headers: headers,
            redirect: "manual",
            referrerPolicy: "no-referrer",
            body: JSON.stringify(sale)
        });
        if (response.status == 200) {
            console.log("OK");
            return true;
        }
        else {
            console.log("NICHT OK");
            return false;
        }
    });
}
function payed_func() {
    return __awaiter(this, arguments, void 0, function* (own_consumption = false) {
        function appendToLocalStorage() {
            var current_sold = localStorage.getItem("sold");
            var to_storage = [];
            var to_storage_str;
            for (let i = 0; i < crepes.length; i++) {
                const crepe = crepes[i];
                to_storage.push(crepe.toString());
            }
            to_storage_str = to_storage.join("|");
            if (current_sold == null) {
                localStorage.setItem("sold", to_storage_str);
            }
            else {
                localStorage.setItem("sold", current_sold += to_storage_str);
            }
        }
        var crepes = table.return_for_sending();
        appendToLocalStorage();
        if (crepes.length == 0) {
            return;
        }
        let response = yield send_sell_to_server(crepes, own_consumption ? "own" : "foreign");
        if (response) {
            setFavicon(true);
            reset_list_func();
            return true;
        }
        else {
            setFavicon(false);
            reset_list_func();
            return false;
        }
    });
}
/**
 *
 * @param state TRUE: normal favicon || FALSE: red favicon
 */
function setFavicon(state) {
    var link = document.querySelector("link[rel~='icon']");
    if (state) // If state == true, show normal Favicon
     {
        link.href = "/favicon.ico";
    }
    else // else, show red favicon
     {
        link.href = "/favicon_warn.ico";
    }
}
/**
 * Function to be called when the "Eigenverbrauch" Button is pressed
 */
function own_consumption_func() {
    console.log("Own consumption!");
    let own_consump = document.querySelector('[data-function="own_consumption"]');
    if (table.items.size < 1) {
        console.log("DA IS JA GARNIX!");
        own_consump.style.backgroundColor = "rgb(255, 0, 0)";
        setTimeout(() => {
            own_consump.style.backgroundColor = "";
        }, 100);
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
        localStorage.removeItem('sold');
    }
}
/**
 * Shows red warning message, if transmission didn't work
 */
function trigger_alarm() {
    if (connectionError) {
        const alert = document.getElementById("popup-alert");
        alert.classList.add("activate");
        setTimeout(() => {
            alert.classList.remove("activate");
        }, 5000);
    }
}
/**
 * This function is used to handle the change "Rückgeld" dialog 😃
 */
function change_dialog_handler() {
    // console.debug("Need some change?")
    const dialog = document.getElementById("cashback-dialog-main");
    const dial_opener = document.querySelector('#sell_buttons>[data-function="pay_back"]');
    const payedDisplay = document.getElementById("cashback-payed");
    const cashback_to_hand_out = document.getElementById("cashback-leftover");
    const cashback_still_needed = document.getElementById("cashback-needed");
    var selectedValue = 0.0;
    calculate_still_needed();
    dialog.addEventListener('click', (event) => {
        // Schließt den Dialog, wenn außerhalb geklickt wird
        var rect = dialog.getBoundingClientRect();
        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        if (!isInDialog) {
            close_dialog();
        }
    });
    dialog.addEventListener('click', (event) => {
        let eventElem = event.target;
        if (eventElem.nodeName == "BUTTON") {
            if (eventElem.classList.contains("reset-btn")) {
                selectedValue = 0;
            }
            else {
                let upperElem = eventElem.parentElement;
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
            payedDisplay.value = formatter.format(selectedValue);
            calculate_cashback();
        }
    });
    function calculate_cashback() {
        let to_cash_out = selectedValue - table.getTotalValue();
        let to_cash_out_formatted = formatter.format(to_cash_out);
        if (to_cash_out <= 0) {
            to_cash_out_formatted = "-,-- €";
        }
        calculate_still_needed();
        cashback_to_hand_out.disabled = false;
        cashback_to_hand_out.value = to_cash_out_formatted;
        cashback_to_hand_out.disabled = true;
    }
    function calculate_still_needed() {
        let still_to_pay = selectedValue - table.getTotalValue();
        let still_to_pay_formatted = formatter.format(still_to_pay);
        if (still_to_pay >= 0) {
            still_to_pay_formatted = "-,-- €";
        }
        else {
            still_to_pay_formatted = formatter.format(Math.abs(still_to_pay));
        }
        cashback_still_needed.disabled = false;
        cashback_still_needed.value = still_to_pay_formatted;
        cashback_still_needed.disabled = true;
    }
    function open_dialog() {
        if (table.getTotalValue() == 0) {
            dial_opener.style.backgroundColor = "red";
            setTimeout(() => {
                dial_opener.style.backgroundColor = "";
            }, 100);
            return false;
        }
        else {
            dialog.showModal();
            return true;
        }
    }
    function close_dialog() {
        try {
            dialog.close();
        }
        catch (error) {
            return false;
        }
        return true;
    }
    if (dialog.open) {
        return close_dialog();
    }
    else {
        // console.debug("Opening dialog!")
        return open_dialog();
    }
}
