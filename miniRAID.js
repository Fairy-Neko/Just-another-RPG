//miniRAID main script
var canvas = document.getElementById("gameMainCanvas"); // Get the canvas element
var engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

var gameApp = gameApp || {};

gameApp =
{
    testSpritePool: new SharedSpriteMgrPool("testPool"),
    timeTotal: 0,

    // Methods
    /******* Add the create scene function ******/
    createScene: function ()
    {
        // Create the scene space
        var scene = new BABYLON.Scene(engine);

        // Add a camera to the scene and attach it to the canvas
        // It is an orthographic camera, as a 2d game.
        var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

        // Keep the ascept ratio
        // 1024 x 576 -> 32 by 18, 32 ppu (pixel per unit)
        // (0, 0) in the center.
        camera.orthoTop = 9;
        camera.orthoBottom = -9;
        camera.orthoLeft = -16;
        camera.orthoRight = 16;

        // Add lights to the scene
        var light2 = new BABYLON.PointLight("light2", new BABYLON.Vector3(0, 0, 0), scene);

        // Add and manipulate meshes in the scene
        sphere = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);
        sphere2 = BABYLON.MeshBuilder.CreateSphere("sphere", {diameter:2}, scene);

        sphere.position = new BABYLON.Vector3(16, 9, 0);
        sphere2.position = new BABYLON.Vector3(-16, -9, 0);

        return scene;
    },
    /******* End of the create scene function ******/

    //
    // ─── GAME INIT ──────────────────────────────────────────────────────────────────
    //

    init: function()
    {
        this.scene = this.createScene();

        this.sprite1 = new BABYLON.Sprite("test1", this.testSpritePool.getMgr("test", this.scene, 16));
        this.sprite2 = new BABYLON.Sprite("test2", this.testSpritePool.getMgr("test", this.scene, 16));

        // change the first sprite to second cell
        this.sprite1.cellIndex = 1;
    },

    //
    // ─── GAME MAIN LOOP ─────────────────────────────────────────────────────────────
    //

    mainLoop: function(deltaTime)
    {
        //Calculate total time
        this.timeTotal += deltaTime;

        this.sprite1.position = (new BABYLON.Vector3(Math.sin(this.timeTotal), Math.cos(this.timeTotal), 0)).scale(6);
        this.sprite2.position = (new BABYLON.Vector3(Math.cos(this.timeTotal), Math.sin(this.timeTotal), 0)).scale(4);
    },

    //
    // ─── RENDER THE SCENE ───────────────────────────────────────────────────────────
    //

    render: function()
    {
        this.scene.render();
    },
};

gameApp.init();

engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
    
    // engine.getDeltaTime() returns ms.
    gameApp.mainLoop(engine.getDeltaTime() * 0.001);

    // Render the scene after update
    gameApp.render();

});

// window.addEventListener("resize", function () { // Watch for browser/canvas resize events
//         engine.resize();
// });
