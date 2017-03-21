<?php

    if (!defined('ACCESS_FROM_CONTROLLER'))
    {
        // No direct access to this file is allowed.
        die('Direct Access to this file is not allowed. Please use controller.php');
    }

    function query_intelmqctl($arguments)
    {
        if (DEBUG_API)
        {
            error_log("[EXECUTING INTELMQCTL]");
            error_log("[INTELMQCTL REQUEST CONTROLLER]: " . CONTROLLER);
            error_log("[INTELMQCTL REQUEST ARGUMENTS]: " . $arguments);
        }

        $command = sprintf(CONTROLLER, $arguments);

        set_time_limit(60);

        $return = shell_exec($command);

        if (DEBUG_API)
        {
            error_log("[GOT INTELMQCTL RESPONSE]");
            error_log("[EXECUTING INTELMQCTL]");
            error_log("[INTELMQCTL RESPONSE]: " . $return);
        }
        return ($return);
    };

    function handle_request()
    {
        global $FILES;

        if (DEBUG_API)
        {
            error_log("[HANDLING REQUEST]");
            error_log("[REQUESTED GET DATA]: " . json_encode($_GET));
            error_log("[REQUESTED POST DATA]: " . json_encode($_POST));
        }


        if (isset($_GET['operation']))
        {

            switch ($_GET['operation'])
            {
                // CONFIGS

                case 'get_main_configs':

                    send_http_response(
                        [
                            'result'=>'ok',
                            'data'=>
                                [
                                    'use_agents' => false
                                ]
                        ]
                    );

                    break;

                case 'load_config':

                    // Validation of arguments

                    // Config File
                    if (!(isset($_POST['config_file']) and isset($FILES[$_POST['config_file']]) and $file=$FILES[$_POST['config_file']]))
                    {
                        // no or wrong bot name
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid config_file']);
                    }

                    switch ($file['source'])
                    {
                        case 'agent':
                            // We are not using agents, so lets return an error.
                            send_http_response(['result'=>'error', 'error_message'=>'The application is not set to use agents.']);
                            break;

                        case 'local': // get the file from disk

                            if (file_exists(CONFIG_FILES_BASE_FOLDER.$file['filename']))
                            {
                                $output=json_decode(file_get_contents(CONFIG_FILES_BASE_FOLDER.$file['filename']),true);
                                if (is_array($output))
                                {
                                    send_http_response(['result'=>'ok', 'data'=>['contents' => $output]]);
                                }
                                else
                                {
                                    send_http_response(['result'=>'error', 'error_message'=>'Error extracting valid data from the file ('.CONFIG_FILES_BASE_FOLDER.$file['filename'].')']);
                                }
                            }
                            else
                            {
                                send_http_response(['result'=>'error', 'error_message'=>'Error getting the file from disk ('.CONFIG_FILES_BASE_FOLDER.$file['filename'].')']);
                            }

                            break;
                    }

                    break;

                case 'save_config':

                    // Validation of arguments

                    // Config File
                    if (!(isset($_POST['config_file']) and isset($FILES[$_POST['config_file']]) and $file=$FILES[$_POST['config_file']]))
                    {
                        // no or wrong bot name
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid config_file']);
                    }

                    switch ($file['source'])
                    {
                        case 'agent':
                            // We are not using agents, so lets return an error.
                            send_http_response(['result'=>'error', 'error_message'=>'The application is not set to use agents.']);
                            break;

                        case 'local': // get the file from disk

                            if (!(isset($_POST['file_contents'])))
                            {
                                // no config file contents, die with error
                                send_http_response(['result' => 'error', 'error_message' => 'Invalid file contents']);
                            }

                            $file_contents=$_POST['file_contents'];

                            if (file_exists(CONFIG_FILES_BASE_FOLDER.$file['filename']))
                            {
                                if (file_put_contents(CONFIG_FILES_BASE_FOLDER.$file['filename'], $file_contents))
                                {
                                    send_http_response(['result'=>'ok', 'data'=>['md5'=>md5($file_contents)]]);
                                }
                                else
                                {
                                    send_http_response(['result'=>'error', 'error_message'=>'Error storing the data on disk.']);
                                }
                            }
                            else
                            {
                                send_http_response(['result'=>'error', 'error_message'=>'Error storing the data on disk.']);
                            }

                            break;

                    }

                    break;

                // BOTS

                case 'start_bot':

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output = preg_replace("/[^a-z]/", '', query_intelmqctl('start '.$bot_id.' --type json'));

                    if (in_array($output, array('started', 'running', 'stopped', 'crashed')))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['result'=>$output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;

                case 'stop_bot':

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output = preg_replace("/[^a-z]/", '', query_intelmqctl('stop '.$bot_id.' --type json'));

                    if (in_array($output, array('started', 'running', 'stopped', 'crashed')))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['result'=>$output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;

                case 'force_stop_bot':

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output = preg_replace("/[^a-z]/", '', query_intelmqctl('kill '.$bot_id.' --type json'));

                    if (in_array($output, array('started', 'running', 'stopped', 'crashed')))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['result'=>$output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;


                case 'get_bot_logs':

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    if (!(isset($_POST['level']) and preg_match(REGEX_LOG_LEVEL, $_POST['level'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid log level']);
                    }

                    if (!(isset($_POST['lines']) and preg_match(REGEX_BOT_ID, $_POST['lines'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid number of lines']);
                    }

                    $bot_id=$_POST['bot'];
                    $lines=$_POST['lines'];
                    $level=($_POST['level'] == 'ALL'? 'DEBUG': $_POST['level']);

                    $output = json_decode(query_intelmqctl('log '.$bot_id.' '.$lines.' '.$level.' --type json'), true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;

                // BOTNETS

                case 'start_botnet':

                    $output = json_decode(query_intelmqctl('start --type json'), true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['status' => $output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;

                case 'stop_botnet':

                    $output = json_decode(query_intelmqctl('stop --type json'), true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['status' => $output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;

                case 'force_stop_botnet':

                    $output = json_decode(query_intelmqctl('kill --type json'), true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['status' => $output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the intelmqctl.']);
                    }

                    break;

                case 'get_botnet_queues':

                    $output = json_decode(query_intelmqctl('list queues --type json'), true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from intelmqctl.']);
                    }

                    break;


                case 'get_botnet_status':

                    $output = json_decode(query_intelmqctl('status --type json'), true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from intelmqctl.']);
                    }

                    break;

                default:
                    // unrecognized operation, return an error
                    send_http_response(['result'=>'error', 'error_message'=>'Invalid operation']);
                    break;
            }
        }
        else
        {
            send_http_response(['result'=>'error', 'error_message'=>'Missing operation'], "HTTP/1.1 403 Bad Request");
        }
    }
?>