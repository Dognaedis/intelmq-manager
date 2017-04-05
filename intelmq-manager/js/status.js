
var ALL_BOTS = 'All Bots';

var bot_logs = {};
var bot_queues = {};
var bot_stats = {};
var reload_queues = null;
var reload_logs = null;


var log_datatable = $('#log-table').DataTable({
    lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
    pageLength: 10,
    order: [0, 'desc'],
    columns: [
        { "data": "date" },
        { "data": "log_level" },
        { "data": "message" },
        { "data": "actions" }
    ],
    autoWidth: true
});

var all_queues_datatable = $('#all-queues-table-div table').DataTable({
    order: [[ 1, "desc" ],[0, "asc"]]
});

var stats_datatable = $('#stats_table').DataTable({
        order: [[0, "asc"]]
});

window.onresize = function () {
    redraw();
};

function redraw() {
    redraw_logs();
    redraw_queues();
    if (USE_AGENTS)
    {
        redraw_stats();
    }

}

function redraw_logs() {
    log_datatable.clear();
    
    if  (bot_logs == {}) {

        log_datatable.draw();
        return;
    }
    
    for (var index in bot_logs) {
        var log_row = $.extend(true, {}, bot_logs[index]);
        if (log_row['extended_message']) {
            var buttons_cell = '' +
                '<button type="submit" class="pull-right btn btn-default btn-xs" data-toggle="modal" data-target="#extended-message-modal" onclick="show_extended_message(\'' + index + '\')"><span class="glyphicon glyphicon-plus"></span></button>';
            log_row['actions'] = buttons_cell;
        } else if (log_row['message'].length > MESSAGE_LENGTH) {
            log_row['message'] = log_row['message'].slice(0, MESSAGE_LENGTH) + '<strong>...</strong>';
            var buttons_cell = '' +
                '<button type="submit" class="pull-right btn btn-default btn-xs" data-toggle="modal" data-target="#extended-message-modal" onclick="show_extended_message(\'' + index + '\')"><span class="glyphicon glyphicon-plus"></span></button>';
            log_row['actions'] = buttons_cell;            
        } else {
            log_row['actions'] = '';
        }

        log_row['DT_RowClass'] = LEVEL_CLASS[log_row['log_level']];

        log_datatable.row.add(log_row);
    }

    log_datatable.draw();
}

function redraw_stats() {

    var bot_id = document.getElementById('monitor-target').innerHTML;

    stats_datatable.clear();

    $.each(bot_stats, function(index, bot){

        if (bot_id == ALL_BOTS || bot_id == bot.name )
        {
            var stat_line = "<tr>" +
                "<td>" + bot.name + "</td>" +
                "<td style='text-align: right;'>" + (Math.round(bot.stats.avg_consumed_per_time * 1000) / 1000) + "</td>" +
                "<td style='text-align: right;'>" + (Math.round(bot.stats.avg_produced_per_time * 1000) / 1000) + "</td>" +
                "<td style='text-align: right;'>" + (Math.round(bot.stats.avg_produced_per_runs * 1000) / 1000) + "</td>" +
                "<td style='text-align: right;'>" + (Math.round(bot.stats.avg_errors_per_runs * 1000) / 1000) + "</td>" +
                "</tr>";

            stats_datatable.row.add($(stat_line));
        }
    });
    stats_datatable.draw();
}

function redraw_queues() {
    var bot_id = document.getElementById('monitor-target').innerHTML;

    var all_queues_element = document.getElementById('all-queues');
    var source_queue_element = document.getElementById('source-queue');
    var internal_queue_element = document.getElementById('internal-queue');
    var destination_queues_element = document.getElementById('destination-queues');

    var cell0;
    var cell1;

    $(all_queues_element).empty();
    $(source_queue_element).empty();
    $(internal_queue_element).empty();
    $(destination_queues_element).empty();

    var source_queue;
    var destination_queues;
    var internal_queue;

    var bot_info = {};

    if (bot_id == ALL_BOTS) {
        bot_info['source_queues'] = {};
        bot_info['destination_queues'] = {};

        for (index in bot_queues) {
            source_queue = bot_queues[index]['source_queue'];
            destination_queues = bot_queues[index]['destination_queues'];
            internal_queue = bot_queues[index]['internal_queue'];

            if (source_queue) {
                bot_info['destination_queues'][source_queue[0]] = source_queue;
            }

            if (internal_queue !== undefined) {
              var queue_name = index + '-queue-internal';
              bot_info['destination_queues'][queue_name] = [queue_name, internal_queue];
            }

            if (destination_queues) {
                for (index in destination_queues) {
                    bot_info['destination_queues'][destination_queues[index][0]] = destination_queues[index];
                }
            }
        }

        var dst_queues = [];
        for (index in bot_info['destination_queues']) {
            dst_queues.push(bot_info['destination_queues'][index]);
        }

        dst_queues.sort();

        for (index in dst_queues) {
            var all_queue_row = "<tr>";

            r_level=Math.floor(((dst_queues[index][1] < QUEUE_SCALE_MAX ? dst_queues[index][1] : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX * 170));
            g_level=Math.floor(170-r_level);


            all_queue_row += '<td><span style="color:rgb('+r_level+','+g_level+',0);">'+ dst_queues[index][0] +'</span></td>';
            all_queue_row += '<td><span class="badge" style="background-color:rgb('+r_level+','+g_level+',0);">'+ dst_queues[index][1] +'</span></td>';

            all_queues_datatable.row.add($(all_queue_row));
        }

    }
    else
    {
        bot_info = bot_queues[bot_id];


        if (bot_info)
        {
            if (bot_info['source_queue']) {
                source_queue = source_queue_element.insertRow();

                r_level=Math.floor(((bot_info['source_queue'][1] < QUEUE_SCALE_MAX ? bot_info['source_queue'][1] : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX * 170));
                g_level=Math.floor(170-r_level);

                cell0 = source_queue.insertCell(0);
                cell0.innerHTML = '<span style="color:rgb('+r_level+','+g_level+',0);">'+ bot_info['source_queue'][0]+'</span>';

                cell1 = source_queue.insertCell(1);
                cell1.innerHTML = '<span class="badge" style="background-color:rgb('+r_level+','+g_level+',0);">'+ bot_info['source_queue'][1]+'</span>';
            }

            if (bot_info['internal_queue'] !== undefined) {
                internal_queue = internal_queue_element.insertRow();

                r_level=Math.floor(((bot_info['internal_queue'] < QUEUE_SCALE_MAX ? bot_info['internal_queue'] : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX * 170));
                g_level=Math.floor(170-r_level);

                cell0 = internal_queue.insertCell(0);
                cell0.innerHTML = '<span style="color:rgb('+r_level+','+g_level+',0);">internal-queue</span>';

                cell1 = internal_queue.insertCell(1);
                cell1.innerHTML = '<span class="badge" style="background-color:rgb('+r_level+','+g_level+',0);">'+ bot_info['internal_queue']+'</span>';
            }

            if (bot_info['destination_queues'] !== undefined) {

                var dst_queues = [];
                for (index in bot_info['destination_queues']) {
                    dst_queues.push(bot_info['destination_queues'][index]);
                }

                dst_queues.sort();


                for (index in dst_queues) {
                    var destination_queue = destination_queues_element.insertRow();

                    r_level=Math.floor(((dst_queues[index][1] < QUEUE_SCALE_MAX ? dst_queues[index][1] : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX * 170));
                    g_level=Math.floor(170-r_level);

                    cell0 = destination_queue.insertCell(0);
                    cell0.innerHTML = '<span style="color:rgb('+r_level+','+g_level+',0);">'+ dst_queues[index][0] +'</span>';

                    cell1 = destination_queue.insertCell(1);
                    cell1.innerHTML = '<span class="badge" style="background-color:rgb('+r_level+','+g_level+',0);">'+ dst_queues[index][1] +'</span>';
                }

            }


        }

    }

    all_queues_datatable.draw();

}

function load_bot_log() {
    $('#logs-panel-title').addClass('waiting');
    
    var number_of_lines = LOAD_X_LOG_LINES;
    
    var bot_id = document.getElementById('monitor-target').innerHTML;
    var level = document.getElementById('log-level-indicator').value;


    get_bot_logs(
        get_selected_agent(),
        bot_id,
        level,
        number_of_lines,
        function(data){
            bot_logs = data;
            redraw_logs();
            $('#logs-panel-title').removeClass('waiting');
        },
        show_error
    );

}

function load_bot_queues() {
    $('#queues-panel-title').addClass('waiting');
    
    get_botnet_queues(
        get_selected_agent(),
        function(data){
            bot_queues = data;
            redraw_queues();
            $('#queues-panel-title').removeClass('waiting');
        },
        show_error
    );

}

function load_bot_stats() {
    $('#stats_panel_title').addClass('waiting');

    get_botnet_stats(
        get_selected_agent(),
        function(data){
            bot_stats = data;
            bot_stats.sort(function(a,b) {return (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);} );
            redraw_stats();
            $('#stats_panel_title').removeClass('waiting');
        },
        show_error
    );

}

function select_bot(bot_id) {    
    if(reload_queues != null) {
        clearInterval(reload_queues);
    }
    
    if(reload_logs != null) {
        clearInterval(reload_logs);
    }
    
    document.getElementById('monitor-target').innerHTML = bot_id;
    load_bot_queues();
    if (USE_AGENTS)
    {
        load_bot_stats();
    }

    reload_queues = setInterval(function () {
        load_bot_queues();
        if (USE_AGENTS)
        {
            load_bot_stats();
        }
    }, RELOAD_QUEUES_EVERY * 1000);

    if(bot_id != ALL_BOTS) {
        $("#logs-panel").show();
        $("#source-queue-table-div").show();
        $("#internal-queue-table-div").show();
        $("#destination-queues-table-div").show();
        $("#all-queues-table-div").hide();

        load_bot_log();
        reload_logs = setInterval(function () {
            load_bot_log();
        }, RELOAD_LOGS_EVERY * 1000);
    } else {
        $("#logs-panel").hide();
        $("#source-queue-table-div").hide();
        $("#internal-queue-table-div").hide();
        $("#destination-queues-table-div").hide();
        $("#all-queues-table-div").show();

    }
}

function show_extended_message(index) {
    var modal_body = document.getElementById('modal-body');
    
    var message = bot_logs[index]['message'];
    
    if (bot_logs[index]['extended_message']) {
        message += '<br>\n' + 
                    bot_logs[index]['extended_message'].replace(/\n/g, '<br>\n').replace(/ /g, '&nbsp;');
    }
                           
    modal_body.innerHTML = message;
}

function update_bot_list(data)
{
    var sidemenu = document.getElementById('side-menu');

    var li_element = document.createElement('li');
    var link_element = document.createElement('a');
    link_element.innerHTML = ALL_BOTS;
    link_element.setAttribute('href', '#');
    link_element.setAttribute('onclick', 'select_bot("' + ALL_BOTS + '"); return false');

    li_element.appendChild(link_element);
    sidemenu.appendChild(li_element);

    var bots_ids = Object.keys(data);
    bots_ids.sort();

    for (index in bots_ids)
    {
        var bot_id = bots_ids[index];
        li_element = document.createElement('li');
        link_element = document.createElement('a');

        link_element.innerHTML = bot_id;
        link_element.setAttribute('href', '#');
        link_element.setAttribute('onclick', 'select_bot("' + bot_id + '"); return false');

        li_element.appendChild(link_element);
        sidemenu.appendChild(li_element);
    }
}



// Things to do on document ready

$(document).ready(function() {

    get_main_configs(
        function()
        {
            // Everything should be done only after the main configs are successfully retrieved

            // update agent list dropdown if (USE_AGENTS)
            if (USE_AGENTS)
            {
                get_agents(
                    function(data) {
                        update_agent_selector(data);

                        $('#stats_div').show();
                        $('#agent_selector_div').show();

                        select_bot(ALL_BOTS);
                        get_botnet_status(get_selected_agent(), update_bot_list, show_error);
                    },
                    function(error){
                        show_error(error);
                    }
                );
            }
            else
            {
                $('#stats_div').show();
                //$('#agent_selector_div').show();

                select_bot(ALL_BOTS);

                get_botnet_status(get_selected_agent(), update_bot_list, show_error);
            }
        },
        show_error
    );

});
