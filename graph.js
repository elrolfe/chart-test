const stateCodeToName = {
    AL: "Alabama",
    AK: "Alaska",
    AZ: "Arizona",
    AR: "Arkansas",
    CA: "California",
    CO: "Colorado",
    CT: "Connecticut",
    DE: "Delaware",
    DC: "Washington D.C.",
    FL: "Florida",
    GA: "Georgia",
    HI: "Hawaii",
    ID: "Idaho",
    IL: "Illinois",
    IN: "Indiana",
    IA: "Iowa",
    KS: "Kansas",
    KY: "Kentucky",
    LA: "Louisiana",
    ME: "Maine",
    MD: "Maryland",
    MA: "Massachusetts",
    MI: "Michigan",
    MN: "Minnesota",
    MS: "Mississippi",
    MO: "Missouri",
    MT: "Montana",
    NE: "Nebraska",
    NV: "Nevada",
    NH: "New Hampshire",
    NJ: "New Jersey",
    NM: "New Mexico",
    NY: "New York",
    NC: "North Carolina",
    ND: "North Dakota",
    OH: "Ohio",
    OK: "Oklahoma",
    OR: "Oregon",
    PA: "Pennsylvania",
    RI: "Rhode Island",
    SC: "South Carolina",
    SD: "South Dakota",
    TN: "Tennesee",
    TX: "Texas",
    UT: "Utah",
    VT: "Vermont",
    VA: "Virginia",
    WA: "Washington",
    WV: "West Virginia",
    WI: "Wisconsin",
    WY: "Wyoming"
};

let totalSelectedItems = [
    { borderColor: "rgb(54, 162, 235)", backgroundColor: "rgba(54, 162, 235, 0.5)", active: true },
    { borderColor: "rgb(255, 99, 132)", backgroundColor: "rgba(255, 99, 132, 0.5)", active: true },
    { borderColor: "rgb(255, 159, 64)", backgroundColor: "rgba(255, 159, 64, 0.5)", active: true },
    { borderColor: "rgb(75, 192, 192)", backgroundColor: "rgba(75, 192, 192, 0.5)", active: true },
    { borderColor: "rgb(153, 102, 255)", backgroundColor: "rgba(153, 102, 255, 0.5)", active: true },
];

let stockSelectedItems = [
    { borderColor: "rgb(54, 162, 235)", backgroundColor: "rgba(54, 162, 235, 0.5)", active: true },
    { borderColor: "rgb(255, 99, 132)", backgroundColor: "rgba(255, 99, 132, 0.5)", active: true },
    { borderColor: "rgb(255, 159, 64)", backgroundColor: "rgba(255, 159, 64, 0.5)", active: true },
    { borderColor: "rgb(75, 192, 192)", backgroundColor: "rgba(75, 192, 192, 0.5)", active: true },
    { borderColor: "rgb(153, 102, 255)", backgroundColor: "rgba(153, 102, 255, 0.5)", active: true },
];

const ctxTotal = document.getElementById("sample-totals");
const ctxStock = document.getElementById("sample-stock");

let totalData = [];
let stockData = [];
let chartLabels = [];

let totalChart;
let stockChart;

function getQuarter(value) {
    let year = parseInt(value);
    let qv = (value * 100) % 100;
    switch (qv) {
        case 0: return `Q1 ${year}`;
        case 25: return `Q2 ${year}`;
        case 50: return `Q3 ${year}`;
        case 75: return `Q4 ${year}`;
        default: return `Unknown Quarter Value: ${value}`;
    }
}

function onChangeSelection(e) {
    let key = e.target.getAttribute("id");
    
    if (e.target.checked) {
        let index = totalSelectedItems.findIndex(d => !d.active);
        if (index === -1) {
            e.target.checked = false;
            alert("A maximum of 5 states may be selected.");
        } else {
            totalSelectedItems[index] = Object.assign(totalSelectedItems[index], totalData.find(d => d.key === key));
            totalSelectedItems[index].active = true;

            stockSelectedItems[index] = Object.assign(stockSelectedItems[index], stockData.find(d => d.key === key));
            stockSelectedItems[index].active = true;
        }
    } else {
        totalSelectedItems.find(d => d.key === key).active = false;
        stockSelectedItems.find(d => d.key === key).active = false;
        }

    updateCharts();
}

function updateCharts() {
    if (!totalChart) {
        let totalChartConfig = {    
            type: "line",
            data: {
                labels: chartLabels,
                datasets: totalSelectedItems.filter(d => d.active)
            }
        }

        let stockChartConfig = {
            type: "line",
            data: {
                labels: chartLabels,
                datasets: stockSelectedItems.filter(d => d.active)
            }
        }

        totalChart = new Chart(ctxTotal, totalChartConfig);
        stockChart = new Chart(ctxStock, stockChartConfig);
    } else {
        totalChart.data.datasets = totalSelectedItems.filter(d => d.active);
        stockChart.data.datasets = stockSelectedItems.filter(d => d.active);

        totalChart.update();
        stockChart.update();
    }
}

document.querySelectorAll("input[type='checkbox']").forEach(cb => {
    cb.checked = false;
    cb.addEventListener("change", onChangeSelection);
})

fetch("time_series.json").then(data => data.json()).then(data => {
    let initialize = true;

    Object.keys(data).forEach(key => {
        let totalValues = [];
        let stockValues = [];

        data[key].data.filter(f => f.YearQuarter > 2017.5 && f.YearQuarter < 2023.75).forEach(d => {
            if (initialize) {
                chartLabels.push(getQuarter(d.YearQuarter));
            }

            totalValues.push(Math.max(d.TotalQuarterProd, 0));
            stockValues.push(Math.max(d.StocksOnHand, 0));
        });

        totalData.push({
            key: key,
            sum: totalValues.reduce((acc, val) => val + acc),
            label: stateCodeToName[key],
            data: totalValues,
            fill: false,
        });

        stockData.push({
            key: key,
            sum: stockValues.reduce((acc, val) => val + acc),
            label: stateCodeToName[key],
            data: stockValues,
            fill: false,
        });

        initialize = false;
    });

    totalData.sort((a, b) => b.sum - a.sum);
    stockData.sort((a, b) => b.sum - a.sum);

    for (let i = 0; i < 5; i++) {
        let key = totalData[i].key;

        totalSelectedItems[i] = Object.assign(totalSelectedItems[i], totalData[i]);
        stockSelectedItems[i] = Object.assign(stockSelectedItems[i], stockData.find(d => d.key === key));

        let cb = document.getElementById(key);
        cb.checked = true;
    }

    updateCharts();
});