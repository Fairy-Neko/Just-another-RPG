'use strict';
// Some buffes

class IceSlowed extends Buff
{
    constructor({name = "ice_slowed", time = 1.0, stacks = 1} = {})
    {
        super({
            name: name, 
            time: time, 
            stacks: stacks,
            iconId: 1,
            popupName: "SLOWED!",
            popupColor: new BABYLON.Color4(0.5, 0.6, 1.0, 1.0)
        });
    }

    onStatCalculation(mob)
    {
        if('speed' in mob)
        {
            mob.speed = 0.2 * mob.speed;
        }
    }
}