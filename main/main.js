var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');
var roleMiner = require('role.miner');
var roleTruck = require('role.truck');
var roleMilitia = require('role.militia');
var controllerHarvest = require('controller.harvest');
var roleRemHarvester = require('role.remoteharvester');


module.exports.loop = function () {
    
    //--------------------------------------------------------------------------
    //GENERAL VARIABLES
    //--------------------------------------------------------------------------
    //eventually will modify to iterate per room i own probably.
    var thisRoom = Game.rooms['W41N11'];
    var sources = thisRoom.find(FIND_SOURCES);
    
    var totalStorage = thisRoom.energyAvailable;
    var totalStorageCapacity = thisRoom.energyCapacityAvailable;
    
    var containers = thisRoom.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_CONTAINER);
        }
    });
    for(i = 0; i < containers.length; ++i) {
        totalStorage += containers[i].store[RESOURCE_ENERGY];
        totalStorageCapacity += containers[i].storeCapacity;
    }
    
    var extractor = thisRoom.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType = STRUCTURE_EXTRACTOR;
        }
    })[0];
    
    var enemies = thisRoom.find(FIND_HOSTILE_CREEPS);
    
    //var tower = Game.getObjectById('58b86c9ed591385950928f12');
    var towers = thisRoom.find(FIND_MY_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType == STRUCTURE_TOWER;
        }
    });
    
    var buildingSites = [];
    if (thisRoom.memory.requestBuildingSite) {
        buildingSites = thisRoom.find(FIND_CONSTRUCTION_SITES);
    }
    
    var repairSites = [];
    if (thisRoom.memory.requestRepairSite) {
        repairSites = thisRoom.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits  < structure.hitsMax * 0.97
        });
        if (repairSites.length){
            repairSites.sort((a,b) => a.hits - (b.hits));
        }
    }
    //console.log(JSON.stringify(repairSites));
    var flagHarvest = _.filter(Game.flags, (flag) => flag.memory.role == 'harvest');
    
    _.each(flagHarvest, function(flag) {
       if (!flag.memory.sourceID) {
           if (Game.rooms[flag.pos.roomName]) {
               flagSource = flag.pos.lookFor(LOOK_SOURCES)[0];
               if(flagSource) {
                   flag.memory.sourceID = flagSource.id;
               }
           }
           
        }
    });
    
    //tower--------------------------------------------------------
    _.each(towers, function(tower) {
        if (enemies.length) {
            var closestHostile = tower.pos.findClosestByRange(enemies);
            tower.attack(closestHostile);
        }
        else if (tower.energy > tower.energyCapacity*4/5) {
            if(!tower.room.memory.requestBuildingSite && !tower.room.memory.towerRepairID) {
                tower.room.memory.requestRepairSite = true;
            }
            if(repairSites.length) {
               tower.room.memory.towerRepairID = repairSites[0].id; 
                tower.room.memory.requestRepairSite = false;
                //console.log("TowerRepair");
                
            }
            var target = Game.getObjectById(tower.room.memory.towerRepairID);
            if (target) {
            tower.repair(target);
            if (target.hits == target.hitsMax) {
                    tower.room.memory.towerRepairID = null;
            }
            }
            else {
                tower.room.memory.towerRepairID = null;
            }
        }
        
        
    });
    
    //links----------------------------------------------------------
    Game.getObjectById('58c0cf3e7b3ff05d19a41616').transferEnergy(Game.getObjectById('58c0d67a59bd423bae5fed36'));

    
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }
    
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    var minMiners = _.filter(Game.creeps, (creep) => creep.memory.role == 'minMiner');
    var trucks = _.filter(Game.creeps, (creep) => creep.memory.role == 'truck');
    var militia = _.filter(Game.creeps, (creep) => creep.memory.role == 'militia');
    var remHarvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'remHarvester');
    
    //--------------------------------------------------------------------------
    //AUTO SPAWNING
    //--------------------------------------------------------------------------
    var workerBody = [WORK,CARRY,MOVE];
    var minerBody = [WORK, WORK, MOVE];
    var truckBody = [CARRY, CARRY, MOVE, MOVE];
    var militiaBody = [TOUGH, TOUGH, ATTACK,MOVE, MOVE];
    var remHarvesterBody = [WORK, CARRY, MOVE, MOVE];
    if (thisRoom.energyCapacityAvailable >= 550) {
        workerBody = [WORK,WORK,WORK,CARRY,CARRY,MOVE,MOVE,MOVE];
        minerBody = [WORK, WORK, WORK, WORK, WORK, MOVE];
        truckBody = [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE];
        militiaBody = [TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE];
        remHarvesterBody = [WORK, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE];
    }
    if(thisRoom.energyCapacityAvailable >=1300) {
        remHarvesterBody = [WORK,MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
        workerBody = [WORK, WORK, MOVE,WORK, WORK, MOVE,WORK, WORK, MOVE,WORK, WORK, MOVE, CARRY, CARRY, MOVE, CARRY, CARRY, MOVE];
        truckBody = [CARRY, CARRY, MOVE,CARRY, CARRY, MOVE,CARRY, CARRY, MOVE,CARRY, CARRY, MOVE,CARRY, CARRY, MOVE,CARRY, CARRY, MOVE,CARRY, CARRY, MOVE,CARRY, CARRY, MOVE];
        
        militiaBody = [TOUGH, ATTACK, ATTACK, ATTACK, MOVE, MOVE, MOVE, MOVE, MOVE, HEAL];
        
    }
    if(thisRoom.energyCapacityAvailable >=1800) {
        remHarvesterBody = [WORK,MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
    
        workerBody = [WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE, WORK, CARRY, MOVE];
        
    }
    if (thisRoom.energyCapacityAvailable >= 2300) {
        remHarvesterBody = [WORK,MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE, WORK, MOVE, CARRY, MOVE, CARRY, MOVE, CARRY, MOVE];
    }
    
    var builderTotal = 1;
    var upgraderTotal = 2;
    var militiaTotal = 0;
    var remHarvesterTotal = 3;
    var truckTotal = 2;
    var excessRole = 'upgrader';
    var excessTotal = upgraderTotal;
    var excessLength = upgraders.length;
    if (enemies.length) {
        builderTotal = 4;
        upgraderTotal = 1;
        militiaTotal = 10;
        //excessRole = 'militia';
        //excecssTotal = militiaTotal;
        //excessLength = militia.length;
    }
    if(buildingSites.length &&  upgraders.length > upgraderTotal) {
        upgraders[0].memory.role = 'builder';
        excessRole = 'builder';
        excessTotal = builderTotal;
        excessLength = builder.length;
    }
    else if (thisRoom.memory.requestBuildingSite && builders.length > builderTotal && buildingSites.length == 0) {
        builders[0].memory.role = 'upgrader';
    }
    
    //if i have no harvesters, go for cheap
    if (harvesters.length === 0 && miners.length == 0) {
        var newName = Game.spawns['Spawn1'].createCreep([WORK,CARRY,MOVE], 'EmergencyHarvester'+ Math.floor(Math.random() * 100), {role: 'harvester'});
        if (newName != -6) {console.log('Spawning emergency harvester: ' + newName);}
    }
    //if im out of harvesters and I have no miners
    if (harvesters.length <= 0  && miners.length == 0) {
        console.log("Converted " +upgraders[0].name + " to Harvester");
        upgraders[0].memory.role = 'harvester';
        
    }
    //spawn a truck
    if ( trucks.length < truckTotal -1 && Game.spawns['Spawn1'].canCreateCreep([CARRY, CARRY, MOVE]) == OK) {
        var newName = Game.spawns['Spawn1'].createCreep([CARRY, CARRY, MOVE], 'truck' + 3 + '*'+ Math.floor(Math.random() * 100), {role: 'truck'});
        console.log('Spawning new truck: ' + newName);
    }
    else if ((trucks.length < truckTotal || totalStorage > totalStorageCapacity/4*trucks.length) && Game.spawns['Spawn1'].canCreateCreep(truckBody) == OK) {
        var newName = Game.spawns['Spawn1'].createCreep(truckBody, 'truck' + truckBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'truck'});
        console.log('Spawning new truck: ' + newName);
    }
    
    
    
    //if I have some trucks, then I can do miners 
    _.each(miners, function(miner) {
        if (miner.ticksToLive < 60 && miners.length == sources.length && Game.spawns['Spawn1'].canCreateCreep(minerBody) == OK) {
            var newName = Game.spawns['Spawn1'].createCreep(minerBody, 'Miner' + minerBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'miner', sourceID: miner.memory.sourceID});
            console.log('Pre-spawning new miner: ' + newName);
        }
    });
            
        
    if (miners.length < sources.length && Game.spawns['Spawn1'].canCreateCreep(minerBody) == OK && trucks.length > 0) {
        var minerSourceID = sources[0].id;
        for (i = 0; i < sources.length; ++i) {
            for (z = 0; z < miners.length; ++z) {
                if (miners[z].memory.sourceID != sources[i].id) { 
                    minerSourceID = sources[i].id;
                }
            }
        }
        var newName = Game.spawns['Spawn1'].createCreep(minerBody, 'Miner' + minerBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'miner', sourceID: minerSourceID});
        console.log('Spawning new miner: ' + newName);
    }
    else if (militia.length < militiaTotal ) {
        //var newName = Game.spawns['Spawn1'].createCreep(militiaBody, 'Militia' + militiaBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'militia'});
        console.log('Spawning new militia: ' + newName);
    }
    //If I fail to make miners then ill do a traditional harvester.
    else if(harvesters.length < 4 && miners.length == 0) {
        var newName = Game.spawns['Spawn1'].createCreep(workerBody, 'Harvester' + workerBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'harvester'});
        console.log('Spawning new harvester: ' + newName);
    }
    else if(builders.length < builderTotal ) {
        var newName = Game.spawns['Spawn1'].createCreep(workerBody, 'Builder' + workerBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'builder'});
        console.log('Spawning new builder: ' + newName);
    }
    //if im low on upgraders or I have a lot of excess energy
    else if(upgraders.length < upgraderTotal) {
        console.log((thisRoom.energyCapacityAvailable + (1000 / upgraderTotal * upgraders.length)));
        var newName = Game.spawns['Spawn1'].createCreep(workerBody, 'Upgrader' + workerBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'upgrader'});
        console.log('Spawning new upgrader: ' + newName);
    }
    //excess energy spawner.
    else if(totalStorage + thisRoom.storage.store[RESOURCE_ENERGY] > (thisRoom.energyCapacityAvailable + (thisRoom.energyCapacityAvailable / excessTotal * excessLength))&& Game.spawns['Spawn1'].canCreateCreep(workerBody) == OK) {
        var newName = Game.spawns['Spawn1'].createCreep(workerBody, excessRole + workerBody.length + '*'+ Math.floor(Math.random() * 100), {role: excessRole});
        console.log('Spawning new ' + excessRole + ': ' + newName + ' out of excess energy: ' + totalStorage);
    }
    else if(extractor && minMiners.length < 1 && false) {
        var newName = Game.spawns['Spawn1'].createCreep(minerBody, 'minMiner' + minerBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'minMiner', sourceID: thisRoom.find(FIND_MINERALS)[0].id});
            console.log('Spawning new mineral miner: ' + newName);
    }
    else {
    _.each(flagHarvest, function(flag) {
        
        curMilitia = _.filter(militia, (militant) => militant.memory.flag == flag.name);
        if (curMilitia < 1 && flag.memory.spawn) {
            var newName = Game.spawns[flag.memory.spawn].createCreep(militiaBody, 'hmilitia' + militiaBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'militia', flag: flag.name});
            console.log('Spawning new harvester militia: ' + newName);
        }
        else if (flag.memory.spawn) {
            curRemHarvesters = _.filter(remHarvesters, (rHarvester) => rHarvester.memory.flag == flag.name);
            if(curRemHarvesters.length < remHarvesterTotal  && Game.spawns[flag.memory.spawn].canCreateCreep(remHarvesterBody) == OK) {
                var newName = Game.spawns[flag.memory.spawn].createCreep(remHarvesterBody, 'remHarvester' + remHarvesterBody.length + '*'+ Math.floor(Math.random() * 100), {role: 'remHarvester', flag: flag.name});
                console.log('Spawning new remote harvester: ' + newName); 
            }
        }
        
    });
    }
    
    //--------------------------------------------------------------------------
    //ROOM VISUALS
    //--------------------------------------------------------------------------
    if(Game.spawns['Spawn1'].spawning) { 
        var spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1, 
            Game.spawns['Spawn1'].pos.y, 
            {align: 'left', opacity: 0.8});
    }
    //console.log('Energy: ' + totalStorage + '/' + totalStorageCapacity);
    thisRoom.visual.text('Energy: ' + totalStorage + '/' + thisRoom.energyCapacityAvailable, 1, 3, {align: 'left'}); 
    thisRoom.visual.text('Miners: ' + miners.length, 1, 4, {align: 'left'}).text('Builders: ' + builders.length, 1, 5, {align: 'left'}).text('Upgraders: ' + upgraders.length, 1, 6, {align: 'left'});
    thisRoom.visual.text('Trucks: ' + trucks.length, 6, 4, {align: 'left'});
    //--------------------------------------------------------------------------
    //CREEP BEHAVIOR
    //--------------------------------------------------------------------------
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'militia') {
            roleMilitia.run(creep, enemies);
        }
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep, buildingSites, repairSites);
        }
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep);
        }
        if(creep.memory.role == 'truck') {
            roleTruck.run(creep);
        }
        if(creep.memory.role == 'remHarvester') {
            roleRemHarvester.run(creep, remHarvesters);
        }
        if(creep.memory.role == 'minMiner') {
            roleMiner.run(creep);
        }
    }
    
}

