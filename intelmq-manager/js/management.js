var BOT_CLASS = {
    'starting': 'bot_starting',
    'running': 'bot_running',
    'stopping': 'bot_stopping',
    'stopped': 'bot_stopped',
    'crashed': 'bot_crashed'
};

var bot_status = {};

var bot_datatable = $('#bot-table').DataTable({
        lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
        pageLength: 25,
        columns: [
            { "data": "bot_id" },
            { "data": "bot_status" },
            { "data": "actions" }
        ],
        columnDefs: [
            { "width": "100px", "targets": 1 },
            { "width": "100px", "targets": 2 },
        ],
        order: [[ 0, "asc" ]]
    });

window.onresize = function () {
    bot_datatable.draw();
};

function update_bot_status(data)
{
    var totals={
            starting:0,
            running:0,
            stopped:0,
            crashed:0,
            stopping:0
    };

    bot_status = data;

    var botnet_status = 'stopped';
    var full_run = true;
    
    var botnet_status_element = document.getElementById('botnet-status');

    bot_datatable.clear();
    
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
            'DT_RowClass': ''+BOT_CLASS[bot_status[bot_id]]
        };

        bot_datatable.row.add(bot_row);


        totals[bot_status[bot_id]]++;
    }

    //update count badges
    $('#badge_starting').html(totals.starting);
    $('#badge_running').html(totals.running);
    $('#badge_stopping').html(totals.stopping);
    $('#badge_stopped').html(totals.stopped);
    $('#badge_crashed').html(totals.crashed);


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

    botnet_status_element.setAttribute('class', '' + BOT_CLASS[botnet_status]);
    botnet_status_element.innerHTML = botnet_status;


    $('#botnet-status-panel-title').removeClass('waiting');
    
    //$('#log-table').dataTable().fnAdjustColumnSizing();
    bot_datatable.draw();
    
}

function start_all_botnets()
{
    get_agents(
        function(agents)
        {
            $(agents).each(function(index, agent)
            {
                $('#all_botnet-status-panel-title').addClass('waiting');

                start_botnet(
                    agent.id,
                    function(){
                        $('#all_botnet-status-panel-title').removeClass('waiting');
                        if(agent.id==get_selected_agent()){
                            $('#botnet-status-panel-title').addClass('waiting');
                            get_botnet_status(
                                agent.id,
                                function(status)
                                {
                                    update_bot_status(status);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                },
                                function(error)
                                {
                                    show_error(error);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                }
                            );
                        }
                    },
                    function(error)
                    {
                        show_error(error);

                        $('#all_botnet-status-panel-title').removeClass('waiting');
                        if(agent.id==get_selected_agent()){
                            $('#botnet-status-panel-title').addClass('waiting');
                            get_botnet_status(
                                agent.id,
                                function(status)
                                {
                                    update_bot_status(status);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                },
                                function(error)
                                {
                                    show_error(error);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                }
                            );
                        }
                    }
                );
            });
        },
        show_error
    );
}

function stop_all_botnets()
{
    get_agents(
        function(agents)
        {
            $(agents).each(function(index, agent)
            {
                $('#all_botnet-status-panel-title').addClass('waiting');

                stop_botnet(
                    agent.id,
                    function(){
                        $('#all_botnet-status-panel-title').removeClass('waiting');
                        if(agent.id==get_selected_agent()){
                            $('#botnet-status-panel-title').addClass('waiting');
                            get_botnet_status(
                                agent.id,
                                function(status)
                                {
                                    update_bot_status(status);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                },
                                function(error)
                                {
                                    show_error(error);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                }
                            );
                        }
                    },
                    function(error)
                    {
                        show_error(error);

                        $('#all_botnet-status-panel-title').removeClass('waiting');
                        if(agent.id==get_selected_agent()){
                            $('#botnet-status-panel-title').addClass('waiting');
                            get_botnet_status(
                                agent.id,
                                function(status)
                                {
                                    update_bot_status(status);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                },
                                function(error)
                                {
                                    show_error(error);
                                    $('#botnet-status-panel-title').removeClass('waiting');
                                }
                            );
                        }
                    }
                );
            });
        },
        show_error
    );
}

// Things to do on document ready

$(document).ready(function() {

    get_main_configs(
        function()
        {
            // Everything should be done only after the main configs are successfully retrieved

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

            $('#refresh').click(function(e){
                location.reload();
                e.preventDefault();
                return false;
            });

            // handle start and stop all botnet buttons
            $('#start_all_botnets').click(function(e){

                start_all_botnets();

                e.preventDefault();
                return false;
            });

            $('#stop_all_botnets').click(function(e){

                stop_all_botnets();

                e.preventDefault();
                return false;
            });

            // update agent list dropdown if (USE_AGENTS)
            if (USE_AGENTS)
            {
                $('#agent_selector_div').show();
                $('#all_botnet_buttons_section').show();

                get_agents(
                    function(data) {
                        update_agent_selector(data);
                        bot_datatable.draw();
                        $('#botnet-status-panel-title').addClass('waiting');
                        get_botnet_status(get_selected_agent(), update_bot_status, show_error);
                    },
                    function(error){
                        show_error(error);
                    }
                );
            }
            else
            {
                bot_datatable.draw();
                $('#botnet-status-panel-title').addClass('waiting');
                get_botnet_status(get_selected_agent(), update_bot_status, show_error);
            }
        },
        show_error
    );

});
