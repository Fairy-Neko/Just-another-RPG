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

// helper function for detecting if an object has a method
Object.prototype.hasMethod = function(name)
{
    return ((typeof this[name]) == "function");
};

// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCC     shared sprite manager pool     CCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
function sharedSpriteMgrPool(name = "default", defaultSize = 512)
{
    this.name = name;
    this.defaultSize = defaultSize;
    this.spriteMgrDict = {};
}

addMethod(sharedSpriteMgrPool.prototype, "getMgr", function(name, scene)
{
    if(!this.spriteMgrDict.hasOwnProperty(name))
    {
        this.spriteMgrDict[name] = new BABYLON.SpriteManager(name, "Assets/Images/" + name + ".png", this.defaultSize, imageSizes[name], scene);
    }
    return this.spriteMgrDict[name];
});

addMethod(sharedSpriteMgrPool.prototype, "getMgr", function(name, scene, size)
{
    if(!this.spriteMgrDict.hasOwnProperty(name))
    {
        this.spriteMgrDict[name] = new BABYLON.SpriteManager(name, "Assets/Images/" + name + ".png", size, imageSizes[name], scene);
    }
    return this.spriteMgrDict[name];
});

addMethod(sharedSpriteMgrPool.prototype, "clearDict", function()
{
    this.spriteMgrDict = {};
});

// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCC  Buffs  CCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// Class for buff and debuffs

function buff()
{
    this.name = "";
}

// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCC  Has life class  CCCCCCCCCCCCCCCCCCC
// CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC
// Anything that has life, appears as a sprite, could recieve damage, being buffed / debuffed and move.
// e.g. players, enemies, bosses ...

function hasLife()
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

hasLife.prototype = 
{
    init:   function() {},
    update: function() {},

    recieveBuff: function(buff) {},
    recieveDamage: function(damage) {}
}
