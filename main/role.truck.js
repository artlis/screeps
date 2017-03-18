var roleTruck = {
    run: function (creep) {
        // this is for finding sources
        if (creep.carry.energy == 0 && creep.memory.working) {
            creep.memory.working = false;
        }
        else if (creep.carry.energy >= creep.carryCapacity/2) {
            creep.memory.working = true;
        }
        
        if(!creep.memory.working) {
            
            var target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: (i) => {
                    var temp = i.pos.lookFor(LOOK_STRUCTURES);
                    if (temp.length) {
                        return temp[0].structureType != STRUCTURE_CONTAINER;
                    }
                    return true;
                }
            });//room.find(FIND_DROPPED_RESOURCES);
            if(target) {
                creep.moveTo(target);
                creep.pickup(target);
            }
            else {
            
                var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => (i.structureType == STRUCTURE_CONTAINER || i.structureType == STRUCTURE_STORAGE || (i.structureType == STRUCTURE_LINK && i.cooldown <= 0))
                });
                targets.sort(function(a,b) {
                    var avalue = 0;
                    var bvalue = 0; 
                    if (a.structureType == STRUCTURE_LINK) {
                        avalue = a.energy;
                    }
                    else {
                         avalue = _.sum(a.store);
                    }
                    if (b.structureType == STRUCTURE_LINK) {
                        bvalue = b.energy;
                    }
                    else {
                         bvalue = _.sum(b.store);
                    }
                    if (a.structureType == STRUCTURE_STORAGE) {avalue = Math.sqrt(a.store[RESOURCE_ENERGY])};
                    if (b.structureType == STRUCTURE_STORAGE) {bvalue = Math.sqrt(b.store[RESOURCE_ENERGY])};
                    
                    return bvalue - avalue;
                });
                if(targets.length > 0) {
                    //_.forIn(targets[0].store, function(value, key) {
                     //   console.log (key);
                    //    if (value > 0) {
                            
                            if(creep.withdraw(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                            }
                       // }
                    //});
                }
                
            }
        }
        else if (creep.memory.working){
            
            // this is for destinations
            var target = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION ||
                                structure.structureType == STRUCTURE_SPAWN ||
                                (structure.structureType == STRUCTURE_TOWER && (creep.room.energyAvailable == creep.room.energyCapacityAvailable || structure.energy <= 700))) &&
                                structure.energy < structure.energyCapacity;
                    }
            });
            //targets.sort(function(a,b) {
            //    return a.energy - b.energy;
            //});
            
            if(target) {
                if(creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
            else {
                /*var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (i) => i.structureType == STRUCTURE_CONTAINER
                });
            
                targets.sort(function(a,b) {
                    return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY];
                });*/
                if(creep.transfer(creep.room.storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(creep.room.storage, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                //creep.moveTo(Game.flags['Flag1']);
                //creep.say('Idle');
            }
        }
        
    }
}

module.exports = roleTruck;
