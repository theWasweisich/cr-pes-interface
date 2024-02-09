/**
 * This is used for importing the crêpes into the index html
 */


async function fetch_crepes() {
    let url = urls.getcrepes
    var res = await fetch(url, {
        method: "GET",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        redirect: "manual",
        referrerPolicy: "no-referrer",
    });

    if (res.ok) {
        console.log("Fetched crêpes, starting to insert now")
        return res.json()
    }
}

function insertCrêpes(name, price) {
    const container = document.getElementById("main-content") as HTMLElement
    const template = document.querySelector("template") as HTMLTemplateElement

    var clone = template.content.cloneNode(true)

    let body = clone as HTMLElement

    body.setAttribute("", "")

    container.appendChild(clone)
}