async function authenticate() {
    const psswd = document.getElementById("auth").value
    console.log(psswd)
    let res = await fetch("/init", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({"auth": psswd})
    })
    const resp = await res.json();
    console.log(resp);
    if (res.ok) {
        response = resp;
        console.log(response);

        localStorage.setItem("auth", response["key"])

        window.location.assign("/");
    } else {
        window.location.assign("/init");
    }
}