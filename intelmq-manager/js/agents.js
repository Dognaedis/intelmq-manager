
// Page Functions

function populate_agents_table(agents)
{
    $(agents).each(function(index, agent){
        row = $('<tr data-agent-id="'+agent.id+'">');
        row.append('<td nowrap>             <a href="#" class="agent_list_icon" data-agent-id="'+agent.id+'">'+(agent.id==get_selected_agent()?'<span class="fa fa-check"></span>':'')+'</a></td>');
        row.append('<td style="width:99%;"> <a href="#" class="agent_list_name" data-agent-id="'+agent.id+'">'+agent.name+'</a></td>');
        row.append('<td nowrap>             <a href="#" class="agent_list_host" data-agent-id="'+agent.id+'">'+agent.host+'</a></td>');
        row.append('<td nowrap>             <a href="#" class="agent_list_port" data-agent-id="'+agent.id+'">'+agent.port+'</a></td>');
        row.append('<td nowrap style="font-style:normal;">\
            <button class="btn btn-xs btn-default agent_list_remove"    data-agent-id="'+agent.id+'" title="Remove Agent"><i class="fa fa-times"></i>&nbsp;&nbsp;Remove</button>\
            </td>');
        $(row).insertBefore('#agents_table tr:last');
    });

    $('#agents_table .agent_list_icon').click(function(e){
        set_selected_agent($(this).data('agent-id'));
        location.reload();
        e.preventDefault();
        return false;
    });

    $('#agents_table .agent_list_name').click(function(e){
        set_selected_agent($(this).data('agent-id'));
        location.reload();
        e.preventDefault();
        return false;
    });

    $('#agents_table .agent_list_host').click(function(e){
        set_selected_agent($(this).data('agent-id'));
        location.reload();
        e.preventDefault();
        return false;
    });

    $('#agents_table .agent_list_port').click(function(e){
        set_selected_agent($(this).data('agent-id'));
        location.reload();
        e.preventDefault();
        return false;
    });

    $('#agents_table .agent_list_remove').click(function(e){
        remove_agent(
            $(this).data('agent-id'),
            function(){
                location.reload()
            },
            show_error
        );
        e.preventDefault();
        return false;
    });
}

// Things to do on document ready

$(document).ready(function() {

    get_main_configs(
        function()
        {
            // Everything should be done only after the main configs are successfully retrieved

            if (USE_AGENTS) {
                // update agent list
                $('#agents-panel-title').addClass('waiting');

                get_agents(
                    function (data) {
                        populate_agents_table(data);
                        $('#agents-panel-title').removeClass('waiting');

                    },
                    function (error) {
                        show_error(error);
                        $('#agents-panel-title').removeClass('waiting');
                    }
                );

                $('#add_agent_button').click(function (e) {
                    add_agent(
                        $('#new_agent_name').val(),
                        $('#new_agent_host').val(),
                        $('#new_agent_port').val(),
                        function () {
                            location.reload()
                        },
                        show_error
                    );
                    e.preventDefault();
                    return false;
                });
            }
            else
            {
                $('#agents_table').empty().append('' +
                    '<tr>' +
                    '   <td colspan="4" style="text-align:center;">' +
                    '       <br><p> The <b>IntelMQ Manager</b> is not configured to use botnet agents.<br><br>To enable it, please define the "<b>USE_BOTNET_AGENTS</b>" as "<b>true</b>" in the main config.</p>' +
                    '   </td>' +
                    '</tr>'
                );
            }

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

        },
        show_error
    );

});