'use strict';
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
    constructor({name = "default", pathPrefix = "Assets/Images/", fileType = ".png"} = {}) 
    {
        this.name = name;
        this.pathPrefix = pathPrefix;
        this.fileType = fileType;

        this.spriteMgrDict = {};
    }

    getMgr(name, scene, size = 512)
    {
        if(!this.spriteMgrDict.hasOwnProperty(name))
        {
            this.spriteMgrDict[name] = new BABYLON.SpriteManager(name, this.pathPrefix + name + this.fileType, size, imageSizes[name], scene);
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

    render()
    {

    }
}

//
// ─── BUFFS ──────────────────────────────────────────────────────────────────────
//
class Buff 
{
    constructor({
        name = "buff", 
        time = 1.0, 
        stacks = 1, 
        iconId = 0, 
        popupName = "buff", 
        popupColor = new BABYLON.Color4(1, 1, 1, 1)
    } = {})
    {
        //Name of the buff
        this.name = name;
        
        //time in seconds, will automatically reduce by time
        this.timeRemain = time; 

        //Is the buff over? (should be removed from buff list)
        this.isOver = false;

        //stacks of the buff (if any)
        this.stacks = stacks; 

        //cellIndex of this buff in the buffIcons image, might be shown under boss lifebar / player lifebar
        this.iconId = iconId;

        //when the buff was attached or triggered, a small text will pop up like damages e.g. "SLOWED!"
        this.popupName = popupName;

        //Color for the popup text. default is white.
        this.popupColor = popupColor;

        this.popUp();
    }

    // make a popUp
    popUp()
    {
        console.log(this.popupName);
    }

    // N.B.
    // In javascript, parameters were passed via "call-by-sharing".
    // In this case, if you change the parameter itself in a function, it will not make sense;
    // However, if you change a member of the parameter in a function, it will make sense.
    // e.g. func(x) { x = {sth}; } => DOES NOT change x
    //      func(x) { x.y = sth; } => DOES change x.y

    // Be triggered when the mob is updating.
    // This will be triggered before onStatCalculation.
    // e.g. reduce remain time, etc.
    onUpdate(mob, deltaTime)
    {
        this.timeRemain -= deltaTime;
        if(this.timeRemain < 0)
        {
            this.isOver = true;
        }
    }

    // Be triggered when the mob is calculating its stats.
    // Typically, this will trigged on start of each frame.
    // On every frame, the stats of the mob will be recalculated from its base value.
    onStatCalculation(mob) {}

    // Be triggered when the mob is attacking.
    // This is triggered before the mob's attack.
    onAttack(mob) {}

    // Be triggered when the mob has finished an attack.
    onAfterAttack(mob) {}

    // Be triggered when the mob is making a special attack.
    // This is triggered before the attack.
    onSpecialAttack(mob) {}

    // Be triggered when the mob has finished a special attack.
    onAfterSpecialAttack(mob) {}

    // Be triggered when the mob is going to be rendered.
    // e.g. change sprite color here etc.
    onRender(mob) {}
};

//
// ─── HAS LIFE CLASSES ───────────────────────────────────────────────────────────
//
// Anything that has life, appears as a sprite, could recieve damage, being buffed / debuffed and move.
// e.g. players, enemies, bosses ...
class HasLife 
{
    constructor({
        name = "mob",
        health = 100,
        damage = 0,
        spriteMgrPool = undefined,
        scene = undefined,
        spriteName = "mob",
        spriteCount = 512,
        renderSprite = true,
        position = new BABYLON.Vector3(0, 0, 0),
    } = {}) 
    {
        this.name = name;

        // health related
        this.maxHealth = health;
        this.currentHealth = health - damage;
    
        // speed related (1.0 means 100% (NOT a value but a ratio))
        this.speed = 1.0;
        this.movingSpeed = 1.0;
        this.attackSpeed = 1.0;
    
        // buff related
        this.buffList = new Set();

        // rendering
        this.spriteMgrPool = spriteMgrPool;
        this.scene = scene;
        this.spriteCount = spriteCount;
        this.spriteName = spriteName;
        this.position = position;

        this.renderSprite = renderSprite;

        // create sprite
        if(this.renderSprite == true)
        {
            this.sprite = new BABYLON.Sprite(this.name, this.spriteMgrPool.getMgr(this.spriteName, this.scene, this.spriteCount));
            this.sprite.position = this.position;
        }
    }

    init()
    {

    }

    update(deltaTime)
    {
        //Update all the buffes
        for (let buff of this.buffList.values())
        {
            buff.onUpdate(this, deltaTime);
            
            if(buff.isOver == true)
            {
                //this buff is over. delete it from the list.
                this.buffList.delete(buff);
            }
        }

        //calculate Stats
        this.calcStats();
        for (let buff of this.buffList.values())
        {
            buff.onStatCalculation(this);
        }
    }

    render(deltaTime)
    {
        // update the position of the sprite.
        if(this.renderSprite == true)
        {
            this.sprite.position = this.position;
        }
    }

    calcStats()
    {
        //Go back to base speed
        this.speed = 1.0;
        this.movingSpeed = 1.0;
        this.attackSpeed = 1.0;
    }

    recieveBuff()
    {

    }

    recieveDamage()
    {

    }
};
