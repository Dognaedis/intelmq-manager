var defaults = {};
var nodes = {};
var edges = {};
var bots = {};

var graph = null;
var graph_container = null;
var popup = null;
var span = null;
var table = null;

var agents = {};
//{chart: null, pipeline:null, runtime:null, stats:null, logs:null};

var tiles={
    "1":{   classes: "chart_place col-md-12",
            num_rows: 1},
    "2":{   classes: "chart_place col-md-6",
            num_rows: 2},
    "3":{   classes: "chart_place col-md-4",
            num_rows: 3}
};

var selected_tile="1";

function resize() {
    // Resize body
    var graph_container = document.getElementById('graph-container');
    graph_container.style.height = (window.innerHeight - graph_container.offsetTop) + "px";
    graph_container.style.overflowX = "auto";
    graph_container.style.overflowY = "auto";
    
    if (graph != null && graph != undefined) {
        graph.redraw();
        graph.fit();
    }
    load_html_elements();
}

function load_html_elements() {
    // Load popup, span and table
    graph_container = document.getElementById('graph-container');
    popup = document.getElementById("graph-popUp");
    span = document.getElementById('graph-popUp-title');
    table = document.getElementById("graph-popUp-fields");
}


function convert_edges(agent, edges)
{
    var new_edges = [];
    
    for (index in edges) {
        var new_edge = {};
        new_edge.id = edges[index]['id'];
        new_edge.from = edges[index]['from'];
        new_edge.to = edges[index]['to'];

        new_edge.arrows = {to:{scaleFactor:1}};

        if (agents[agent].status[new_edge.to] == "running")
        {
            // 'To' bot is running
            new_edge.color = '#888888';

            new_edge.font = {size:18, align: 'top', color:'#555555'};

            new_edge.width = 1;
            new_edge.title = "";

            if (USE_AGENTS)
            {
                $.each(agents[agent].stats, function (n, bot) {

                    if ((bot.name == new_edge.from) && (bot.stats.avg_produced_per_time != undefined)) {
                        var stat_avg = bot.stats.avg_produced_per_time;
                        new_edge.width = (((stat_avg <= STATISTICS_PER_TIME_MAX ? stat_avg : STATISTICS_PER_TIME_MAX) / STATISTICS_PER_TIME_MAX) * MONITOR_SCALE_MAX_LINE_WIDTH) + 1;
                        new_edge.title += "<b>Avg. of produced (last time unit): </b> " + stat_avg + " / ";
                    }
                });
            }
        }
        else
        {
            // 'To' bot is not running
            new_edge.color = '#AA0000';

            new_edge.font = {size:18, align: 'top', color:'#555555'};
            new_edge.width = 5;
            new_edge.title = "";
        }

        var queue_count = agents[agent].queues[new_edge.from].destination[new_edge.to+'-queue'];
        if (queue_count != undefined) {
            var dash_spacing = ((queue_count <= QUEUE_SCALE_MAX ? queue_count : QUEUE_SCALE_MAX) / QUEUE_SCALE_MAX) * MONITOR_SCALE_MAX_LINE_SPACING;
        }
        else
        {
            var dash_spacing = 0;
        }

        if (queue_count > 0)
        {
            new_edge.dashes = [3, dash_spacing + new_edge.width - 1];
        }

        new_edge.label = queue_count;
        new_edge.title += "<b>Queue:</b> " + queue_count;

        new_edges.push(new_edge);
    }
    return new_edges;
}

function convert_nodes(agent, nodes)
{
    var new_nodes = [];

    for (index in nodes) {
        var new_node = {};
        new_node.id = nodes[index]['id'];
        new_node.label = nodes[index]['id'];
        new_node.details = JSON.stringify(nodes[index], undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
        new_node.status = agents[agent].status[new_node.id];

        if(agents[agent].queues[new_node.id] != undefined)
        {
            new_node.queues = JSON.stringify(agents[agent].queues[new_node.id], undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
        }

        if (new_node.status == "running")
        {
            new_node.group = nodes[index]['group'];
        }
        else
        {
            new_node.group = nodes[index]['group']+'_Disabled';
        }

        if (USE_AGENTS)
        {
            $.each(agents[agent].stats, function (index, element){
                if (element.name == new_node.id)
                {
                    new_node.stats = JSON.stringify(element.stats, undefined, 2).replace(/\n/g, '\n<br>').replace(/ /g, "&nbsp;");
                }
            });
        }

        new_nodes.push(new_node);
    }
    return new_nodes;
}

function create_chart(agent, nodes, edges) {

    var options = {
        layout:{
            randomSeed:0,
            improvedLayout:true,
            hierarchical:{
                sortMethod:"hubsize",
                direction:"DU",
                //sortMethod:"directed",
                //direction:"UD",
                parentCentralization: false,
                nodeSpacing:350
            },
        },
        nodes: {
            labelHighlightBold: false,
            font: {
                face: 'arial',
                size: 18,
            },
            shadow:{
                color: 'rgba(0,0,0,1)',
                size:4,
                x: 0,
                y: 1
            },
            borderWidth:2
        },
        edges: {
            smooth: {
            "type": "discrete",
            "forceDirection": "none",
            "roundness": 0.3},
            length: 300,
            shadow:false,
            arrowStrikethrough: false,

        },
        groups: {
            Collector: {
                shape: 'box',
                color:{
                    background:'#FF4444',
                    border:'#FF4444',
                    highlight:{
                        background:'#EE3333',
                        border:'#333333',
                    },
                    hover:{
                        background:'#DD2222',
                        border:'#DD2222'
                    }
                },
                font:{
                    color:'#000000'
                }
            },
            Parser: {
                shape: 'box',
                color:{
                    background:'#44EE44',
                    border:'#44EE44',
                    highlight:{
                        background:'#33DD33',
                        border:'#333333',
                    },
                    hover:{
                        background:'#22CC22',
                        border:'#22CC22'
                    }
                },
                font:{
                    color:'#000000'
                }
            },
            Expert: {
                shape: 'box',
                color:{
                    background:'#44AAFF',
                    border:'#44AAFF',
                    highlight:{
                        background:'#3399EE',
                        border:'#333333'
                    },
                    hover:{
                        background:'#2288DD',
                        border:'#2288DD'
                    }
                },
                font:{
                    color:'#000000'
                }
            },
            Output: {
                shape: 'box',
                color:{
                    background:'#EEEE44',
                    border:'#EEEE44',
                    highlight:{
                        background:'#DDDD44',
                        border:'#333333'
                    },
                    hover:{
                        background:'#CCCC22',
                        border:'#CCCC22'
                    }
                },
                font:{
                    color:'#000000'
                }
            },
            Collector_Disabled: {
                shape: 'box',
                color:{
                    background:'#FFFFFF',
                    border:'#FF4444',
                    highlight:{
                        background:'#FFFFFF',
                        border:'#333333'
                    },
                    hover:{
                        background:'#CCCCCC',
                        border:'#CC2222'
                    }
                },
                font:{
                    color:'#FF4444'
                }
            },
            Parser_Disabled: {
                shape: 'box',
                color:{
                    background:'#FFFFFF',
                    border:'#44EE44',
                    highlight:{
                        background:'#FFFFFF',
                        border:'#333333'
                    },
                    hover:{
                        background:'#CCCCCC',
                        border:'#22CC22'
                    }
                },
                font:{
                    color:'#44EE44'
                }
            },
            Expert_Disabled: {
                shape: 'box',
                color:{
                    background:'#FFFFFF',
                    border:'#44AAFF',
                    highlight:{
                        background:'#FFFFFF',
                        border:'#333333'
                    },
                    hover:{
                        background:'#CCCCCC',
                        border:'#2222CC'
                    }
                },
                font:{
                    color:'#44AAFF'
                }
            },
            Output_Disabled: {
                shape: 'box',
                color:{
                    background:'#FFFFFF',
                    border:'#EEEE44',
                    highlight:{
                        background:'#FFFFFF',
                        border:'#333333'
                    },
                    hover:{
                        background:'#CCCCCC',
                        border:'#CCCC22'
                    }
                },
                font:{
                    color:'#EEEE44'
                }
            }
        }
    };

    var place = $('#chart_'+agent)[0];

    agents[agent].chart = {data:{nodes:null, edges:null}, network:null};
    agents[agent].chart.data.nodes = new vis.DataSet(nodes);
    agents[agent].chart.data.edges = new vis.DataSet(edges);

    agents[agent].chart.network = new vis.Network(place, agents[agent].chart.data, options);
    //agents[agent].chart.network.fit();

    agents[agent].chart.network.on("click", function (params) {

        if (params.nodes[0]!=undefined)
        {
            // a node has been clicked
            msg_body='<b>Status: </b>'+this.body.nodes[params.nodes[0]].options.status;
            msg_body+='<br><b>Queues: </b><br>'+this.body.nodes[params.nodes[0]].options.queues;
            msg_body+='<br><b>Stats: </b><br>'+this.body.nodes[params.nodes[0]].options.stats;
            msg_body+='<br><b>Details: </b><br>'+this.body.nodes[params.nodes[0]].options.details;

            show_simple_modal('Bot Details', msg_body);
        }
        else
        {
            // an edge has been clicked
        }

    });
}

function refresh_charts()
{

    $.each(agents, function(agent_id, agent) {
        var chart_nodes;
        var chart_edges;


        if (agents[agent_id].visible) {

            load_file(agent_id, 'defaults',
                function (data)
                {
                    agents[agent_id].defaults = read_defaults_conf(data);

                    load_file(agent_id, 'runtime',
                        function (data)
                        {
                            agents[agent_id].runtime = data;
                            chart_nodes = read_runtime_conf(agents[agent_id].runtime);

                            load_file(agent_id, 'pipeline',
                                function (data)
                                {
                                    agents[agent_id].pipeline = data;

                                    chart_edges = read_pipeline_conf(agents[agent_id].pipeline, chart_nodes);
                                    chart_nodes = add_defaults_to_nodes(chart_nodes, agents[agent_id].defaults);

                                    get_botnet_queues(agent_id,
                                        function (data)
                                        {

                                            agents[agent_id].queues={};

                                            $.each(data, function(bot_id, queues) {

                                                agents[agent_id].queues[bot_id]={};

                                                if (queues['internal_queue']!=undefined)
                                                {
                                                    agents[agent_id].queues[bot_id]['internal'] = queues['internal_queue'];
                                                }
                                                else
                                                {
                                                    agents[agent_id].queues[bot_id]['internal'] = 0;
                                                }

                                                if (queues['destination_queues']!=undefined)
                                                {
                                                    agents[agent_id].queues[bot_id]['destination']={};

                                                    $.each(queues['destination_queues'] , function( i, queue )
                                                    {
                                                        agents[agent_id].queues[bot_id]['destination'][queue[0]]=queue[1];
                                                    });
                                                }
                                                else
                                                {
                                                    agents[agent_id].queues[bot_id]['destination'] = {};
                                                }

                                                if (queues['source_queue']!=undefined)
                                                {
                                                    agents[agent_id].queues[bot_id]['source']={};

                                                    agents[agent_id].queues[bot_id]['source'][queues['source_queue'][0]] = queues['source_queue'][1];

                                                }
                                                else
                                                {
                                                    agents[agent_id].queues[bot_id]['source'] = {};
                                                }

                                            });

                                            get_botnet_status(agent_id,
                                                function (data)
                                                {
                                                    agents[agent_id].status = data;
                                                    if (USE_AGENTS)
                                                    {
                                                        get_botnet_stats(agent_id,
                                                            function (data) {
                                                                agents[agent_id].stats = data;

                                                                update_chart(agent_id, chart_nodes, chart_edges);
                                                            },
                                                            show_error
                                                        );
                                                    }
                                                    else
                                                    {
                                                        update_chart(agent_id, chart_nodes, chart_edges);
                                                    }
                                                },
                                                show_error
                                            );
                                        },
                                        show_error
                                    );
                                },
                                show_error
                            );
                        },
                        show_error
                    );
                },
                show_error
            );
        }
        else
        {

        }
    });

}


function update_chart(agent, nodes, edges)
{
    if (agents[agent].chart == undefined)
    {

        // create the chart
        create_chart(agent, convert_nodes(agent, nodes), convert_edges(agent, edges));
        agents[agent].chart.network.redraw();
        agents[agent].chart.network.fit();
    }
    else
    {

        agents[agent].chart.data.nodes.update(convert_nodes(agent, nodes));
        agents[agent].chart.data.edges.update(convert_edges(agent, edges));
        agents[agent].chart.network.redraw();
    }

}

function set_tile(tile_type)
{
    selected_tile=tile_type;

    $('.chart_place').each(
        function (i, element){
            $(element).removeClass().addClass(tiles[tile_type].classes);
            $(element).height(($(window).height()-$('#header_nav').height()-(10*tiles[selected_tile].num_rows))/tiles[selected_tile].num_rows + 'px');
        }
    );
}

function create_chart_place(agent)
{
    $('#charts').append('' +
        '<div class="'+ tiles[selected_tile].classes +'" style="padding:5px; height:'+ ($(window).height()-$('#header_nav').height()-(10*tiles[selected_tile].num_rows))/tiles[selected_tile].num_rows +'px;" id="chart_div_'+agent+'">' +
        '   <div class="panel panel-default" style="height:100%;">' +
        '       <div id="chart_panel_title_'+agent+'" class="panel-heading" style="padding-bottom:5px; padding-top: 5px; padding-left:10px;">' +
        '           <b>' + agents[agent].name + '</b>'+
        '       </div> ' +
        '       <div id="chart_panel_body_'+agent+'" class="panel-body" style="height:100%; padding:0px; padding-bottom:30px;">' +
        '           <div id="chart_'+agent+'" style="height:100%;">' +
        '           </div> ' +
        '       </div> ' +
        '   </div>' +
        '</div>'
    );
    agents[agent].div_place=$('#charts #chart_div_' + agent);
    agents[agent].chart_place=$('#charts #chart_' + agent);

}



function update_agent_multi_selector(agent_list)
{
    $(agent_list).each(function(index, agent)
    {
        agents[agent.id] = {visible: true, div_place:null, chart_place: null, name: agent.name, chart: null, defaults: null, pipeline:null, runtime:null, stats:null, logs:null};

        create_chart_place(agent.id);

        if(agent.id==get_selected_agent())
        {
            $('#agent_multi_selector').append('' +
                '<label class="btn btn-sm btn-default active" data-agent_id="'+agent.id+'">' +
                '   <input class="agent_checkbox" type="checkbox" checked autocomplete="off" >' +
                '   <span class="agent_name">'+agent.name+'</span>' +
                '</label>'
            );

        }
        else
        {
            $('#agent_multi_selector').append('' +
                '<label class="btn btn-sm btn-default" data-agent_id="'+agent.id+'">' +
                '   <input class="agent_checkbox" type="checkbox" autocomplete="off" >' +
                '   <span class="agent_name">'+agent.name+'</span>' +
                '</label>'
            );
        }

    });

    update_charts_display();
    refresh_charts();

    $(".agent_checkbox").change(function(){
        if ($(this).is(':checked'))
        {
            agents[$(this).parent().data('agent_id')].visible=true;
            agents[$(this).parent().data('agent_id')].div_place.show();

        }
        else
        {
            agents[$(this).parent().data('agent_id')].visible=false;
            agents[$(this).parent().data('agent_id')].div_place.hide();
        }
    });
}

function update_charts_display()
{
    $('#agent_multi_selector label').each(
        function(index, element)
        {
            var agent = $(element).data('agent_id');

            if ($(element).hasClass("active")) {
                agents[agent].visible=true;
                $(agents[agent].div_place).show();
            }
            else
            {
                agents[agent].visible=false;
                $(agents[agent].div_place).hide();
            }
        }
    );
}

/* Things to do on document ready */

$(document).ready(function() {

    get_main_configs(
        function()
        {
            // Everything should be done only after the main configs are successfully retrieved

            // Dynamically load available bots
            // load_file('bots', load_bots);

            $("#check_all_agents").click(function(){
                $('#agent_multi_selector label').addClass('active');
                update_charts_display();
            });

            $("#uncheck_all_agents").click(function(){
                $('#agent_multi_selector label').removeClass('active');
                update_charts_display();
            });

            $("#refresh_charts").click(
                function()
                {
                    update_charts_display();
                    refresh_charts();
                }
            );

            // update agent list dropdown if (USE_AGENTS)
            if (USE_AGENTS)
            {
                get_agents(
                    function(data) {
                        update_agent_multi_selector(data);
                    },
                    function(error){
                        show_error(error);
                    }
                );
            }
            else
            {
                //$('#agent_selector_div').hide();
                //$('#agent_multi_selector_div').hide();
                update_agent_multi_selector([{id:0, name:'( Local IntelMQ Instance )'}]);
            }


            // update agent list dropdown
            setInterval(function(){
                refresh_charts();
            },60000);

            // Dynamically adapt to fit screen
            window.onresize = resize;

        },
        show_error
    );

});


