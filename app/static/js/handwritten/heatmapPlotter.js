// https://www.chartjs.org/docs

api_key = String(localStorage.getItem("auth"))

async function get_data(url) {
    var result = await fetch(url, {
        method: "GET",
        mode: "same-origin",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "X-crepeauth": api_key },
        redirect: "manual",
        referrerPolicy: "no-referrer",
    })

    if (result.ok) {
        return await result.json();
    } else {
        throw Error("ALARM");
    }
}

const graph = document.getElementById("salesHeatmap");

// Chart.defaults.backgroundColor = '#9BD0F5';
// Chart.defaults.borderColor = '#000';
// Chart.defaults.color = '#000';


async function render_graph() {
    var data_received = await get_data("/api/sales/heatmap")
    
    const chart = new Chart(graph, {
        type: 'bar',
        data: {
            labels: ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
            datasets: [{
                label: "Anzahl an Verkäufen",
                data: data_received,
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Uhrzeit'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Verkäufe'
                    }
                }
            },
            
        }
    });
    chart.options.scales.x.grid.display = false;
    chart.options.scales.y.grid.display = false;

}
