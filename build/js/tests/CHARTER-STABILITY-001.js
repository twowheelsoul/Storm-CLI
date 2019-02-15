/**
 * WPETestFramework test
 */
/*jslint esnext: true*/

test = {
    'operator'          : 'charter',
    'title'             : 'Charter John Doe UI test',
    'description'       : 'Navigate around in the Charter UI by navigating TV-> Netflix -> TV-> VOD -> guide -> TV -> Guide -> Menu',
    'requiredPlugins'   : ['UX', 'Snapshot'],
    'maxSameScreenshot' : 3, // amount of times its okay to have the same screenshot
    'curSameScreenshot' : 0, // counter
    'timeInBetweenKeys' : 2, // 5s inbetween keys
    'timeout'           : 12600, //s == 3.5 hour
    'prevScreenshot'    : undefined,
    'checkScreenShot'   : (res) => {
        // check if we got an empty response
        if (res !== undefined && res.length > 0) {
            if (test.previousSceenshot === undefined || test.previousSceenshot !== res) {
                // screen updated, save it and reset stuck counter
                test.previousSceenshot = res;
                test.curSameScreenshot = 0;
                return true;
            } else {
                // screen is stuck
                // check if we have reached the max threshold
                if (test.curSameScreenshot >= test.maxSameScreenshot)
                    throw new Error('Screen is stuck, new screenshot is the same as previous screenshot for ' + test.curSameScreenshot + ' times.');

                // update counter and go again
                test.curSameScreenshot++;
                return true;
            }
        } else {
            // empty response is an annoying bug in the Snapshot module. Trying to be a little more graceful about it by allowing Framework to return an empty screenshot from time to time
            if (test.curSameScreenshot >= test.maxSameScreenshot)
                throw new Error('Error screenshot returned is empty for ' + test.curSameScreenshot + ' times.');

            // update counter and go again
            test.curSameScreenshot++;
            return true;
        }
    },
    'steps'         : {
        'step1' : {
            'description'   : 'Check if UX is loaded succesfully',
            'test'          : getPluginState,
            'params'        : 'UX',
            'assert'        : 'resumed'
        },
        'step2' : {
            'description'   : 'Create inital screenshot',
            'test'          : screenshot,
            'validate'      : (res) => {
                test.previousSceenshot = res;
                test.curSameScreenshot = 0;
                return true;
            }
        },
        'step3' : {
            'description'   : 'Navigate into Netflix',
            'test'          : (cb) => {
                var keyQueue = [this.menu, this.left, this.left, this.left, this.enter, this.enter];

                self = this;
                function sendKey() {
                    var k = keyQueue.shift();
                    console.log('Sending: ' + k);
                    key(k, (resp) => {
                        if (keyQueue.length !== 0)
                            setTimeout(sendKey, test.timeInBetweenKeys * 1000);
                        else
                            cb(keyQueue);
                    });
                }

                sendKey();
            }
        },
        'step4' : {
            'sleep'         : 30,
            'description'   : 'Check if screen changed',
            'test'          : screenshot,
            'validate'      : (res) => {
                return test.checkScreenShot(res);
            }
        },
        'step5' : {
            'description'   : 'Exit Netflix',
            'test'          : (cb) => {
                function sendBack(_cb) {
                    key(this.back, _cb)
                }

                // 3x back
                sendBack(() => {
                    // after first back wait 20s
                    setTimeout(sendBack, 20 * 1000, (resp) => {
                        setTimeout(sendBack, self.timeInBetweenKeys * 1000, cb);
                    });
                });
            }
        },
        'step6' : {
            'sleep'         : 30,
            'description'   : 'Check if screen changed',
            'test'          : screenshot,
            'validate'      : (res) => {
                return test.checkScreenShot(res);
            }
        },
        'step7' : {
            'description'   : 'Enter VOD',
            'test'          : (cb) => {
                var keyQueue = [this.menu, this.right, this.right, this.right, this.enter];

                function sendKey() {
                    var k = keyQueue.shift();
                    console.log('Sending: ' + k);
                    key(k, (resp) => {
                        if (keyQueue.length !== 0)
                            setTimeout(sendKey, test.timeInBetweenKeys * 1000);
                        else
                            cb();
                    });
                }
                sendKey();
            }
        },
        'step8' : {
            'sleep'         : 30,
            'description'   : 'Check if screen changed',
            'test'          : screenshot,
            'validate'      : (res) => {
                return test.checkScreenShot(res);
            }
        },
        'step9' : {
            'description'   : 'Exit VOD',
            'test'          : (cb) => {
                var keyQueue = [this.exit, this.exit];

                function sendKey() {
                    var k = keyQueue.shift();
                    console.log('Sending: ' + k);
                    key(k, (resp) => {
                        if (keyQueue.length !== 0)
                            setTimeout(sendKey, test.timeInBetweenKeys * 1000);
                        else
                            cb();
                    });
                }
                sendKey();
            }
        },
        'step10' : {
            'sleep'         : 30,
            'description'   : 'Check if screen changed',
            'test'          : screenshot,
            'validate'      : (res) => {
                return test.checkScreenShot(res);
            }
        },
        'step11' : {
            'description'   : 'Enter Guide',
            'test'          : (cb) => {
                var keyQueue = [this.guide];

                function sendKey() {
                    var k = keyQueue.shift();
                    console.log('Sending: ' + k);
                    key(k, (resp) => {
                        if (keyQueue.length !== 0)
                            setTimeout(sendKey, test.timeInBetweenKeys * 1000);
                        else
                            cb();
                    });
                }
                sendKey();
            }
        },
        'step12' : {
            'sleep'         : 30,
            'description'   : 'Check if screen changed',
            'test'          : screenshot,
            'validate'      : (res) => {
                return test.checkScreenShot(res);
            }
        },
        'step13' : {
            'description'   : 'Exit Guide',
            'test'          : (cb) => {
                var keyQueue = [this.exit];

                function sendKey() {
                    var k = keyQueue.shift();
                    console.log('Sending: ' + k);
                    key(k, (resp) => {
                        if (keyQueue.length !== 0)
                            setTimeout(sendKey, test.timeInBetweenKeys * 1000);
                        else
                            cb();
                    });
                }
                sendKey();
            }
        },
        'step14' : {
            'sleep'         : 30,
            'description'   : 'Check if screen changed',
            'test'          : screenshot,
            'validate'      : (res) => {
                return test.checkScreenShot(res);
            }
        },
        'repeatStep' : {
            'description'   : 'Repeat for 1 hour',
            'goto'          : 'step3',
            'repeatTime'    : 1 * 60,
        }
    }
};