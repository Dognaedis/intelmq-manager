<?php


    // WHETHER TO USE AGENTS FOR CONFIG FILES AND COMUNICATION WITH THE intelmqctl.
    //define("USE_BOTNET_AGENTS", False); // Operations are sent directly to the to the intelmqctl.
    define("USE_BOTNET_AGENTS", True); // Operations are sent to the intelmqctl through botnet agents.


    // BASE FOLDER FOR CONFIG FILES
    define("CONFIG_FILES_BASE_FOLDER", "/opt/intelmq/etc/");


    // COMMAND TO USE TO DIRECTLY COMUNICATE WITH THE intelmqctl
    //define("CONTROLLER", "sudo -u intelmq /usr/local/bin/intelmqctl %s");
    define("CONTROLLER", "/usr/local/bin/intelmqctl %s");

    // SQLITE3 DATABASE TO STORE THE AGENTS LIST
    define("DATABASE", "../db/intelmq_manager.sqlite"); // location of the intelmq sqlite database file relative to PHP folder

    // REGEX PATTERNS FOR INPUT VALIDATIONS
    define("REGEX_AGENT_ID", "/^[\d]+$/"); // Numeric Agent ID
    define("REGEX_AGENT_NAME", "/^[\w\-\_\s]+$/"); // Alphanumeric with "-", "_" and " "
    define("REGEX_AGENT_HOST", "/^[\w\-\_\.]+$/"); // Alphanumeric with "-", "_" and "."
    define("REGEX_AGENT_PORT", "/^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/"); // TCP Port (0-65535)
    define("REGEX_BOT_ID", "/^[\w\-\_\.]+$/"); // Alphanumeric with "-", "_" and "."
    define("REGEX_LINES", "/^[\d]+$/"); // Numeric lines count
    define("REGEX_LOG_LEVEL", "/^(ALL|DEBUG|INFO|WARNING|ERROR|CRITICAL)$/"); // Whitelist of log levels
    define("REGEX_CONFIG_FILE_NAME", "/^(defaults|harmonization|pipeline|runtime|system|bots)$/"); // Whitelist of config files

    if (USE_BOTNET_AGENTS)
    {
        $FILES = [
            'defaults' => ['filename' => 'defaults.conf', 'source' => 'local'],
            'harmonization' => ['filename' => 'harmonization.conf', 'source' => 'agent'],
            'pipeline' => ['filename' => 'pipeline.conf', 'source' => 'agent'],
            'runtime' => ['filename' => 'runtime.conf', 'source' => 'agent'],
            'system' => ['filename' => 'system.conf', 'source' => 'local'],
            'bots' => ['filename' => 'BOTS', 'source' => 'agent']
        ];
    }
    else
    {
        $FILES = [
            'defaults' => ['filename' => 'defaults.conf', 'source' => 'local'],
            'harmonization' => ['filename' => 'harmonization.conf', 'source' => 'local'],
            'pipeline' => ['filename' => 'pipeline.conf', 'source' => 'local'],
            'runtime' => ['filename' => 'runtime.conf', 'source' => 'local'],
            'system' => ['filename' => 'system.conf', 'source' => 'local'],
            'bots' => ['filename' => 'BOTS', 'source' => 'local']
        ];
    }

?>