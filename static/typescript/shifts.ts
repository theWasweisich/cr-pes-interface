var dialog = document.getElementById("shift_creator") as HTMLDialogElement


function run_on_startup() {
    var shift_list = document.getElementById("shift_list") as HTMLElement
    var shift_cards = document.querySelectorAll("div.shift_card") as NodeListOf<HTMLElement>

    var intervals: number[] = [];

    for (let i = 0; i < shift_cards.length; i++) {
        const shift_card = shift_cards[i] as HTMLElement;
        

        var x = setInterval(this.update_time, 1000, shift_card)
    }
}

run_on_startup()

function update_time(elem: HTMLElement) {
    var elapsed = elem.querySelector('[data-type="elapsed"]');

    var in_past: boolean = false;
    var elapsed_str: string = countdown(elem)
    if (elapsed_str.startsWith("Vergangen")) {
        in_past = true
        elem.style.backgroundColor = "darkred;"
    }

    elapsed.innerHTML = elapsed_str
}

function countdown(root_elem: HTMLElement): string {

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
    // Output the result
    if (past) {
        time_str = "Vergangen seit: " + time_str
    } else {
        time_str = "Beginnt in: " + time_str
    }
    return time_str
}



function dialog_manager() {
    const shift_name = document.getElementById("shift_name") as HTMLInputElement
    const shift_start = document.getElementById("time_start") as HTMLInputElement
    const duration = document.getElementById("duration") as HTMLInputElement
    
    console.group("New Shift")
    console.log(`Shift-Name: ${shift_name.value}`)
    console.log(`Shift-Start: ${shift_start.value}`)
    console.log(`Shift-Duration: ${duration.value}`)
    console.groupEnd()

    dialog.close()

}

function prepare_dialog() {
    const opener = document.getElementById("open_creator") as HTMLButtonElement
    const closer = document.getElementById("dialog_close") as HTMLButtonElement
    const submitter = document.getElementById("dialog_create") as HTMLButtonElement
    const duration_range = document.getElementById("duration") as HTMLInputElement
    
    opener.addEventListener('click', function() {
        dialog.showModal()
    })
    closer.addEventListener('click', function() {
        dialog.getElementsByTagName("form")[0].reset()
        dialog.close()
    })
    submitter.addEventListener('click', function() {
        dialog.getElementsByTagName("form")[0].reset()
        dialog_manager();
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