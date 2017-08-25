var USE_AGENTS = false;

var CORE_FIELDS = 5;

var ACCEPTED_NEIGHBORS = {
    'Collector': ['Parser', 'Output'],
    'Parser': ['Expert', 'Output'],
    'Expert': ['Expert', 'Output'],
    'Output': []
}

var GROUP_LEVELS = {
    'Collector': 0,
    'Parser': 1,
    'Expert': 2,
    'Output': 3
}

var GROUP_COLORS = {
    'Collector': '#FF0000',
    'Parser': '#00FF00',
    'Expert': '#0000FF',
    'Output': '#FFFF00'
}

var NODE_GROUP_COLORS = {
    'Collector': '#FF0000',
    'Parser': '#00FF00',
    'Expert': {background:'#5555FF', border:'#1111CC', highlight:{background:'#1111DD', border:'#1111CC'},hover:{background:'#1111DD',border:'#1111CC'}},
    'Output': ''
}

var LEVEL_CLASS = {
    'DEBUG': 'success',
    'INFO': 'info',
    'WARNING': 'warning',
    'ERROR': 'danger',
    'CRITICAL': 'danger'


var QUEUE_SCALE_MAX = 200.0;
var STATISTICS_PER_TIME_MAX = 0.015;

//var MONITOR_SCALE_MIN_LINE_WIDTH = 1.0;
var MONITOR_SCALE_MAX_LINE_WIDTH = 10.0;

//var MONITOR_SCALE_MIN_LINE_SPACING = 1.0;
var MONITOR_SCALE_MAX_LINE_SPACING = 30.0;

var STARTUP_KEYS = ['group', 'name', 'module', 'description', 'enabled'];

var BOT_ID_REGEX = /^[0-9a-zA-Z.-]+$/;

var ROOT = window.location.href.substring(0,window.location.href.lastIndexOf('/')+1);

//var LOAD_CONFIG_SCRIPT = ROOT + "php/load_configs.php";
var MANAGEMENT_SCRIPT = ROOT + "php/controller.php";

var RELOAD_CHARTS_EVERY = 60; /* seconds */
var RELOAD_QUEUES_EVERY = 60; /* seconds */
var RELOAD_LOGS_EVERY = 300; /* seconds */
var LOAD_X_LOG_LINES = 30;

var MESSAGE_LENGTH = 200;

var page_is_exiting = false;

var NEXT_RELOAD_SECONDS = RELOAD_CHARTS_EVERY;

function show_error(string) {
    if(!page_is_exiting) {
        alert(string);
    }
}

function sortObjectByPropertyName(obj) {
    return Object.keys(obj).sort().reduce((c, d) => (c[d] = obj[d], c), {});
}

var PAGE=null;