'use strict';
//miniRAID main script
var gl = document.getElementById("gameMainCanvas").getContext("webgl"); // Get the canvas element
var engine = new BABYLON.Engine(gl, false); // Generate the BABYLON 3D engine

var resourceUrls = [
    'Assets/Maps/test.json',
]

var loader = new Loader();

loader.use(glTiled['resource-loader'].tiledMiddlewareFactory());
loader.add(resourceUrls);
loader.load(onLoad);

var gameApp = gameApp || {};

gameApp =
{
    testSpritePool: new SharedSpriteMgrPool({name: "testPool"}),
    
    testMobSpritePool: new SharedSpriteMgrPool({
        name: "testMobSpritePool",
        pathPrefix: "Assets/Images/Mobs/",
    }),
    testMob: undefined,
    UITex: undefined,

    timeTotal: 0,

//
// ────────────────────────────────────────────────────── I ──────────
//   :::::: M E T H O D S : :  :   :    :     :        :          :
// ────────────────────────────────────────────────────────────────
//

    //
    // ─── GENERATE TEST WORLD ────────────────────────────────────────────────────────
    //

    generateTestWorld: function()
    {
        // Generate a temp world lol
        var tmp = new Array(576);
        var _x, _y;
        for(_x = 0; _x < 32; _x ++)
        {
            for(_y = 0; _y < 18; _y ++)
            {
                var id = _x * 18 + _y;

                if(_y < 8)
                {
                    if(_x < 5 || _x > 27)
                    {
                        tmp[id] = 0;
                    }
                    else if(_x == 5)
                    {
                        tmp[id] = 4;
                    }
                    else if(_x == 27)
                    {
                        tmp[id] = 6;
                    }
                    else
                    {
                        if(getRandomFloat(0, 1) < 0.1)
                        {
                            tmp[id] = 7;
                        }
                        else
                        {
                            tmp[id] = 5;
                        }
                    }
                }
                else if (_y == 8)
                {
                    if(_x < 5 || _x > 27)
                    {
                        tmp[id] = 0;
                    }
                    else if(_x == 5)
                    {
                        tmp[id] = 2;
                    }
                    else if(_x == 27)
                    {
                        tmp[id] = 3;
                    }
                    else
                    {
                        tmp[id] = 1;
                    }
                }
                else
                {
                    tmp[id] = 0;
                }
            }
        }

        return tmp;
    },

    //
    // ─── CREATESCENE ────────────────────────────────────────────────────────────────
    //
    // This method will simply create a scene and a camera.
    createScene: function ()
    {
        // Create the scene space
        var scene = new BABYLON.Scene(engine);
        //
        // ─── ORTHO 2D CAMERA ────────────────────────────────────────────────────────────
        //
        // Add a camera to the scene and attach it to the canvas
        // It is an orthographic camera, as a 2d game.
        var camera = new BABYLON.FreeCamera("FreeCamera", new BABYLON.Vector3(0, 0, -10), scene);
        camera.setTarget(BABYLON.Vector3.Zero());
        camera.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

        // Keep the ascept ratio
        // 1024 x 576 -> 32 by 18, 32 ppu (pixel per unit)
        // (0, 0) in the center.

        // N.B. Due to bug of babylon.js, neither of following properties can be set to 0(zero). 
        // (that means you cannot let origin point (0,0) on the corner.)
        camera.orthoTop = 9;
        camera.orthoBottom = -9;
        camera.orthoLeft = -16;
        camera.orthoRight = 16;

        //
        // ─── FREE CAMERA ────────────────────────────────────────────────────────────────
        //
        // // Parameters : name, position, scene
        // var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);

        // // Targets the camera to a particular position. In this case the scene origin
        // camera.setTarget(BABYLON.Vector3.Zero());
        
        // // Attach the camera to the canvas
        // camera.attachControl(canvas, true);
        // ────────────────────────────────────────────────────────────────────────────────

        // scene.debugLayer.show();

        // >>> Need to test if this works on mobile / old devices properly. <<<
        // Enable babylon.js' web worker based collision system
        scene.workerCollisions = true;
        // >>> Need to test if this works on mobile / old devices properly. <<<

        return scene;
    },
    /******* End of the create scene function ******/

    //
    // ─── GAME INIT ──────────────────────────────────────────────────────────────────
    //

    init: function()
    {
        this.scene = this.createScene();

        // GUI
        this.UITex = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");
        
        // Told popup text manager that the UI handle is here
        UIPopupTextMgr.RegisterGameApp(this);

        this.sprite1 = new BABYLON.Sprite("test1", this.testSpritePool.getMgr("test", this.scene, 16));
        this.sprite2 = new BABYLON.Sprite("test2", this.testSpritePool.getMgr("test", this.scene, 16));

        // grouping test
        this.sprite1.parent = this.sprite2;

        // change the first sprite to second cell
        this.sprite1.cellIndex = 1;

        var tmp = this.generateTestWorld();

        // this.map = new TiledMap({name: "tmap_test", isSolid: tmp}, tmp, this.scene);

        this.testMob = new TestMob({
            spriteMgrPool: this.testMobSpritePool,
            scene: this.scene,
            position: new BABYLON.Vector3(4, 0, 0)
        })

        this.tilemap = new glTiled.GLTilemap(gl, loader.resources[resourceUrls[0]].data, loader.resources);

        this.tilemap.resizeViewport(1024, 576);
    },

    //
    // ─── GAME MAIN LOOP ─────────────────────────────────────────────────────────────
    //

    mainLoop: function(deltaTime)
    {
        //Calculate total time
        this.timeTotal += deltaTime;

        this.sprite1.position = (new BABYLON.Vector3(Math.sin(this.timeTotal), Math.cos(this.timeTotal), -1)).scale(6);
        this.sprite2.position = (new BABYLON.Vector3(Math.cos(this.timeTotal), Math.sin(this.timeTotal), -1)).scale(4);

        this.sprite1.rotation = (new BABYLON.Vector3(this.timeTotal, this.timeTotal, this.timeTotal)).scale(10);

        //Pressure test
        // var i = 0;

        // // 10 / frame : 50fps
        // // 2 / frame : 60fps
        // for(i = 0; i < 1; i++)
        // {
        //     UIPopupTextMgr.Singleton().AddText({
        //         text: "9999",
        //         posX: this.sprite1.position.x + getRandomFloat(-.4, .4),
        //         posY: this.sprite1.position.y + getRandomFloat(-.4, .4),
        //         outlineWidth: 2
        //     });

        //     UIPopupTextMgr.Singleton().AddText({
        //         text: "9999",
        //         posX: this.sprite2.position.x + getRandomFloat(-.4, .4),
        //         posY: this.sprite2.position.y + getRandomFloat(-.4, .4),
        //         outlineWidth: 2
        //     });
        // }

        
        this.testMob.update(deltaTime);

        UIPopupTextMgr.Singleton().update(deltaTime);
    },

    //
    // ─── RENDER THE SCENE ───────────────────────────────────────────────────────────
    //

    render: function(deltaTime)
    {
        this.testMob.render(deltaTime);
        this.scene.render();
        this.tilemap.update(deltaTime);
        this.tilemap.draw(0, 0);
    },
};

function onLoad()
{
    gameApp.init();

    engine.runRenderLoop(function () { // Register a render loop to repeatedly render the scene
        
        // engine.getDeltaTime() returns ms.
        gameApp.mainLoop(engine.getDeltaTime() * 0.001);

        // Render the scene after update
        gameApp.render(engine.getDeltaTime() * 0.001);

        var fpsLabel = document.getElementById("fpsLabel");
        fpsLabel.innerHTML = engine.getFps().toFixed() + " fps";

    });

    // window.addEventListener("resize", function () { // Watch for browser/canvas resize events
    //         engine.resize();
    // });
}
