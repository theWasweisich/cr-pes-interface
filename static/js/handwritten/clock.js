const clock = document.getElementById("clock");

function alignClock() {
    var interval = setInterval(() => {
        var secs = new Date().getUTCSeconds();
        if (secs == 1) {
            // console.log("First second!")
            clearInterval(secs);
            setInterval(setTime, 30_000) // Call setTime every 30 seconds
        }
    }, 10)
}


function setTime() {
    // console.log("Clock test")
    var date = new Date();

    var hours = date.getHours();
    var mins = date.getMinutes();

    if (hours < 10) {
        var hours = "0" + String(hours);
    }
    if (mins < 10) {
        var mins = "0" + String(mins);
    }

    clock.innerText = `${hours}:${mins} Uhr`;
}

setTime()
alignClock()