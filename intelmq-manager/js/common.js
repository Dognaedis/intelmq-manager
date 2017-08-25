
function show_error(string) {
    if(!page_is_exiting) {
        $.alert({
            title: 'Error:',
            content: string,
            type: 'red',
            autoClose: 'ok|10000',
            backgroundDismiss: true
        });

    }
}

function show_simple_modal(title, body){
    $.alert({
        title: title,
        content: body,
        type: 'blue',
        autoClose: 'ok|20000',
        backgroundDismiss: true
    });

}

function update_agent_selector(agents)
{
    var one_selected = false;

    $(agents).each(function(index, agent)
    {
        if(agent.id==get_selected_agent())
        {
            $('#agent_selector').append('<option value="'+agent.id+'" selected>'+agent.name+'</option>');
            one_selected = true;
        }
        else
        {
            $('#agent_selector').append('<option value="'+agent.id+'">'+agent.name+'</option>');
        }
    });

    $('#agent_selector').change(function(e){
        set_selected_agent($(this).val());
        location.reload();
        e.preventDefault();
        return false;
    });

    if ((!one_selected) && (agents[0].id!=undefined))
    {
        set_selected_agent(agents[0].id);
        location.reload();
    }
}

function set_selected_agent(id)
{
    if (USE_AGENTS)
    {
        localStorage.setItem("selected_agent", id);
    }
}

function get_selected_agent()
{
    if (USE_AGENTS)
    {
        if (localStorage.getItem("selected_agent") !== undefined)
        {
            return localStorage.getItem("selected_agent");
        }
        else
        {
            return -1;
        }
    }
    else
    {
        return 0;
    }
}

function start_botnet(agent_id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=start_botnet',
        data: {'agent_id': agent_id},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('status')) {
                    success(json.data.status);
                }
                else
                {
                    fail('Failed to get the operation result');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function stop_botnet(agent_id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=stop_botnet',
        data: {'agent_id': agent_id},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('status')) {
                    success(json.data.status);
                }
                else
                {
                    fail('Failed to get the operation result');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function forcestop_botnet(agent_id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=force_stop_botnet',
        data: {'agent_id': agent_id},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('status')) {
                    success(json.data.status);
                }
                else
                {
                    fail('Failed to get the operation result');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function start_bot(agent_id, bot_id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=start_bot',
        data: {'agent_id': agent_id, 'bot': bot_id},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('result')) {
                    success(json.data.result);
                }
                else
                {
                    fail('Failed to get the operation result');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function stop_bot(agent_id, bot_id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=stop_bot',
        data: {'agent_id': agent_id, 'bot': bot_id},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('result')) {
                    success(json.data.result);
                }
                else
                {
                    fail('Failed to get the operation result');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function forcestop_bot(agent_id, bot_id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=force_stop_bot',
        data: {'agent_id': agent_id, 'bot': bot_id},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('result')) {
                    success(json.data.result);
                }
                else
                {
                    fail('Failed to get the operation result');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function get_bot_logs(agent_id, bot_id, level, lines, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=get_bot_logs',
        data: {'agent_id': agent_id, 'bot': bot_id, 'level': level, 'lines': lines},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data')) {
                    success(json.data);
                }
                else
                {
                    fail('Failed to get the botnet status');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}


function get_botnet_status(id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=get_botnet_status',
        data: {'agent_id': id},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data')) {
                    success(json.data);
                }
                else
                {
                    fail('Failed to get the botnet status');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function get_botnet_stats(id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=get_botnet_stats',
        data: {'agent_id': id},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data')) {
                    success(json.data);
                }
                else
                {
                    fail('Failed to get the botnet stats');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}


function get_botnet_queues(id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=get_botnet_queues',
        data: {'agent_id': id},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data')) {
                    success(json.data);
                }
                else
                {
                    fail('Failed to get the botnet queues');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function add_agent(agent_name, agent_host, agent_port, success, fail){
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=add_agent',
        data: {'agent_name': agent_name, 'agent_host': agent_host, 'agent_port': agent_port},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                success(json);
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function remove_agent(id, success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=remove_agent',
        data: {'agent_id': id},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                success(json);
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function get_agents(success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=get_agents',
        data: {},
        dataType: 'json',
        success: function(json)
        {
            if (json.result=='ok')
            {

                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('agents'))
                {
                    if (json.data.agents[0]!==undefined || PAGE=='agents')
                    {
                        success(json.data.agents);
                    }
                    else
                    {
                        window.location='agents.html'
                    }
                }
                else
                {
                    fail('Failed to get the agents');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function load_file(agent_id, file, success, fail) {

    postdata={
        'config_file': file,
        'agent_id': agent_id
    };

    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=load_config',
        data: postdata,
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                if (json.hasOwnProperty('data') && json.data.hasOwnProperty('contents'))
                {
                    success(json.data.contents);
                }
                else
                {
                    fail('Failed to load file (' + file + ')');
                }
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function save_file(agent_id, file, contents, success, fail) {

    postdata={
        'config_file': file,
        'file_contents': contents,
        'agent_id': agent_id
    }

    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=save_config',
        data: postdata,
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                success(json);
            }
            else
            {
                fail(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}

function get_main_configs(success, fail)
{
    $.ajax({
        method: 'POST',
        url: MANAGEMENT_SCRIPT+'?operation=get_main_configs',
        data: {},
        dataType: 'json',
        success: function(json){
            if (json.result=='ok')
            {
                if (json.data.use_agents != undefined)
                {
                    USE_AGENTS = json['data']['use_agents'];
                }
                success();
            }
            else
            {
                show_error(json.error_message);
            }
        },
        fail: function (jqxhr, textStatus, error){
            fail(error);
        },
        error: function (jqxhr, textStatus, error){
            fail(error);
        }
    });
}


/* Things to do on document ready */

$(document).ready(function()
{

    // Check for localStorage support on browser;
    if (USE_AGENTS)
    {
        if (typeof(Storage) == "undefined")
        {
            show_error("Your browser does not support local storage. Please update it.")
        }
    }


    $(window).on('unload', function() {
        page_is_exiting = true;
    });

});