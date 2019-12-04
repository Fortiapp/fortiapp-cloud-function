let flask = null;
vex.defaultOptions.className = 'vex-theme-os';
let currentApp = appId;
let currentFunction = null;
let trigger = document.getElementById('trigger');

// flask.onUpdate((code) => {
//     // do something with code here.
//     // this will trigger whenever the code
//     // in the editor changes.
// });

function save() {
    const code = flask.getCode();
    axios({
        method: 'post',
        url: '/save-function/' + currentApp + '/' + currentFunction,
        headers: {},
        data: {code}
    }).then(function (response) {
        // alert(response.data);
        toastr.success('Your function has been saved successfully!', 'Success')
    }).catch(function (error) {
        // handle error
        toastr.error(error.message, 'Miracle Max Says')
    }).then(function () {
        // always executed
    });
}

function load(id, file) {
    currentFunction = file;
    const url = `http://localhost:5000/exec/${currentApp}/${currentFunction.replace(".js", '')}`;
    trigger.innerHTML = url;
    trigger.setAttribute('href', url);
    axios.get('/get-function/' + currentApp + '/' + file)
        .then(function (response) {
            // handle success
            if (!flask) {
                flask = new CodeFlask('#editor', {language: 'js', lineNumbers: true});
            }
            flask.updateCode(response.data);
        })
        .catch(function (error) {
            // handle error
            console.log(error);
        })
        .then(function () {
            // always executed
        });
}

function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function str2ab(str) {
    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function create() {
    vex.dialog.open({
        message: 'Enter your username and password:',
        input: [
            '<input name="name" type="text" placeholder="Function Name" required />',
        ].join(''),
        buttons: [
            $.extend({}, vex.dialog.buttons.YES, {text: 'Create'}),
            $.extend({}, vex.dialog.buttons.NO, {text: 'Cancel'})
        ],
        callback: function (data) {
            if (!data) {
                console.log('Cancelled')
            } else {
                if (!flask) {
                    flask = new CodeFlask('#editor', {language: 'js', lineNumbers: true});
                }
                axios.get('/get-template')
                    .then(function (response) {
                        // handle success
                        //TODO: Improve filename check
                        currentFunction = data.name.replace('.js', '') + ".js";
                        if (!flask) {
                            flask = new CodeFlask('#editor', {language: 'js', lineNumbers: true});
                        }
                        flask.updateCode(response.data);
                    })
                    .catch(function (error) {
                        // handle error
                        console.log(error);
                    })
                    .then(function () {
                        // always executed
                    });
            }
        }
    })
}
