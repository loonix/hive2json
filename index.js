(function (w) {
    (async () => {
        document.getElementById('file-selector').addEventListener('change', getFile)
    })();
})(window);

function removeDuplicates(commands) {
    commands.filter(function (value, index, array) {
        return array.indexOf(value) === index;
    });
    return commands;
}

function unescapeSlashes(str) {
    // add another escaped slash if the string ends with an odd
    // number of escaped slashes which will crash JSON.parse
    let parsedStr = str.replace(/(^|[^\\])(\\\\)*\\$/, "$&\\");

    // escape unescaped double quotes to prevent error with
    // added double quotes in json string
    parsedStr = parsedStr.replace(/(^|[^\\])((\\\\)*")/g, "$1\\$2");

    try {
        parsedStr = JSON.parse(`"${parsedStr}"`);
    } catch (e) {
        return str;
    }
    return parsedStr;
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
    const output = document.getElementById('output');
    // const text = await (await fetch("commands2.hive")).text();
    result = text.split('\u0000');

    var commands = [];

    result.forEach(row => {
        if (row.substring(0, 2) == '{"') {
            row = row.replace(/[\x00-\x08\x0E-\x1F\x7F-\uFFFF]/g, '');
            row = unescapeSlashes(row);
            commands.push(row);
        }
    });
    console.log(commands)
    console.log('All Commands: ', commands.length)

    /// Remove duplicates
    commands = removeDuplicates(commands)

    console.log('All Commands (No duplicates): ', commands.length)

    commands.forEach(element => {
        const li = document.createElement('li');
        output.appendChild(li);
        json = hljs.highlight(element, {
            language: 'json'
        }).value
        li.innerHTML = '<pre><code class="language-json">' + json + '</code></pre>';
    });

    hljs.highlightAll();

}