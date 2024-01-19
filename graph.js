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
    MN: "Minnisota",
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

let selected = {
    CA: true,
    DE: false,
    HI: false,
    MI: true,
    MT: false,
    NE: false,
    NM: true,
    OK: false,
    RI: false,
    TN: false
};

let _colors = [
    { color: "rgb(54, 162, 235)", background: "rgba(54, 162, 235, 0.5)", active: false },
    { color: "rgb(255, 99, 132)", background: "rgba(255, 99, 132, 0.5)", active: false },
    { color: "rgb(255, 159, 64)", background: "rgba(255, 159, 64, 0.5)", active: false },
    { color: "rgb(75, 192, 192)", background: "rgba(75, 192, 192, 0.5)", active: false },
    { color: "rgb(153, 102, 255)", background: "rgba(153, 102, 255, 0.5)", active: false },
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
    let id = e.target.getAttribute("id");
    selected[id] = !selected[id];

    if (Object.values(selected).filter(v => v).length > 5) {
        selected[id] = false;
        e.target.checked = false;
        alert("A maximum of 5 states may be selected at once.");
    } else
        updateCharts();
}

function updateCharts() {
    if (!totalChart) {
        Object.keys(selected).forEach(key => {
            if (selected[key]) {
                let index = totalData.findIndex(d => d.key === key);

                index = stockData.findIndex(d => d.key === key);
            }
        });

        let totalChartConfig = {    
            type: "line",
            data: {
                labels: chartLabels,
                datasets: totalData.filter(d => selected[d.key])
            }
        }

        let stockChartConfig = {
            type: "line",
            data: {
                labels: chartLabels,
                datasets: stockData.filter(d => selected[d.key])
            }
        }

        totalChart = new Chart(ctxTotal, totalChartConfig);
        stockChart = new Chart(ctxStock, stockChartConfig);
    } else {
        Object.keys(selected).forEach(key => {
            if (selected[key]) {
                if (!totalChart.data.datasets.find(d => d.key === key)) {
                    let data = totalData.find(d => d.key === key);
                    totalChart.data.datasets.push(data)
                }

                if (!stockChart.data.datasets.find(d => d.key === key)) {
                    let data = stockData.find(d => d.key === key);
                    stockChart.data.datasets.push(data);
                }
            } else {
                let index = totalChart.data.datasets.findIndex(d => d.key === key);
                if (index !== -1) {
                    totalChart.data.datasets.splice(index, 1);
                }

                index = stockChart.data.datasets.findIndex(d => d.key === key);
                if (index !== -1) {
                    stockChart.data.datasets.splice(index, 1);
                }
            }
        });

        totalChart.update();
        stockChart.update();
    }
}

Object.keys(selected).forEach(key => {
    let cb = document.getElementById(key);
    if (selected[key])
        cb.setAttribute("checked", "");
    cb.addEventListener("change", onChangeSelection);
});

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

    updateCharts();
});