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
