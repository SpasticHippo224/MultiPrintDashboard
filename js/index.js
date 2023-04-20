var scrollDelay = 5000;

window.onload = function() {
    addPrinter("192.168.0.104:5000", "E6F47CCBC35342D7BDB8FE53AA79E636", document.getElementById("p1"));
    addPrinter("octopi.local", "4D13666D43CA4102919768FBCDC500F0", document.getElementById("p2"));
    var el = document.getElementById("main");
    window.setTimeout(() => {
        scrollDown(el);
    }, 1000)
}

async function addPrinter(ip, key, el) {

    makeTable(key, el, ip);
}

function scrollUp(el) {
    try {
        $(el).animate({
            scrollTop: 0
        }, scrollDelay);
    } catch (err) {}
    window.setTimeout(() => { scrollDown(el) }, scrollDelay * 2);

}

function scrollDown(el) {
    try {
        $(el).animate({
            scrollTop: parseFloat(getComputedStyle(el.firstElementChild).height.split("px")[0]) - parseFloat(getComputedStyle(el).height.split("px")[0]) + 1
        }, scrollDelay);
    } catch (err) {}
    window.setTimeout(() => { scrollUp(el) }, scrollDelay * 2);
}

async function makeTable(key, el, ip) {
    var url = `http://${ip}`;
    var table = createElement("table", { id: ip + "table", class: "" });

    var printer = await get(`${url}/api/printer`, key);
    var status = "",
        tool0Actual, tool0Target, bedActual, bedTarget;
    if (!printer.error) {
        status = printer.state.text;
        tool0Actual = printer.temperature.tool0.actual;
        tool0Target = printer.temperature.tool0.target;
        bedActual = printer.temperature.bed.actual;
        bedTarget = printer.temperature.bed.target;
    } else {
        status = printer.error;
        tool0Actual = 0;
        tool0Target = 0;
        bedActual = 0;
        bedTarget = 0;
    }

    var job = await get(`${url}/api/job`, key);
    // console.log(job);
    var fileName = job.job.file.name;
    var percentComplete = ((e) => {
        e = e.toString().split(".");
        // e[1] = e[1][0] + e[1][1];
        // return e.join(".") + "%";
        return e[0] + "%";
    })(job.progress.completion || "0.00");
    var printTime = displaySecs(job.progress.printTime);
    var printTimeLeft = displaySecs(job.progress.printTimeLeft);

    var connection = await get(`${url}/api/connection`, key);
    var printerName = connection.current.printerProfile;


    function addRows(data) {
        data.forEach(e => {
            table.add(createElement("tr").add(createElement("td", {
                innerHTML: e.title,
                style: {
                    width: "50%",
                    "overflow-wrap": "anywhere",
                    "inline-size": "50%",
                    // display: "block"
                }
            })).add(createElement("td", {
                innerHTML: e.content,
                style: {
                    width: "50%",
                    "overflow-wrap": "anywhere",
                    "inline-size": "50%",
                    // display: "block"
                }
            })))
        });
    }
    addRows([
        { title: "IP Address", content: ip },
        { title: "Printer Name", content: printerName },
        { title: "Status", content: status },
        { title: "File Name", content: fileName || "" }
    ]);
    table.add(createElement("tr").add(createElement("td", { innerHTML: "Percent Complete", style: { width: "45%" } }), createElement("td", { style: { width: "55%" } }).add(
        createElement("svg", { class: "current", width: 120, height: 120, viewBox: "0 0 120 120" }).add(
            createElement("circle", {
                cx: 60,
                cy: 60,
                r: 54,
                fill: "none",
                stroke: "#ccc",
                "stroke-width": 12
            }),
            createElement("circle", {
                class: "dashboardGauge",
                cx: 60,
                cy: 60,
                r: 54,
                fill: "none",
                stroke: "#09c",
                "stroke-width": 12,
                "stroke-dasharray": 339.292,
                transform: "rotate(-90 60 60)",
                "data-bind": "attr: { 'stroke-dashoffset': formatProgressOffset(timeProgressString()) }",
                "stroke-dashoffset": 339.292 * (100 - job.progress.completion) / 100
            }),
            createElement(
                "text", {
                    "font-size": 30,
                    x: "50%",
                    y: "50%",
                    "dominant-baseline": "middle",
                    "text-anchor": "middle",
                    fill: "#08c",
                    "data-bind": "text: timeProgressBarString()",
                    innerHTML: percentComplete
                }
            )
        )
    )));
    addRows([
        { title: "Print Time", content: printTime },
        { title: "Print Time Left", content: printTimeLeft },
        { title: "E0 Temp", content: tool0Actual + "/" + tool0Target },
        { title: "Bed Temp", content: bedActual + "/" + bedTarget },
    ]);
    // addRows([
    //     { title: "print time", content: printTime },
    //     { title: "print time left", content: printTimeLeft },
    //     { title: "E0 temp", content: tool0Actual + "/" + tool0Target },
    //     { title: "Bed temp", content: bedActual + "/" + bedTarget },
    // ]);
    if (!document.getElementById(ip + "table")) {
        el.add(table);
    } else {
        document.getElementById(ip + "table").innerHTML = table.innerHTML;
    }
    window.setTimeout(() => {
        makeTable(key, el, ip)
    }, 3000);
}

async function get(url, key) {
    var d, errorData = {
        error: "OctoPrint is offline",
        job: {
            file: "",
        },
        progress: {
            completion: "0.00",
            printTime: 0,
            printTimeLeft: 0,
        },
        current: {
            printerProfile: ""
        }
    };
    await new Promise(async (success, fail) => {
        try {
            window.setTimeout(fail, 10000);
            var data = await fetch(url, {
                headers: {
                    "X-Api-Key": key
                }
            });
            success(data.json());
        } catch (err) {
            fail();
        }
        fail();
    }).then(data => {
        d = data || errorData;
    }).catch(e => {
        // console.trace();
        d = errorData;
        return;
    });
    d = d || errorData;
    // console.log("after promise");
    return d;
}