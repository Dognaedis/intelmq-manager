
var ALL_BOTS = 'All Bots';

var bot_logs = {};
var bot_queues = {};
var bot_stats = {};
var reload_queues = null;
var reload_logs = null;


$('#log-table').dataTable({
    lengthMenu: [[5, 10, 25, -1], [5, 10, 25, "All"]],
    pageLength: 10,
    order: [0, 'desc'],
    columns: [
        { "data": "date" },
        //{ "data": "bot_id" },
        { "data": "log_level" },
        { "data": "message" },
        { "data": "actions" }
    ]
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
    $('#log-table').dataTable().fnClearTable();
    
    if  (bot_logs == {}) {
        $('#log-table').dataTable().fnAdjustColumnSizing();
        $('#log-table').dataTable().fnDraw();
        return;
    }
    
    for (var index in bot_logs) {
        var log_row = $.extend(true, {}, bot_logs[index]);
        if (log_row['extended_message']) {
            var buttons_cell = '' +
                '<button type="submit" class="btn btn-default btn-xs" data-toggle="modal" data-target="#extended-message-modal" onclick="show_extended_message(\'' + index + '\')"><span class="glyphicon glyphicon-plus"></span></button>';
            log_row['actions'] = buttons_cell;
        } else if (log_row['message'].length > MESSAGE_LENGTH) {
            log_row['message'] = log_row['message'].slice(0, MESSAGE_LENGTH) + '<strong>...</strong>';
            var buttons_cell = '' +
                '<button type="submit" class="btn btn-default btn-xs" data-toggle="modal" data-target="#extended-message-modal" onclick="show_extended_message(\'' + index + '\')"><span class="glyphicon glyphicon-plus"></span></button>';
            log_row['actions'] = buttons_cell;            
        } else {
            log_row['actions'] = '';
        }

        
        log_row['DT_RowClass'] = LEVEL_CLASS[log_row['log_level']];
        
        
        $('#log-table').dataTable().fnAddData(log_row);
    }
    
    $('#log-table').dataTable().fnAdjustColumnSizing();
    $('#log-table').dataTable().fnDraw();
}

function redraw_stats() {

    var bot_id = document.getElementById('monitor-target').innerHTML;

    $("#stats_table_body").empty();

    $.each(bot_stats, function(index, bot){

        if (bot_id == ALL_BOTS || bot_id == bot.name )
        {
            var stat_line = "<tr>" +
                "<td>" + bot.name + "</td>" +
                "<td style='text-align: right;'>" + Math.round(bot.stats.avg_consumed_per_time * 1000) / 1000 + "</td>" +
                "<td style='text-align: right;'>" + Math.round(bot.stats.avg_produced_per_time * 1000) / 1000 + "</td>" +
                "<td style='text-align: right;'>" + Math.round(bot.stats.avg_produced_per_runs * 1000) / 1000 + "</td>" +
                "<td style='text-align: right;'>" + Math.round(bot.stats.avg_errors_per_runs * 1000) / 1000 + "</td>" +
                "<tr>";

            $("#stats_table_body").append(stat_line);
        }
    });

}


function redraw_queues() {
    var bot_id = document.getElementById('monitor-target').innerHTML;

    var source_queue_element = document.getElementById('source-queue');
    var internal_queue_element = document.getElementById('internal-queue');
    var destination_queues_element = document.getElementById('destination-queues');

    var cell0;
    var cell1;

    source_queue_element.innerHTML = '';
    internal_queue_element.innerHTML = '';
    destination_queues_element.innerHTML = '';

    var bot_info = {};
    if (bot_id == ALL_BOTS) {
        bot_info['source_queues'] = {};
        bot_info['destination_queues'] = {};

        for (index in bot_queues) {
            var source_queue = bot_queues[index]['source_queue'];
            var destination_queues = bot_queues[index]['destination_queues'];
            var internal_queue = bot_queues[index]['internal_queue'];

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
    } else {
        var bot_info = bot_queues[bot_id];
    }

    if (bot_info) {
        if (bot_info['source_queue']) {
            var source_queue = source_queue_element.insertRow();

            r_level=Math.floor(((bot_info['source_queue'][1] < QUEUE_SCALE_MAX ? bot_info['source_queue'][1] : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX * 170));
            g_level=Math.floor(170-r_level);

            cell0 = source_queue.insertCell(0);
            cell0.innerHTML = '<span style="color:rgb('+r_level+','+g_level+',0);">'+ bot_info['source_queue'][0]+'</span>';

            cell1 = source_queue.insertCell(1);
            cell1.innerHTML = '<span class="badge" style="background-color:rgb('+r_level+','+g_level+',0);">'+ bot_info['source_queue'][1]+'</span>';
        }

        if (bot_info['internal_queue'] !== undefined) {
            var internal_queue = internal_queue_element.insertRow();

            r_level=Math.floor(((bot_info['internal_queue'] < QUEUE_SCALE_MAX ? bot_info['internal_queue'] : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX * 170));
            g_level=Math.floor(170-r_level);

            cell0 = internal_queue.insertCell(0);
            cell0.innerHTML = '<span style="color:rgb('+r_level+','+g_level+',0);">internal-queue</span>';

            cell1 = internal_queue.insertCell(1);
            cell1.innerHTML = '<span class="badge" style="background-color:rgb('+r_level+','+g_level+',0);">'+ bot_info['internal_queue']+'</span>';
        }

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
    else
    {
        $('#stats_table_body').empty().append('' +
            '<tr>' +
            '   <td colspan="4" style="text-align:center;">' +
            '       <br><p> The Bot statistics are only available when the <b>IntelMQ Manager</b> is configured to use botnet agents.<br><br>To enable it, please define the "<b>USE_BOTNET_AGENTS</b>" as "<b>true</b>" in the main config.</p>' +
            '   </td>' +
            '</tr>'
        );
    }
    
    reload_queues = setInterval(function () {
        load_bot_queues();
        if (USE_AGENTS)
        {
            load_bot_stats();
        }
        else
        {
            $('#stats_table_body').empty().append('' +
                '<tr>' +
                '   <td colspan="4" style="text-align:center;">' +
                '       <br><p> The Bot statistics are only available when the <b>IntelMQ Manager</b> is configured to use botnet agents.<br><br>To enable it, please define the "<b>USE_BOTNET_AGENTS</b>" as "<b>true</b>" in the main config.</p>' +
                '   </td>' +
                '</tr>'
            );
        }

    }, RELOAD_QUEUES_EVERY * 1000);

    if(bot_id != ALL_BOTS) {
        $("#logs-panel").css('display', 'block');
        $("#source-queue-table-div").css('display', 'block');
        $("#internal-queue-table-div").css('display', 'block');
        $("#destination-queues-table-div").removeClass('col-md-12');
        $("#destination-queues-table-div").addClass('col-md-4');
        $("#destination-queue-header").html("Destination Queue");

        load_bot_log();
        reload_logs = setInterval(function () {
            load_bot_log();
        }, RELOAD_LOGS_EVERY * 1000);
    } else {
        $("#logs-panel").css('display', 'none');
        $("#source-queue-table-div").css('display', 'none');
        $("#internal-queue-table-div").css('display', 'none');
        $("#destination-queues-table-div").removeClass('col-md-4');
        $("#destination-queues-table-div").addClass('col-md-12');
        $("#destination-queue-header").html("Queue");
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
                    },
                    function(error){
                        show_error(error);
                    }
                );
            }
            else
            {
                $('#agent_selector_div').hide();
            }

            select_bot(ALL_BOTS);

            get_botnet_status(get_selected_agent(), update_bot_list, show_error);


        },
        show_error
    );

});
