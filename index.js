var allCommands;

var downloadButton = document.getElementById('download');


(function (w) {
    (async () => {
        document.getElementById('file-selector').addEventListener('change', getFile)
        downloadButton.addEventListener('click', save)
        downloadButton.style.display = 'none';


    })();
})(window);

function hide(el) {
    el.style.display = 'none';
}

function show(el, value) {
    el.style.display = value;
}

function removeDuplicates(commands) {
    commands.filter(function (value, index, array) {
        return array.indexOf(value) === index;
    });
    return commands;
}

function getFile(event) {
    const input = event.target
    if ('files' in input && input.files.length > 0) {
        placeFileContent(
            document.getElementById('content-target'),
            input.files[0])
    }
}

function placeFileContent(target, file) {
    readFileContent(file).then(content => {
        // target.value = content // in case you want to load it on the view
        generateRows(content);
    }).catch(error => console.log(error))
}

function readFileContent(file) {
    const reader = new FileReader()
    return new Promise((resolve, reject) => {
        reader.onload = event => resolve(event.target.result)
        reader.onerror = error => reject(error)
        reader.readAsText(file)
    })
}

function generateRows(text) {
    downloadButton.style.display = 'none';

    const output = document.getElementById('output');
    // const text = await (await fetch("commands2.hive")).text();
    result = text.split('\u0000');

    var commands = [];

    result.forEach(row => {
        if (row.substring(0, 2) == '{"') {
            row = row.replace(/[\x00-\x08\x0E-\x1F\x7F-\uFFFF]/g, '');

            row = row.replace('":"\"/', '":"');
            row = row.replace('==\""', '=="');
            row = row.replace('=\""', '=\"');
            
            commands.push(row);
        }
    });
    console.log('All Commands: ', commands.length)

    /// Remove duplicates
    commands = removeDuplicates(commands)

    console.log('All Commands (No duplicates): ', commands.length)
    commands.forEach(el => {
        console.log(el);
    });

    allCommands = commands;
    commands.forEach(element => {
        const li = document.createElement('li');
        output.appendChild(li);
        json = hljs.highlight(element, {
            language: 'json'
        }).value;

        li.innerHTML = '<pre><code class="language-json">' + json + '</code></pre>';
    });

    hljs.highlightAll();
    downloadButton.style.display = 'block';


}


function save() {
    var filename = 'commands.json';
    const blob = new Blob(["[" + allCommands + "]"], {
        type: 'text/json'
    });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        const elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}