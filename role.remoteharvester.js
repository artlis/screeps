var roleRemHarvester = {
    run: function(creep, remHarvesters) {
        creepFlag = Game.flags[creep.memory.flag];
        creepSpawn = Game.spawns[creepFlag.memory.spawn];
        
        if(creep.carry.energy < creep.carryCapacity) {
            var target = Game.getObjectById(creepFlag.memory.sourceID);
            var result = creep.harvest(target);
            if (result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            if (target == null || result == ERR_NOT_ENOUGH_RESOURCES) {
                creep.moveTo(creepFlag);
            }
        }
        else {
            if(creep.ticksToLive < 500) {
                 creep.moveTo(creepSpawn);
                creepSpawn.recycleCreep(creep);
                creep.say('Recycling');
            }
            else {
                if (creep.room == creepSpawn.room){
                    var target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType == STRUCTURE_SPAWN ||
                                    structure.structureType == STRUCTURE_LINK)
                        }
                    });
                    
                    
                    if (target) {
                        var result = creep.transfer(target, RESOURCE_ENERGY);
                        if (result == ERR_NOT_IN_RANGE) {
                            creep.moveTo(target);
                            
                        }
                        else if (result == ERR_FULL) {
                            creep.drop(RESOURCE_ENERGY);
                        }
                    }
                }
                else {
                    
                    creep.moveTo(creepSpawn);
                }
            }
        }
            
    
    }
    
    
}

module.exports = roleRemHarvester;
