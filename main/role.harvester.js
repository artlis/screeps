var controllerHarvest = require("controller.harvest");

var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep) {
	    if(creep.carry.energy < creep.carryCapacity) {
	        controllerHarvest.giveSourceSlot(creep);
            if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
                creep.moveTo(Game.getObjectById(creep.memory.sourceID), {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            creep.memory.sourceID = null;
            var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity && structure.energy < 900;
                    }
            });
            targets.sort(function(a,b) {
                return a.energy - b.energy;
            });
            if (targets.length <= 0) {
                targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_CONTAINER) && 
                        _.sum(structure.store) < structure.storeCapacity;
                    }
                });
            }
            
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                creep.moveTo(Game.flags['Flag1']);
                creep.say('Idle');
            }
        }
	}
};

module.exports = roleHarvester;
