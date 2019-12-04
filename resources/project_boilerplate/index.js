const express = require('express');
const JsMeter = require('js-meter');
const app = express();

const port = 3000;

//Graceful Shutdown
process.on('SIGINT', function () {
    console.log('Shutting down!');
    process.exit(0);
});


app.get('/:functionName', (req, res) => {

    const isPrint = true;
    const isKb = true;   // or Mb
    const m = new JsMeter({isPrint, isKb});

    try {
        const func = require('./functions/' + req.params.functionName)(req, res);

    } catch (e) {
        console.log(e.message);
        res.send(e.message);
    }

    const meter = m.stop()
    console.log(meter);
});

app.listen(port, () => console.log(`Function app is running!`));
