/**
 * WPETestFramework test
 */
/*jslint esnext: true*/

const fs = require('fs');
const url = require('url');

module.exports = {
    'title'             : 'WPEWebkit stability xmlhttprequest test',
    'description'       : 'Stress loads the system with xmlhttprequests and see if the WPEWebkit process continues to operate nominally',
    'requiredPlugins'   : ['WebKitBrowser'],
    'port'              : undefined,
    'server'            : undefined,
    'app'               : undefined,
    'appRequested'      : false,
    'timedout'          : false,
    'timer'             : undefined,
    'steps'             : {
        'init1' : {
            'description'   : 'Load resources to start the test',
            'test'          : function(x, callback) {
                readApp((err, app) => {
                    if (err || app === undefined) 
                        callback(false);

                    task.app = '' + app;
                    callback(true);
                });
            },
            'assert'        : true

        },
        'init2' : {
            'description'   : 'Start the HTTP server, serve the app',
            'timeout'       : 180, //seconds
            'test'          : startHttpServer,
            'params'        : function (request, response) {

                var parsedUrl = url.parse(request.url, false);

                console.log('New request with url: ' + parsedUrl.pathname);

                function returnApp(){
                    clearTimeout(task.timer);
                    task.timer = setTimeout(timedOut, 5 * 60 * 1000);
                    task.appRequested = true;
                    response.writeHead(200, {'Content-Type': 'text/html'});
                    response.end(task.app);
                }

                function resetTimeout(){
                    if (task.timedout === true) return;

                    clearTimeout(task.timer);
                    task.timer = setTimeout(timedOut, 5 * 60 * 1000);
                    response.writeHead(200);
                    response.end();
                }

                function timedOut(){
                    task.timedout = true;
                    console.error('KeepAlive timed out');
                }

                var responseLookup = {
                    '/app'       : returnApp,
                    '/app2'      : returnApp,
                    '/keepalive' : resetTimeout
                };

                var fn = responseLookup[ parsedUrl.pathname ];

                if (fn !== undefined) {
                    fn(parsedUrl.pathname);
                } else {
                    response.writeHead(404, {'Content-Type': 'text/html'});
                    response.end('Not found');
                }

            },
            'validate'      : (port) => {
                if (port === null || port === undefined)
                    return false;

                task.port = port;
                return true;
            }
        },
        'init3' : {
            'description'   : 'Determine IP to use',
            'test'          : matchIpRange,
            'params'        : host,
            'validate'      : (response) => {
                if (response === undefined)
                    return false;

                task.server = response;

                // update the app to reflect what we are going to use the serve the app from
                task.app = task.app.replace(/{{server}}/g, task.server);
                task.app = task.app.replace(/{{port}}/g, task.port);

                return true;
            }
        },
        'init4' : {
            'description'   : 'Stop the WPEWebkit Plugin',
            'test'          : stopPlugin,
            'params'        : 'WebKitBrowser'
        },
        'init5' : {
            'sleep'         : 30,
            'description'   : 'Start the WPEWebkit Plugin',
            'test'          : startAndResumePlugin,
            'params'        : 'WebKitBrowser'
        },
        'init6' : {
            'sleep'         : 30,
            'description'   : 'Check if the WPEWebkit Plugin is started',
            'test'          : getPluginState,
            'params'        : 'WebKitBrowser',
            'validate'      : checkResumedOrActivated,
        },
        'init7' : {
            'description'   : 'Load the app on WPEWebkit',
            'test'          : function (x, cb) {
                var url = `http://${task.server}:${task.port}/app`;
                setUrl(url, cb);
            },
            'validate'      : httpResponseSimple
        },
        'init8' : {
            'sleep'         : 10,
            'description'   : 'Check if app is loaded on WPEWebkit',
            'test'          : getUrl,
            'validate'      : (resp) => {
                if (resp === `http://${task.server}:${task.port}/app` && task.appRequested === true)
                    return true;
                
                throw new Error('URL did not load on WPEWebkit');
            }
        },
        'step1' : {
            'sleep'         : 10,
            'description'   : 'Check if requests are still being made',
            'test'          : dummy,
            'validate'      : () => {
                if (task.timedout === false)
                    return true;
                
                throw new Error('Requests timed out');
            }
        },
        'step3' : {
            'description'   : 'Check CPU usage',
            'test'          : getCpuLoad,
            'validate'      : (cpuLoad) => {
                if (cpuLoad < 90)
                    return true;
                
                throw new Error('CPU usage is above 90%, failing test');
            }
        },
        'step4' : {
            'description'   : 'Check Memory usage',
            'test'          : getMemoryUsage,
            'validate'      : (memoryUsage) => {
                if (memoryUsage < 98)
                    return true;
                
                throw new Error('Memory usage is above 98%, failing test');
            }
        },
        'step5' : {
            'description'   : 'Repeat steps for 1 hour',
            'goto'          : 'step1',
            'repeatTime'    : 60 //minutes
        }
    }
};


function readApp(callback){
    fs.readFile('./tests/resources/xmlhttprequest_app.html', function(err, data){
        if (err){
            throw err;
        } else {
            callback(undefined, data);
        }
    });
}
