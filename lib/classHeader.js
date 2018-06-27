// I don't know how to do OOP in JS...lol

// Why it is all started with a lower case character ?????????!!?!?
// (in JS tutorials and babylonjs)
// OMG.

// helper function for function overloading
// from https://www.cnblogs.com/yugege/p/5539020.html
function addMethod(object, name, fn)
{
    var old = object[name];
    object[name] = function()
    {
        if(fn.length === arguments.length)
        {
            return fn.apply(this, arguments);
        }
        else if(typeof old === "function")
        {
            return old.apply(this, arguments);
        }
    }
}

//
// ─── SHARED SPRITE MANAGER POOL ─────────────────────────────────────────────────
//
class SharedSpriteMgrPool 
{
    constructor(name = "default") 
    {
        this.name = name;
        this.spriteMgrDict = {};
    }

    getMgr(name, scene, size = 512)
    {
        if(!this.spriteMgrDict.hasOwnProperty(name))
        {
            this.spriteMgrDict[name] = new BABYLON.SpriteManager(name, "Assets/Images/" + name + ".png", size, imageSizes[name], scene);
        }
        return this.spriteMgrDict[name];
    }

    clearDict()
    {
        this.spriteMgrDict = {};        
    }
}

//
// ─── BUFFS ──────────────────────────────────────────────────────────────────────
//
class Buff 
{
    constructor() 
    {
        this.name = "";
    }
};

//
// ─── HAS LIFE CLASSES ───────────────────────────────────────────────────────────
//
// Anything that has life, appears as a sprite, could recieve damage, being buffed / debuffed and move.
// e.g. players, enemies, bosses ...
class HasLife 
{
    constructor() 
    {
        // health related
        this.maxHealth = 100;
        this.currentHealth = 100;
    
        // speed related
        this.speed = 1.0;
        this.movingSpeed = 1.0;
        this.attackSpeed = 1.0;
    
        // buff related
        this.buffList = {};
    }

    init()
    {

    }

    update()
    {

    }

    recieveBuff()
    {

    }

    recieveDamage()
    {

    }
};
