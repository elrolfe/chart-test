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

fetch("time_series.json").then(data => data.json()).then(data => {
    let initialize = true;
    let chartLabels = [];
    let totalData = [];
    let stockData = [];

    Object.keys(data).forEach(key => {
        let totalValues = [];
        let stockValues = [];

        data[key].data.filter(f => f.YearQuarter > 2017.5 && f.YearQuarter < 2023.75).forEach(d => {
            if (initialize) {
                chartLabels.push(getQuarter(d.YearQuarter));
                console.log(d);
            }

            totalValues.push(Math.max(d.TotalQuarterProd, 0));
            stockValues.push(Math.max(d.StocksOnHand, 0));
        });

        totalData.push({
            sum: totalValues.reduce((acc, val) => val + acc),
            label: stateCodeToName[key],
            data: totalValues,
            fill: false,
        });

        stockData.push({
            sum: stockValues.reduce((acc, val) => val + acc),
            label: stateCodeToName[key],
            data: stockValues,
            fill: false,
        });

        initialize = false;
    });

    totalData.sort((a, b) => b.sum - a.sum);
    stockData.sort((a, b) => b.sum - a.sum);

    let totalChartConfig = {
        type: "line",
        data: {
            labels: chartLabels,
            datasets: totalData.slice(0, 10)
        }
    };

    let stockChartConfig = {
        type: "line",
        data: {
            labels: chartLabels,
            datasets: stockData.slice(0, 10)
        }
    };

    console.log(totalChartConfig);

    const ctxTotal = document.getElementById("sample-totals");
    const ctxStock = document.getElementById("sample-stock");

    new Chart(ctxTotal, totalChartConfig);
    new Chart(ctxStock, stockChartConfig);
});