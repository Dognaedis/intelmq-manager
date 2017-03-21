var BOT_CLASS = {
    'starting': 'warning',
    'running': 'success',
    'stopping': 'danger',
    'stopped': 'danger'
};

var bot_status = {};

$('#bot-table').dataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        pageLength: -1,
        columns: [
            { "data": "bot_id" },
            { "data": "bot_status" },
            { "data": "actions" }
        ]
    });

window.onresize = function () {
    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
};

function update_bot_status(data)
{

    bot_status = data;

    var botnet_status = 'stopped';
    var full_run = true;
    
    var botnet_status_element = document.getElementById('botnet-status');

    $('#bot-table').dataTable().fnClearTable();
    
    for (bot_id in bot_status) {
        if (bot_status[bot_id].indexOf('stop') != -1) {
            full_run = false;
        } else {
            botnet_status = 'running';
        }
        
        buttons_cell = '' +
            '<button type="submit" class="btn btn-xs btn-default bot_list_start" data-bot-id="'+bot_id+'"><span class="fa fa-fw fa-play"></span></button>&nbsp;' +
            '<button type="submit" class="btn btn-xs btn-default bot_list_stop" data-bot-id="'+bot_id+'"><span class="fa fa-fw fa-square"></span></button>&nbsp;' +
            '<button type="submit" class="btn btn-xs btn-default bot_list_forcestop" data-bot-id="'+bot_id+'"><span class="fa fa-fw fa-bomb"></span></button>';

        bot_row = {
            'bot_id': bot_id,
            'bot_status': bot_status[bot_id],
            'actions': buttons_cell,
            'DT_RowClass': BOT_CLASS[bot_status[bot_id]]
        };

        $('#bot-table').dataTable().fnAddData(bot_row);
    }

    $('#bot-table .bot_list_start').click(function(e){
        $('#botnet-status-panel-title').addClass('waiting');
        bot_id=$(this).data('bot-id');
        start_bot(
            get_selected_agent(),
            bot_id,
            function(status){
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            },
            function(error){
                show_error(error);
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            }
        );
        e.preventDefault();
        return false;
    });

    $('#bot-table .bot_list_stop').click(function(e){
        $('#botnet-status-panel-title').addClass('waiting');
        bot_id=$(this).data('bot-id');
        stop_bot(
            get_selected_agent(),
            bot_id,
            function(status){
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            },
            function(error){
                show_error(error);
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            }
        );
        e.preventDefault();
        return false;
    });

    $('#bot-table .bot_list_forcestop').click(function(e){
        $('#botnet-status-panel-title').addClass('waiting');
        bot_id=$(this).data('bot-id');
        forcestop_bot(
            get_selected_agent(),
            bot_id,
            function(status){
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            },
            function(error){
                show_error(error);
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            }
        );
        e.preventDefault();
        return false;
    });

    botnet_status_element.setAttribute('class', 'bg-' + BOT_CLASS[botnet_status]);
    botnet_status_element.innerHTML = botnet_status;

    $('#botnet-status-panel-title').removeClass('waiting');
    
    //$('#log-table').dataTable().fnAdjustColumnSizing();
    $('#bot-table').dataTable().fnDraw();
    
}

// Things to do on document ready

$(document).ready(function() {

    get_main_configs(
        function()
        {
            // Everything should be done only after the main configs are successfully retrieved

            $('#bot-table').dataTable();
            $('#botnet-status-panel-title').addClass('waiting');
            get_botnet_status(get_selected_agent(), update_bot_status, show_error);

            // handle start and stop botnet buttons
            $('#start_botnet').click(function(e){
                $('#botnet-status-panel-title').addClass('waiting');
                start_botnet(
                    get_selected_agent(),
                    function(status){

                        get_botnet_status(get_selected_agent(), update_bot_status, show_error);
                    },
                    function(error){

                        show_error(error);
                        get_botnet_status(get_selected_agent(), update_bot_status, show_error);
                    }
                );
                e.preventDefault();
                return false;
            });

            $('#stop_botnet').click(function(e){
                $('#botnet-status-panel-title').addClass('waiting');
                stop_botnet(
                    get_selected_agent(),
                    function(status){
                        get_botnet_status(get_selected_agent(), update_bot_status, show_error);
                    },
                    function(error){
                        show_error(error);
                        get_botnet_status(get_selected_agent(), update_bot_status, show_error);
                    }
                );
                e.preventDefault();
                return false;
            });

            // update agent list dropdown if (USE_AGENTS)
            if (USE_AGENTS)
            {
                $('#agent_selector_div').show();

                get_agents(
                    function(data) {
                        update_agent_selector(data);
                    },
                    function(error){
                        show_error(error);
                    }
                );
            }
        },
        show_error
    );

});
