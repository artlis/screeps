//var controllerHarvest = require("controller.harvest");


var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.upgrading && creep.carry.energy == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.sourceID = null;
	        creep.memory.upgrading = true;
	        creep.say('⚡ upgrade');
	    }

	    if(creep.memory.upgrading) {
	        creep.upgradeController(creep.room.controller);
            if(!creep.pos.inRangeTo (creep.room.controller.pos, 2)) {
                
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_CONTAINER || i.structureType == STRUCTURE_STORAGE) && 
                               i.store[RESOURCE_ENERGY] > 50
                });
                if (target) {
                    if(creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(target, {visualizePathStyle: {stroke: '#ffaa00'}});
                    }
                    
                }
                else {
                    var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES);//room.find(FIND_DROPPED_RESOURCES);
                    if(target) {
                        creep.moveTo(target);
                        creep.pickup(target);
                    }
                }
                //else {
    	        //controllerHarvest.giveSourceSlot(creep);
                //if(creep.harvest(Game.getObjectById(creep.memory.sourceID)) == ERR_NOT_IN_RANGE) {
                //    creep.moveTo(Game.getObjectById(creep.memory.sourceID), {visualizePathStyle: {stroke: '#ffaa00'}});
                //}
            //}
        }
	}
};

module.exports = roleUpgrader;
