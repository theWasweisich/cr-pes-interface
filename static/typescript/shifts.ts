var creation_dialog = document.getElementById("shift_creator") as HTMLDialogElement
var edit_dialog = document.getElementById("shift_editor") as HTMLDialogElement

function run_on_startup() {
    var shift_list = document.getElementById("shift_list") as HTMLElement
    var shift_cards = document.querySelectorAll("div.shift_card") as NodeListOf<HTMLElement>

    var intervals: number[] = [];

    for (let i = 0; i < shift_cards.length; i++) {
        const shift_card = shift_cards[i] as HTMLElement;
        
        update_time(shift_card, -1)
        var x = setInterval(this.update_time, 1000, shift_card, x)
    }
}

run_on_startup()

function update_time(elem: HTMLElement, interval_id: number) {
    var elapsed = elem.querySelector('[data-type="elapsed"]');


    var count_result: [string, number] = countdown(elem)
    var elapsed_str: string = count_result[0]
    var elapsed_num: number = count_result[1]

    elapsed.innerHTML = elapsed_str
    if (elapsed_num == 0 || elapsed_num == 1)
    {
        elem.classList.add("ago")

    } else if (elapsed_num == 2) 
    {
        elem.classList.add("shortly")

    } else 
    {
        elem.classList.add("far")
    }


    if (elapsed_num <= 1) {
        clearInterval(interval_id)
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
function countdown(root_elem: HTMLElement): [string, number] {

    var time = root_elem.querySelector("[data-type=\"start\"]").innerHTML
    // Set the date we're counting down to
    var countDownDate = new Date(time).getTime();

    // Get today's date and time
    var now = new Date().getTime();
    
    // Find the distance between now and the count down date
    var distance = countDownDate - now;
    var past: boolean = false
    if (Math.floor((distance % (1000 * 60)) / 1000) < 0) {
        past = true
    }
    
    // Time calculations for days, hours, minutes and seconds
    var days = Math.abs(Math.floor(distance / (1000 * 60 * 60 * 24)));
    var hours = Math.abs(Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    var minutes = Math.abs(Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)));
    var seconds = Math.abs(Math.floor((distance % (1000 * 60)) / 1000));

    if (days < 1) {
        var time_str = "<mark>" + days + "</mark> Tag <mark>" + hours + "</mark> Stunden <mark>" + minutes + "</mark> Minuten und <mark>" + seconds + "</mark> Sekunden ";
    } else {
        var time_str = "<mark>" + days + "</mark> Tage <mark>" + hours + "</mark> Stunden <mark>" + minutes + "</mark> Minuten und <mark>" + seconds + "</mark> Sekunden ";
    }
    var time_state: number = 1

    // Output the result
    if (past && days >= 7)
    {
        time_str = "Seit längerem Vergangen"
        time_state = 0
        return [time_str, time_state]
    }
    else if (!past && days <= 1) 
    {
        time_state = 2
    } else 
    {
        time_state = 3
    }
    
    if (past) {
        time_str = "Vergangen seit: " + time_str
    } else {
        time_str = "Beginnt in: " + time_str
    }
    return [time_str, time_state]
}

function creation_manager() {
    const shift_name = document.getElementById("shift_name") as HTMLInputElement
    const shift_start = document.getElementById("time_start") as HTMLInputElement
    const shift_duration = document.getElementById("duration") as HTMLInputElement
    var form = creation_dialog.getElementsByTagName("form")[0] as HTMLFormElement

    var name = shift_name.value
    var start = shift_start.value
    var duration = shift_duration.value

    var abc = new Date(start)
    var diff = abc.getTime() - new Date().getTime()

    if (diff <= 0) {
        console.log("In Past!")
        shift_start.setCustomValidity("Schicht kann nicht in der Vergangenheit liegen!")
        shift_start.reportValidity();
        return
    }
    
    console.group("New Shift")
    console.log(`Shift-Name: ${name}`)
    console.log(`Shift-Start: ${start}`)
    console.log(`Start-Typ: ${typeof(start)}`);
    console.log(`Shift-Duration: ${duration}`)
    console.groupEnd()

    form.reset()
    creation_dialog.close()

}

class PrepareDialog {
    opener: HTMLButtonElement
    closer: HTMLButtonElement
    submitter: HTMLButtonElement
    duration_range: HTMLInputElement

    constructor(root: HTMLDialogElement) {
        
    }
}

function prepare_dialog() {
    const opener = document.getElementById("open_creator") as HTMLButtonElement
    const closer = document.getElementById("dialog_close") as HTMLButtonElement
    const submitter = document.getElementById("dialog_create") as HTMLButtonElement
    const duration_range = document.getElementById("duration") as HTMLInputElement
    
    opener.addEventListener('click', function() {
        creation_dialog.showModal()
    })
    
    closer.addEventListener('click', function() {
        creation_dialog.getElementsByTagName("form")[0].reset()
        creation_dialog.close()
    })

    submitter.addEventListener('click', function() {
        creation_manager();
    })

    const out = duration_range.parentElement.getElementsByTagName("output")[0]
    const dur_2 = document.getElementById("duration_2") as HTMLInputElement


    duration_range.addEventListener('input', function() {
        dur_2.value = duration_range.value
    })
    dur_2.addEventListener('input', function() {
        duration_range.value = duration_range.value
    })
}

prepare_dialog()

const dialogs = document.getElementsByTagName("dialog")

/**
 * Makes Dialogs work
 */
for (let i = 0; i < dialogs.length; i++) {
    const dialog = dialogs[i];
    
    dialog.addEventListener('click', function(event) {
        var rect = dialog.getBoundingClientRect()
        var isInDialog = (rect.top <= event.clientY && event.clientY <= rect.top + rect.height &&
            rect.left <= event.clientX && event.clientX <= rect.left + rect.width);
        console.log("HI")
        if (!isInDialog) {
            dialog.classList.add("warn")
            setTimeout(() => {
                dialog.classList.remove("warn")
            }, 500)
        }
    })
}

/**
 * 1 Dialog für erstellen & bearbeiten. C-Type attribute, um den Text / die Funktion
 * entsprechend zu ändern
 */