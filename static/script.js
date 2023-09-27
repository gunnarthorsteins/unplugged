const JIG = "jig";
const INPUTS = "inputFields";
var selectedJig = '';

SERVERIP = '0.0.0.0'
SERVERPORT = '9696'

function constructURL(endpoint) {
    var url = "http://" + SERVERIP + ":" + SERVERPORT + "/" + endpoint

    return url;
};


//get the saved value function - return the value of "v" from localStorage. 
function getSavedValue(tag) {
    if (!localStorage.getItem(tag)) {
        return '';// You can change this to your defualt value. 
    }
    return localStorage.getItem(tag);
}

function execute(event, endpoint) {
    /**
     * Parse input values upon clicking button.
     * @param {*} event - Event being button clicked.
     * endpoint {string} endpoint - Endpoint of controller server.
     */

    event.preventDefault();
    var inputElements = document.querySelectorAll("input");

    for (var i = 0; i < inputElements.length; i++) {
        saveValue(inputElements[i]);
    }

    var exp_params = parse(inputElements, ip_ending_value);
    send(payload = exp_params, endpoint = endpoint, onload_fn = onload_figure);
};


function getJigStatus() {
    selectedJig = document.getElementById(JIG).value;
    send(payload = selectedJig, endpoint = "status", onload_fn = onload_status);
};


function linspace(start, end, n) {
    const step = (end - start) / (n - 1);
    return Array.from({ length: n }, (_, i) => start + step * i);
}


function onload_figure(xhr) {
    if (xhr.status === 200) {
        var waveform = xhr.response["amps"][0];
        var time_array = linspace(start = 10, end = 20, n = waveform.length);

        const figDiv = document.getElementById('figure').getContext('2d');
        plot(figDiv, time_array, waveform);
    }
}

function onload_status(xhr) {
    if (xhr.status === 200) {
        var status = xhr.response["status"];
        var statusDiv = document.getElementById('status');
        statusDiv.innerHTML = `${selectedJig} jig status: ${status}`;
    }
}


function parse(inputElements, ip_ending_value) {
    var exp_params = {};

    for (var i = 0; i < inputElements.length; i++) {
        var input = inputElements[i];
        exp_params[input.id] = input.value;
    }
    exp_params[JIG] = ip_ending_value;

    return exp_params;
}


function persist() {
    var inputElements = document.querySelectorAll("input");
    selectedJig = document.getElementById(JIG).value;

    for (var i = 0; i < inputElements.length; i++) {
        var input = inputElements[i];
        var tag = selectedJig.concat('.', input.id);
        val = getSavedValue(tag);    // set the value to this input
        console.log(val);
        document.getElementById(input.id).value = val
        // document.getElementById(input.id).value = getSavedValue(tag);    // set the value to this input
    }
}


function plot(figDiv, time_array, waveform) {
    // fetch('path/to/your/data.json')
    //     .then(response => response.json())
    //     .then(data => {
    // Extract the values from the JSON data
    // const waveform = data.values;

    // Create a chart using Chart.js
    new Chart(figDiv, {
        type: 'line',
        data: {
            labels: time_array,
            datasets: [
                {
                    label: 'Waveform',
                    data: waveform,
                    pointRadius: 0,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time (us)'
                    },
                    ticks: {
                        callback: function (value, index) {
                            // Customize the tick values as needed
                            // Example: Show only every 2nd tick
                            return index % 50 === 0 ? this.getLabelForValue(value) : '';
                        }
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Voltage (V)'
                    }
                }
            }
        }
    });
}


function saveValue(inputElement) {
    /**
     * Docstring
     */
    var id = selectedJig.concat('.', inputElement.id);  // get the sender's id to save it . 
    var val = inputElement.value; // get the value. 
    localStorage.setItem(id, val);// Every time user writing something, the localStorage's value will override . 
}


function send(payload, endpoint, onload_fn) {
    var xhr = new XMLHttpRequest();
    xhr.responseType = 'json';

    xhr.open("POST", `/${endpoint}`, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.onload = function () {
        onload_fn(xhr);
    };
    xhr.send(JSON.stringify(payload));
}


function toggleInputFields() {
    selectedJigNew = document.getElementById(JIG);

    if (selectedJigNew === selectedJig) {
        return;
    }

    selectedJig = selectedJigNew;
    document.getElementById("figure").innerHTML = "";


    var x = document.getElementById(INPUTS);
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";

    }

};
window.onload = function () {
    /**
     * Listen to buttons and act upon them being clicked.
     */// Call toggleInputFields on initial load

    document.getElementById(JIG).addEventListener("change", function () {
        getJigStatus();
        toggleInputFields();
        persist();
    });
    document.getElementById("pulse").addEventListener("click", function (event) {
        execute(event, "pulse");
    });
    document.getElementById("start").addEventListener("click", function (event) {
        // get confirmation
        execute(event, "start");
    });
    document.getElementById("stop").addEventListener("click", function (event) {
        // get confirmation
        execute(event, "stop");
    });
};