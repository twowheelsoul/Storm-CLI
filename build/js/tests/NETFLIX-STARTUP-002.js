/**
 * WPETestFramework test
 */
/*jslint esnext: true*/

test = {
    'title'         : 'Netflix shutdown of Framework robustness test',
    'description'   : 'Starts Netflix and stops Framework. Checks if everything is shutdown correctly',
    'requiredPlugins'   : ['Netflix'],
    'steps'         : {
        'init1' : {
            'description'   : 'Stop WPEWebkit, YouTube & Netflix',
            'timeout'       : 180, //seconds
            'test'          : stopPlugins,
            'params'        : ['WebkitBrowser', 'YouTube', 'Netflix'],
        },
        'step1' : {
            'sleep'         : 10,
            'description'   : 'Start Netflix',
            'timeout'       : 180,
            'test'          : startPlugin,
            'params'        : 'Netflix',
            'validate'      : httpResponseSimple
        },
        'step2' : {
            'sleep'         : 30,
            'description'   : 'Check if Netflix is started correctly',
            'timeout'       : 180, //seconds
            'test'          : getPluginState,
            'params'        : 'Netflix',
            'validate'      : checkResumedOrActivated
        },
        'step3' : {
            'description'   : 'Stop Framework',
            'test'          : stopFramework,
            'assert'        : true,
        },
        'step4' : {
            'sleep'         : 5,
            'description'   : 'Check if NetflixImplementation rpcprocess is gone',
            'test'          : checkIfProcessIsRunning,
            'params'        : 'NetflixImplementation',
            'assert'        : false
        },
        'step5' : {
            'description'   : 'Start Framework',
            'test'          : startFramework,
            'assert'        : true
        }
    }
};
