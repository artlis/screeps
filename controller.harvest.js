//Source.prototype.slots = null;

var controllerHarvest = {
    
    setSourceSlot: function(source) {
        
        var area = source.room.lookForAtArea(LOOK_TERRAIN, source.pos.y-1, source.pos.x-1,source.pos.y+1,source.pos.x+1, true);
        var slots = 0;
        for (z = 0; z < area.length; ++z) {
            if (area[z]["terrain"] == "plain" || area[z]["terrain"] == "swamp") {
                slots +=1;
            }
        }
        source.room.memory.sourceSlots[source.id] = slots;
    },
    
    giveSourceSlot: function(creep) {
        if (!creep.memory.sourceID) {
            var creepsWithSource = _.filter(Game.creeps, (creep) => creep.memory.sourceID);
            var sources = creep.room.find(FIND_SOURCES);
            var slotsTaken = new Array(sources.length);
            for (i = 0; i < sources.length; ++i) {
                slotsTaken[i] = 0;
                for (z = 0; z < creepsWithSource.length; ++ z) {
                    
                    if (creepsWithSource[z].memory.sourceID == sources[i].id) {
                        slotsTaken[i] +=1;
                    }
                    
                }
                if (slotsTaken[i] < creep.room.memory.sourceSlots[i]) {
                        creep.memory.sourceID = sources[i].id;
                        return;
                }
            }
            
            do {
                for (i = 0; i < slotsTaken.length; ++i) {
                    slotsTaken[i] -= creep.room.memory.sourceSlots[i];
                    if (slotsTaken[i] <= 0) {
                        creep.memory.sourceID = sources[i].id;
                        return;
                    }
                }
            } while (slotsTaken[0] >0);
        }
        
        
    }
    
}

module.exports = controllerHarvest;
