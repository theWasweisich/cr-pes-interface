function get_time(time_str) {
    return new Date(time_str);
}
function get_time_since(str) {
    var current_time = new Date();
    var start_time = get_time(str);
    // @ts-expect-error
    var elapsed = (current_time - start_time) / 1000;
    var minutes = elapsed / 60;
    var hours = minutes / 60;
    return elapsed;
}
