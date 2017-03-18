//var controllerHarvest = require("controller.harvest");


var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep, buildingSites, repairSites) {

	    if(creep.memory.building && creep.carry.energy == 0) {
            creep.memory.building = false;
            creep.memory.buildID = null;
            //creep.room.memory.requestBuildingSite = false;
            creep.say('🔄 harvest');
	    }
	    if(!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
	        creep.memory.building = true;
	        creep.memory.sourceID = null;
	        //creep.room.memory.requestBuildingSite == true;
	        creep.say('🚧 build');
	    }
	    
	    

	    if(creep.memory.building) {
	        
	        //current worriessssssssssss if a tower turns on repair request will builder pick repair over build?
	        if (!creep.memory.buildID) { //if im building with nothing to build
                creep.room.memory.requestBuildingSite = true; //ask for the list every tick
                if(buildingSites.length) {
                    creep.memory.buildID = buildingSites[0].id; 
                    creep.room.memory.requestBuildingSite = false; //this should only run once
                    creep.room.memory.requestRepairSite = false;
                    //console.log("Found something to build!");
                }
                else {
                    creep.room.memory.requestRepairSite = true; // if im requesting a building site but not getting one, then request a repair;
    	            if(repairSites.length) {
                        creep.memory.buildID = repairSites[Math.floor(Math.random()*Math.sqrt(repairSites.length-1))].id; //just some sillinesss to give builders a unique repai project but not too far back in the array 
                        creep.room.memory.requestBuildingSite = false;
                        creep.room.memory.requestRepairSite = false; //this should only run once
                        //console.log("Found something to repair!");
                    }
                }
    	        
    	    }
	        
	        var target = Game.getObjectById(creep.memory.buildID);
	        
            if(target) {
                //console.log("attempting build/repair!");
                var buildResult = creep.build(target); 
                var repairResult = creep.repair(target);
                creep.memory.blah = buildResult;
                creep.memory.blahblah  = repairResult;
                if( buildResult == ERR_NOT_IN_RANGE || repairResult == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    
                    //console.log('Build Result: ' + buildResult);
                }
                else if(buildResult == ERR_INVALID_TARGET && repairResult == ERR_INVALID_TARGET) {
                    creep.memory.buildID = null;
                }
                if(target.hits == target.hitsMax){ //
                    creep.memory.buildID = null;
                }
            }
            else {
                creep.memory.buildID = null;
            }
            
            //console.log('Buyild Result: ' + buildResult);
	    }
	    else if(creep.carry.energy < creep.carryCapacity) {
	        
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
	    }
	     
	}
};

module.exports = roleBuilder;
