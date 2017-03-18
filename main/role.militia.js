var roleMilitia = {
    run: function(creep, enemies) {
        var rEnemies = creep.room.find(FIND_HOSTILE_CREEPS, {
            filter: (hcreep) => hcreep.owner == "Invader"
            
        });
        if (rEnemies.length) {
            if(creep.attack(rEnemies[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(rEnemies[0]);
            }
            creep.say("Die Invader!", true);
        }
        else {
            if (!creep.pos.inRangeTo(Game.flags[creep.memory.flag], 5)) {
                creep.moveTo(Game.flags[creep.memory.flag]);
            }
            else {
                creep.say("🏥", true);
            }
        }
        creep.heal(creep);
    }
}

module.exports = roleMilitia;
