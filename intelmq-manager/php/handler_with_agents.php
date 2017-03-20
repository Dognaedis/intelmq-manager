<?php

    if (!defined('ACCESS_FROM_CONTROLLER'))
    {
        // No direct access to this file is allowed.
        die('Direct Access to this file is not allowed. Please use controller.php');
    }

    // Verify the existence of the database and the agents table. Creates it if missing.
    create_agents_table_if_missing();

    function send_curl_request($url, $post_data=[])
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        if (count($post_data)>0)
        {
            curl_setopt($ch, CURLOPT_POST, True);
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
        }
        else
        {

        }

        curl_setopt($ch, CURLOPT_HEADER, False);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, True);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);

        $output = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        curl_close($ch);

        if ($http_code == 200)
        {
            return $output;
        }
        else
        {
            return false;
        }
    }

    function create_agents_table_if_missing()
    {
        try
        {
            $db = new SQLite3(DATABASE, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
        }
        catch (Exception $exception)
        {
            // return error
            send_http_response(['result' => 'error', 'error_message' => 'Could not open (or create) the sqlite database. Please check the file and folder permissions.']);
        }

        $statement = $db->prepare('CREATE TABLE IF NOT EXISTS "agents" ( `id` INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT UNIQUE, `name` TEXT NOT NULL, `host` TEXT NOT NULL, `port` INTEGER NOT NULL )');
        $statement->execute();
        $db->close();
    };

    function add_agent($name, $host, $port)
    {
        try
        {
            $db = new SQLite3(DATABASE, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
        }
        catch (Exception $exception)
        {
            // return error
            send_http_response(['result' => 'error', 'error_message' => 'Could not open the sqlite database. Please check the file and folder permissions.']);
        }

        $statement = $db->prepare('INSERT INTO agents (name, host, port) values (:name, :host, :port);');
        $statement->bindValue(':name', $name);
        $statement->bindValue(':host', $host);
        $statement->bindValue(':port', $port);
        $statement->execute();
        if ($db->changes() == 1)
        {
            $output = $db->lastInsertRowid();
        }
        else
        {
            $output = false;
        }

        $db->close();

        return $output;
    }

    function remove_agent($id)
    {
        try
        {
            $db = new SQLite3(DATABASE, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
        }
        catch (Exception $exception)
        {
            // return error
            send_http_response(['result' => 'error', 'error_message' => 'Could not open the sqlite database. Please check the file and folder permissions.']);
        }

        $statement = $db->prepare('DELETE FROM agents WHERE id = :id;');
        $statement->bindValue(':id', $id);
        $statement->execute();
        $output = $db->changes();

        $db->close();

        return $output;
    }

    function get_agent($id)
    {
        try
        {
            $db = new SQLite3(DATABASE, SQLITE3_OPEN_READONLY);
        }
        catch (Exception $exception)
        {
            // return error
            send_http_response(['result' => 'error', 'error_message' => 'Could not open the sqlite database. Please check the file and folder permissions.']);
        }

        $statement = $db->prepare('SELECT * FROM agents WHERE id = :id;');
        $statement->bindValue(':id', $id);
        $result = $statement->execute();
        $output = $result->fetchArray(SQLITE3_ASSOC);

        $db->close();

        return $output;
    }

    function get_first_agent()
    {
        try
        {
            $db = new SQLite3(DATABASE, SQLITE3_OPEN_READONLY);
        }
        catch (Exception $exception)
        {
            // return error
            send_http_response(['result' => 'error', 'error_message' => 'Could not open the sqlite database. Please check the file and folder permissions.']);
        }

        $statement = $db->prepare('SELECT * FROM agents ORDER BY name;');
        $result = $statement->execute();
        $output = $result->fetchArray(SQLITE3_ASSOC);

        $db->close();

        return $output;
    }

    function get_agents()
    {
        try
        {
            $db = new SQLite3(DATABASE, SQLITE3_OPEN_READONLY);
        }
        catch (Exception $exception)
        {
            // return error
            send_http_response(['result' => 'error', 'error_message' => 'Could not open the sqlite database. Please check the file and folder permissions.']);
        }

        $statement = $db->prepare('SELECT * FROM agents ORDER BY name;');
        $result = $statement->execute();
        $output = array();
        while ($agent=$result->fetchArray(SQLITE3_ASSOC))
        {
            $output[]=$agent;
        }
        $db->close();
        return $output;
    }

    // Ajax handle functions
    function handle_request()
    {
        global $FILES;

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
                                    'use_agents' => true
                                ]
                        ]
                    );

                    break;

                case 'get_agents':
                    $agents = get_agents();
                    if (is_array($agents))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['agents' => $agents]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the agents list from database.']);
                    }

                    break;


                case 'get_agent':
                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }
                    else
                    {
                        send_http_response(['result'=>'ok', 'data'=>$agent]);
                    }

                    break;

                case 'add_agent':

                    if (!(preg_match(REGEX_AGENT_NAME, $_POST['agent_name']) and preg_match(REGEX_AGENT_HOST, $_POST['agent_host']) and preg_match(REGEX_AGENT_PORT, $_POST['agent_port'])))
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Missing or wrong arguments.']);
                    }
                    else
                    {
                        if ($agent_id = add_agent($_POST['agent_name'], $_POST['agent_host'], $_POST['agent_port']))
                        {
                            send_http_response(['result'=>'ok', 'data'=> ['created_agent' => $agent_id]]);
                        }
                        else
                        {
                            send_http_response(['result'=>'error', 'error_message'=>'Error creating the agent.']);
                        }
                    }

                    break;

                case 'remove_agent':

                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and remove_agent($_POST['agent_id'])==1))
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error removing the agent.']);
                    }
                    else
                    {
                        send_http_response(['result' => 'ok', 'data' => [ 'removed_agent' => $_POST['agent_id']]]);
                    }

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
                        case 'agent': // get the file through the agent

                            // Agent
                            if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                            {
                                // missing or wrong agent
                                send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                            }

                            $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/config/'.$file['filename'].'/load/'),true);

                            if (is_array($output))
                            {
                                send_http_response(['result'=>'ok', 'data'=>['contents' => json_decode($output['contents'])]]);
                            }
                            else
                            {
                                send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                            }

                            break;

                        case 'local': // get the file from disk

                            if (file_exists(CONFIG_FILES_BASE_FOLDER.'/'.$file['filename']) and $contents=file_get_contents(CONFIG_FILES_BASE_FOLDER.'/'.$file['filename']))
                            {
                                $output=json_decode($contents, true);
                                if (is_array($output))
                                {
                                    send_http_response(['result'=>'ok', 'data'=>['contents' => $output]]);
                                }
                                else
                                {
                                    send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from disk.']);
                                }
                            }
                            else
                            {
                                send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from disk.']);
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
                        case 'agent': // get the file through the agent

                            // Agent
                            if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                            {
                                // missing or wrong agent
                                send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                            }

                            if (!(isset($_POST['file_contents'])))
                            {
                                // no config file contents, die with error
                                send_http_response(['result' => 'error', 'error_message' => 'Invalid file contents']);
                            }

                            $file_contents=$_POST['file_contents'];

                            $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/config/'.$file['filename'].'/save/', ['contents'=>$file_contents]),true);

                            if (is_array($output))
                            {
                                send_http_response(['result'=>'ok', 'data'=>$output]);
                            }
                            else
                            {
                                send_http_response(['result'=>'error', 'error_message'=>'Error sending the data to the agent.']);
                            }

                            break;

                        case 'local': // get the file from disk

                            if (!(isset($_POST['file_contents'])))
                            {
                                // no config file contents, die with error
                                send_http_response(['result' => 'error', 'error_message' => 'Invalid file contents']);
                            }

                            $file_contents=$_POST['file_contents'];

                            if (file_exists(CONFIG_FILES_BASE_FOLDER.'/'.$file['filename']))
                            {
                                if (file_put_contents(CONFIG_FILES_BASE_FOLDER.'/'.$file['filename'], $file_contents))
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

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/bot/'.$bot_id.'/start/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'stop_bot':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/bot/'.$bot_id.'/stop/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'force_stop_bot':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    if (!(isset($_POST['bot']) and preg_match(REGEX_BOT_ID, $_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/bot/'.$bot_id.'/forcestop/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'get_bot_logs':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

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

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/bot/'.$bot_id.'/logs/'.$lines.'/'.$level.'/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'get_bot_stats':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    if (!(isset($_POST['bot'])))
                    {
                        // no bot selected, die with error
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid bot id']);
                    }

                    $bot_id=$_POST['bot'];

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/bot/'.$bot_id.'/stats/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                // BOTNETS

                case 'start_botnet':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/start/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['status' => $output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'stop_botnet':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/stop/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['status' => $output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'force_stop_botnet':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/forcestop/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>['status' => $output]]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'get_botnet_logs':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
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

                    $lines=$_POST['lines'];
                    $level=($_POST['level'] == 'ALL'? 'DEBUG': $_POST['level']);

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/logs/'.$lines.'/'.$level.'/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'get_botnet_stats':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/stats/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;

                case 'get_botnet_queues':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/queues/'),true);

                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
                    }

                    break;


                case 'get_botnet_status':

                    // Agent
                    if (!(isset($_POST['agent_id']) and preg_match(REGEX_AGENT_ID, $_POST['agent_id']) and $agent=get_agent($_POST['agent_id'])))
                    {
                        // missing or wrong agent
                        send_http_response(['result' => 'error', 'error_message' => 'Invalid agent id']);
                    }

                    $output=json_decode(send_curl_request($agent['host'].':'.$agent['port'].'/api/botnet/status/'),true);


                    if (is_array($output))
                    {
                        send_http_response(['result'=>'ok', 'data'=>$output]);
                    }
                    else
                    {
                        send_http_response(['result'=>'error', 'error_message'=>'Error getting the data from the agent.']);
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
            send_http_response(['result'=>'error', 'error_message'=>'Missing operation']);
        }
    }
?>