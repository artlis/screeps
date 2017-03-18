

var roleMiner = {
    
    run: function(creep) {
        //var sources = creep.room.find(FIND_SOURCES);
        //sourceid should be set on spawn.
        //var source = Game.getObjectById(creep.spawnID);
            if (!creep.memory.minerContainerID) {
                var source = Game.getObjectById(creep.memory.sourceID);
                if (source){
                    var area = source.room.lookForAtArea(LOOK_STRUCTURES, source.pos.y-1, source.pos.x-1,source.pos.y+1,source.pos.x+1, true);
                    for (z = 0; z < area.length; ++z) {
                        if (area[z]["structure"]["structureType"] == "container") {
                            creep.memory.minerContainerID = area[z]["structure"]["id"];
                        }
                    }
                }
                
                
                creep.moveTo(Game.getObjectById(creep.memory.sourceID));
            }
            
            if (creep.memory.minerContainerID) {
                creep.moveTo(Game.getObjectById(creep.memory.minerContainerID));
            }
            creep.harvest(Game.getObjectById(creep.memory.sourceID));
            
        
    }
};

module.exports = roleMiner;
