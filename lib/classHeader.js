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

// Helper for generate random ints
//The maximum is exclusive and the minimum is inclusive
function getRandomInt(min, max) 
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; 
}

function getRandomFloat(min, max) 
{
    return Math.random() * (max - min) + min;
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
// ─── RENDERING TILED MAP ────────────────────────────────────────────────────────
//
// We directly use serval sprites to render the map.
class TiledMap
{
    constructor(tileSet, map, scene, size = {x: 32, y: 18})
    {
        // A tileset should contain:
        // [*] name : String (the actual filename would be "Assets/Images/TileSet/name.png")
        // [*] isSolid : List of numbers (is the grid is an solid block?)

        // map : a list of numbers contains the map
        
        this.tileSet = tileSet;
        this.mapData = map;

        this.position = new BABYLON.Vector3(0, 0, 0);

        // Create a sprite manager for the tiled map
        this.spriteManager = new BABYLON.SpriteManager(tileSet.name, "Assets/Images/TileSet/" + tileSet.name + ".png", size.x * size.y, 32, scene);

        // Create sprites
        this.sprites = new Array(size.x * size.y);

        var x, y;
        for (x = 0; x < size.x; x++)
        {
            for (y = 0; y < size.y; y++)
            {
                this.sprites[x * size.y + y] = new BABYLON.Sprite("tiledSprites", this.spriteManager);

                this.sprites[x * size.y + y].position = new BABYLON.Vector3(x - (size.x / 2) + 0.5, y - (size.y / 2) + 0.5, 0);

                this.sprites[x * size.y + y].cellIndex = map[x * size.y + y];
            }
        }
    }

    update()
    {

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
