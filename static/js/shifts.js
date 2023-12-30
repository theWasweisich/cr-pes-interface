function get_time(time_str) {
    return new Date(time_str);
}
function get_time_since(str) {
    var current_time = new Date();
    var start_time = get_time(str);
    // @ts-expect-error
    var seconds = (current_time - start_time) / 1000;
    var minutes = seconds / 60;
    var hours = minutes / 60;
    var days = hours / 24;
    var in_future;
    if (seconds < 0) {
        in_future = true;
    }
    else {
        in_future = false;
    }
    return { "secons": seconds,
        "minutes": minutes,
        "hours": hours,
        "days": days };
}
function ev_Listener(elem) {
    var elapsed = elem.querySelector('p[data-fill="elapsed"]');
    var start_time = elem.querySelector('p[data-fill="start"]');
    console.log(elapsed);
    var times = get_time_since(start_time.innerHTML);
    elapsed.innerHTML = String(times);
}
