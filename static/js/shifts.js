var edit_dialog = document.getElementById("shift_editor");
function run_on_startup() {
    var shift_list = document.getElementById("shift_list");
    var shift_cards = document.querySelectorAll("div.shift_card");
    var intervals = [];
    for (var i = 0; i < shift_cards.length; i++) {
        var shift_card = shift_cards[i];
        update_time(shift_card, -1);
        var x = setInterval(this.update_time, 1000, shift_card, x);
    }
}
run_on_startup();
function update_time(elem, interval_id) {
    var elapsed = elem.querySelector('[data-type="elapsed"]');
    var count_result = countdown(elem);
    var elapsed_str = count_result[0];
    var elapsed_num = count_result[1];
    elapsed.innerHTML = elapsed_str;
    if (elapsed_num == 0 || elapsed_num == 1) {
        elem.classList.add("ago");
    }
    else if (elapsed_num == 2) {
        elem.classList.add("shortly");
    }
    else {
        elem.classList.add("far");
    }
    if (elapsed_num <= 1) {
        clearInterval(interval_id);
    }
}
/**
 * times:
 *
 *
 * - `0`: Long ago
 *
 * - `1`: Not so long ago
 *
 * - `2`: In near future
 *
 * - `3`: In far future
 *
 * ---
 *
 * @param root_elem The element of the shift
 * @returns 0 [string]: the string to put in || 1 [number]: The relative time to shift
 */
function countdown(root_elem) {
    var time = root_elem.querySelector("[data-type=\"start\"]").innerHTML;
    // Set the date we're counting down to
    var countDownDate = new Date(time).getTime();
    // Get today's date and time
    var now = new Date().getTime();
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    var past = false;
    if (Math.floor((distance % (1000 * 60)) / 1000) < 0) {
        past = true;
    }
    // Time calculations for days, hours, minutes and seconds
    var days = Math.abs(Math.floor(distance / (1000 * 60 * 60 * 24)));
    var hours = Math.abs(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    var minutes = Math.abs(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    var seconds = Math.abs(Math.floor((distance % (1000 * 60)) / 1000));
    if (days < 1) {
        var time_str = "<mark>" + days + "</mark> Tag <mark>" + hours + "</mark> Stunden <mark>" + minutes + "</mark> Minuten und <mark>" + seconds + "</mark> Sekunden ";
    }
    else {
        var time_str = "<mark>" + days + "</mark> Tage <mark>" + hours + "</mark> Stunden <mark>" + minutes + "</mark> Minuten und <mark>" + seconds + "</mark> Sekunden ";
    }
    var time_state = 1;
    // Output the result
    if (past && days >= 7) {
        time_str = "Seit längerem Vergangen";
        time_state = 0;
        return [time_str, time_state];
    }
    else if (!past && days <= 1) {
        time_state = 2;
    }
    else {
        time_state = 3;
    }
    if (past) {
        time_str = "Vergangen seit: " + time_str;
    }
    else {
        time_str = "Beginnt in: " + time_str;
    }
    return [time_str, time_state];
}
function creation_manager() {
    var shift_name = document.getElementById("shift_name");
    var shift_start = document.getElementById("time_start");
    var shift_duration = document.getElementById("duration");
    var name = shift_name.value;
    var start = shift_start.value;
    var duration = shift_duration.value;
    var abc = new Date(start);
    var diff = abc.getTime() - new Date().getTime();
    if (diff <= 0) {
        console.log("In Past!");
        shift_start.setCustomValidity("Schicht kann nicht in der Vergangenheit liegen!");
        shift_start.reportValidity();
        return;
    }
    console.group("New Shift");
    console.log("Shift-Name: ".concat(name));
    console.log("Shift-Start: ".concat(start));
    console.log("Start-Typ: ".concat(typeof (start)));
    console.log("Shift-Duration: ".concat(duration));
    console.groupEnd();
}
var Dialogs = /** @class */ (function () {
    function Dialogs() {
        this.root_dialog = document.getElementById("shift_editor");
        this.closer = document.getElementById("dialog_close");
        this.submitter = document.getElementById("dialog_create");
        this.duration_range = document.getElementById("duration");
        this.duration_input = document.getElementById("duration_2");
    }
    Dialogs.prototype.switch_type = function (dialog_type) {
        var title = this.root_dialog.querySelector('h2[ctype="header"]');
        switch (dialog_type) {
            case "creator": {
                console.log("Moin");
                title.innerText = "Neue Schicht erstellen";
                this.submitter.innerText = "Erstellen";
            }
            case "editor": {
                title.innerText = "Schicht Bearbeiten";
                this.submitter.innerText = "Bearbeiten";
            }
        }
    };
    return Dialogs;
}());
function prepare_dialog() {
    var opener = document.getElementById("open_creator");
    var closer = document.getElementById("dialog_close");
    var submitter = document.getElementById("dialog_create");
    var duration_range = document.getElementById("duration");
    opener.addEventListener('click', function () {
        edit_dialog.showModal();
    });
    closer.addEventListener('click', function () {
        edit_dialog.getElementsByTagName("form")[0].reset();
        edit_dialog.close();
    });
    submitter.addEventListener('click', function () {
        creation_manager();
    });
    var out = duration_range.parentElement.getElementsByTagName("output")[0];
    var dur_2 = document.getElementById("duration_2");
    duration_range.addEventListener('input', function () {
        dur_2.value = duration_range.value;
    });
    dur_2.addEventListener('input', function () {
        duration_range.value = duration_range.value;
    });
}
prepare_dialog();
/**
 * Makes Dialog closing work
 */
function dialog_outside_wrapper() {
    var dialog = edit_dialog;
    dialog.addEventListener('click', function (event) {
        var rect = dialog.getBoundingClientRect();
        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        console.log("HI");
        if (!isInDialog) {
            dialog.classList.add("warn");
            setTimeout(function () {
                dialog.classList.remove("warn");
            }, 500);
        }
    });
}
dialog_outside_wrapper();
/**
 * 1 Dialog für erstellen & bearbeiten. C-Type attribute, um den Text / die Funktion
 * entsprechend zu ändern
 */
