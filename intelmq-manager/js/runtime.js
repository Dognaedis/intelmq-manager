function generate_runtime_conf(nodes) {
    var save_keys = {};

    for (id in nodes) {
        save_keys[id] = {};
        save_keys[id]['parameters'] = {};

        for (index in nodes[id]) {
            if (STARTUP_KEYS.indexOf(index) == -1) {
                save_keys[id]['parameters'][index] = nodes[id][index];
            } else {
                save_keys[id][index] = nodes[id][index];
            }
        }
        delete save_keys[id]['parameters']['id']
    }

    return JSON.stringify(save_keys, undefined, 4);
}

function read_runtime_conf(config_contents) {

    var nodes = {};
    for (id in config_contents) {

        var bot = config_contents[id];
        nodes[id] = bot['parameters'];

        nodes[id]['id'] = id;
        nodes[id]['group'] = bot['group'];
        nodes[id]['name'] = bot['name'];
        nodes[id]['module'] = bot['module'];
        nodes[id]['description'] = bot['description'];
    }

    return nodes;
}
