var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const {promisify} = require('util');
const uuid = require('uuid/v4');
const Docker = require('dockerode');
const docker = new Docker({socketPath: '/var/run/docker.sock'});
const fs = require('fs');
const getPort = require('get-port');
const proxy = require('http-proxy-middleware');
//Graceful Shutdown
process.on('SIGINT', function () {
    console.log('Shutting down!');
    client.quit();
    process.exit(0);
});

var app = express();

var redis = require("redis"),
    client = redis.createClient({
        host: "localhost",
        port: 32770
    });
const getAsync = promisify(client.get).bind(client);

client.on("error", function (err) {
    console.log("Error " + err);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/get-function/:id/:file', (req, res, next) => {
    let file = null;
    // if (req.params.file.indexOf('package.josn') > -1)
    //     return res.send(fs.readlinkSync('./containers/' + req.params.id + "/" + req.params.file));
    file = fs.readFileSync('./containers/' + req.params.id + "/" + req.params.file);

    res.send(file);
});

app.use('/get-template', (req, res, next) => {

    const file = fs.readFileSync('./resources/default_function.js');

    res.send(file);
});

app.use('/save-function/:id/:file', (req, res, next) => {
    try {
        fs.writeFileSync('./containers/' + req.params.id + "/" + req.params.file, req.body.code);
        res.send('Function saved');
    } catch (e) {
        res.send(e.message);
    }
});

app.use('/app/create', async (req, res, next) => {

    const appName = req.query.name || `function-${new Date().getTime()}`;
    const basePath = './containers';
    const containerName = uuid();

    // get random port to expose the docker on
    const port = await getPort();
    const imageName = 'fortiapp-function-base:latest';
    const startOptions = {};
    const createOptions = {
        Image: imageName,
        name: containerName,
        HostConfig: {
            Memory: 549232640,
            CpusetCpus: "0",
            Binds: [`${path.join(__dirname, 'containers', containerName)}:/app/functions`],
            PortBindings: {
                "3000/tcp": [
                    {
                        HostPort: `${port}`
                    }
                ]
            }
        }

    };

    try {
        fs.mkdirSync(path.join(__dirname, basePath, containerName));
    } catch (e) {
        console.log(e.members);
    }

    docker.createContainer(createOptions, function (err, container) {
        if (err)
            return res.json(err.message);
        container.start((err, data) => {
            if (err)
                return res.json(err.message);

            console.log("container " + containerName + " started");
            client.set(containerName, JSON.stringify({port, appName}), redis.print);
            res.json({id: containerName, port, appName});
        });
    });
});

app.use('/app/:id', (req, res, next) => {

    const files = fs.readdirSync('./containers/' + req.params.id)

    res.render('apps', {app: req.params.id, files});
});

app.use('/exec/:id/:functionName', async (req, res, next) => {
    let reply = await getAsync(req.params.id);
    reply = JSON.parse(reply);
    req.port = reply.port;
    next();
}, proxy({
    target: 'http://localhost',
    changeOrigin: true, // needed for virtual hosted sites
    ws: true, // proxy websockets
    pathRewrite: function (path, req) {
        let parts = path.split('?');
        let queryString = parts[1];
        return `/${req.params.functionName}${(queryString ? '?' + queryString : '')}`;
    },
    router: function (req) {
        return 'http://localhost:' + req.port;
    }
}));

app.use('/', (req, res, next) => {
    let apps = [];
    client.keys('*', function (err, keys) {
        if (err) return console.log(err);
        keys.forEach(key => apps.push(key));
        res.render('index', {title: 'Fortiapp Cloud Functions', apps});
    });
});


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
