function generate_pipeline_conf(edges) {
    var new_edges = {};
    var edge;
    
    for (index in edges) {
        edge = edges[index];
        
        if (!new_edges[edge.from]) {
            new_edges[edge.from] = {
                'source-queue': [],
                'destination-queues': []
            }
        }
        
        if (!new_edges[edge.to]) {
            new_edges[edge.to] = {
                'source-queue': [],
                'destination-queues': []
            }
        }
        
        new_edges[edge.from]['destination-queues'].push(edge.to + '-queue');
        new_edges[edge.to]['source-queue'].push(edge.from + '-queue');
    }
    
    for (id in new_edges) {
        edge = new_edges[id];
        
        if (edge['source-queue'].length > 0) {
            edge['source-queue'] = id + '-queue';
        } else {
            edge['source-queue'] = undefined;
        }
        
        if (edge['destination-queues'].length == 0) {
            edge['destination-queues'] = undefined;
        }
    }
    
    conf_string = JSON.stringify(new_edges, undefined, 4);
    
    return conf_string;
}

function read_pipeline_conf(config, nodes) {
    var edges = {};
    var i = 0;
    
    for (from in config) {
        if (config[from]['destination-queues'] != undefined) {
            for (index in config[from]['destination-queues']) {
                var to_node = config[from]['destination-queues'][index].replace(/-queue$/, "");
                if(nodes[from] != undefined && nodes[to_node] != undefined) {
                    var edge_id = 'edge' + i++;

                    edges[edge_id]= {
                        'id': edge_id,
                        'from': from,
                        'to': to_node
                    };
                }
            }
        }
    }
    
    return edges;
}