/**
 * WPETestFramework test
 */
/*jslint esnext: true*/

test = {
    'title'         : 'YouTube Media Source conformance test',
    'description'   : 'Loads the YouTube MSE 2018 conformance test and captures the output',
    'testCount'     : 105,
    'url'           : 'https://yt-dash-mse-test.commondatastorage.googleapis.com/unit-tests/2018.html?command=run',
    'steps'         : {
       'step1' : {
            'description'   : 'Stop WPEWebkit',
            'test'          : stopPlugin,
            'params'        : 'WebKitBrowser',
            'validate'      : httpResponseSimple,
        },
        'step2' : {
            'sleep'         : 30,
            'description'   : 'Check if WPEWebkit is stopped correctly',
            'test'          : getPluginState,
            'params'        : 'WebKitBrowser',
            'assert'        : 'deactivated'
        },
        'step3' : {
            'description'   : 'Start WPEWebkit',
            'test'          : startAndResumePlugin,
            'params'        : 'WebKitBrowser',
            'validate'      : httpResponseSimple
        },
        'step4' : {
            'sleep'         : 30,
            'description'   : 'Check if WPEWebkit is started correctly',
            'test'          : getPluginState,
            'params'        : 'WebKitBrowser',
            'validate'      : checkResumedOrActivated,
        },
        'step5' : {
            'description'   : 'Attach to the logs to capture the log output and start the test',
            'timeout'       : 25 * 60, // 25 minutes
            'test'          : function(cb) {

                var ready = false;

                var testOK = 0;
                var testsRun = 0;
                var testsFailed = 0;
                var testsTimedout = 0;

                var failedTests = [];
                var timedoutTests = [];

                var currentTestNr;
                var currentTest;

                function readyToParse() {
                    ready = true;
                }

                function parseGoogleLogs(error, log){
                    //console.log(log);
                    if (!ready) return;

                    const testStarted = /STARTED/g;
                    const testSucceeded = /PASSED./g;
                    const testTimedout = /TIMED OUT!/g;
                    const testFailed = /FAILED/g;
                    const testsDone = /All tests are completed/g;

                    if (testStarted.test(log)){
                        //Information: TestExecutor:  Test 29:VideoBufferSize STARTED with timeout 30000
                        var test = log.split('TestExecutor:  Test ')[1];
                        currentTest = test.split(' STARTED with timeout')[0];
                        testsRun++;
                        console.log('Test ' + currentTest + ' started');
                    }

                    if (testSucceeded.test(log)){
                        testOK++;
                        console.log('Test ' + currentTest + ' succeeded');
                    }

                    if (testTimedout.test(log)){
                        timedoutTests.push(currentTest);
                        testsTimedout++;

                        console.log('Test ' + currentTest + ' timedout');
                    }

                    if (testFailed.test(log)){
                        failedTests.push(currentTest);
                        testsFailed++;

                        console.log('Test ' + currentTest + ' failed');
                    }

                    if (testsDone.test(log)){
                        function _endTest(){
                            var results = {
                                'failed' : {
                                    'amount' : testsFailed,
                                    'tests'  : failedTests
                                },
                                'timedout' : {
                                    'amount' : testsTimedout,
                                    'tests'  : timedoutTests
                                },
                                'testsRun' : testsRun,
                            };

                            logger.disconnect();
                            cb(results);
                        }

                        /* wait just a bit, we may get some more stuff */
                        setTimeout(_endTest, 15000);
                    }
                }

                var logger = new AttachToLogs(parseGoogleLogs);
                logger.connect(function(){
                    // Easy there cowboy, the console log returns the history of X amount of messages.
                    // In case where we are running subsequent MSE/EME tests this may mess up the parsing.
                    // only start parsins when the url is set through the ready boolean
                    setTimeout(readyToParse, 1000);
                    setTimeout(setUrl, 1000, test.url);
                });
            },
            'validate'      : (results) => {
                if (results.failed.amount === 0 && results.timedout.amount === 0 && results.testsRun === test.testCount)
                    return true;


                var error = `Tests run: ${results.testsRun} of ${test.testCount}. `;
                error += 'Tests failed: ' + results.failed.tests + '. ';
                error += 'Tests timedout: ' + results.timedout.tests + '. ';
                throw new Error(error);
            }
        },
        'step6' : {
            'description'       : 'Cleanup the test',
            'test'              : setUrl,
            'params'            : 'about:blank'
        }
    }
};