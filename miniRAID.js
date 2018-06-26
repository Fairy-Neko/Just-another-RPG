//miniRAID main script

var canvas = document.getElementById("gameMainCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var gameApp = gameApp || {};

gameApp =
{
    testSpritePool: new sharedSpriteMgrPool("testPool"),

    // Methods
    /******* Add the create scene function ******/
    createScene: function ()
    {
        // Create the scene space
        var scene = new BABYLON.Scene(engine);

        // Add a camera to the scene and attach it to the canvas
        var camera = new BABYLON.UniversalCamera("Camera", new BABYLON.Vector3(0, 0, -6), scene);

        camera.speed = .3;
        camera.keysUp   = [87, 119] //W
        camera.keysLeft = [65,  97] //A
        camera.keysDown = [83, 115] //S
        camera.keysRight= [68, 100] //D

        camera.setTarget(BABYLON.Vector3.Zero());
        camera.attachControl(canvas, true);

        // Add lights to the scene
        var light1 = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(1, 1, 0), scene);
        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 1, -1), scene);

        // Add and manipulate meshes in the scene
        var sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
        sphere.position.x = 5;

        return scene;
    },
    /******* End of the create scene function ******/

    init: function()
    {
        this.scene = this.createScene();

        var sprite1 = new BABYLON.Sprite("test1", this.testSpritePool.getMgr("test", this.scene, 16));
        var sprite2 = new BABYLON.Sprite("test2", this.testSpritePool.getMgr("test", this.scene, 16));

        sprite2.position.y = -2;
    }
};

gameApp.init();

engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
        gameApp.scene.render();
});

window.addEventListener("resize", function () { // Watch for browser/canvas resize events
        engine.resize();
});
