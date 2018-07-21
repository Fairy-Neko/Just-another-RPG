'use strict';

var generalSpriteVS = `
uniform mat4 u_viewProj;

// per Instance
attribute mat4 i_world;
attribute vec4 i_tintColor;
attribute vec4 i_texOffsetScale; // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);

// per Vertex
attribute vec4 position;
attribute vec2 texcoord;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec4 v_tintColor;

void main()
{
    // Convert texture coord w.r.t. i_texOffsetScale
    v_texCoord = vec2(texcoord.x / i_texOffsetScale.z + i_texOffsetScale.x * (1.0 / i_texOffsetScale.z),
        texcoord.y / i_texOffsetScale.w + i_texOffsetScale.y * (1.0 / i_texOffsetScale.w));

    vec4 wPosition = i_world * position;
    // vec4 wPosition = position;
    v_position = u_viewProj * wPosition;
    v_tintColor = i_tintColor;
    gl_Position = v_position;
}
`;

var generalSpriteFS = `
precision mediump float;

varying vec4 v_position;
varying vec2 v_texCoord;
varying vec4 v_tintColor;

uniform sampler2D u_mainTex;

void main()
{
    // Sample the texture and tint then finish.
    // The * operator works component-wise for vectors like vec4.
    gl_FragColor = texture2D(u_mainTex, v_texCoord) * v_tintColor;
    // gl_FragColor = vec4(1, 1, 1, 0.1);
}
`;

//
// ─── HELPER FUNCTION FOR M4 MULTPLY V3 ──────────────────────────────────────────
//
// This might be not so efficient...
function mulVecMat(mat, vec)
{
    // twgl.m4 stores matrix in column - major, that is:
    // 0   4   8   12
    // 1   5   9   13
    // 2   6   10  14
    // 3   7   11  15
    return twgl.v3.create(
        mat[0] * vec[0] + mat[4] * vec[1] + mat[8] * vec[2] + mat[12], /*x*/
        mat[1] * vec[0] + mat[5] * vec[1] + mat[9] * vec[2] + mat[13], /*y*/
        mat[2] * vec[0] + mat[6] * vec[1] + mat[10]* vec[2] + mat[14]  /*z*/);
}

function mulVec2Mat(mat, vec)
{
    return [
        mat[0] * vec[0] + mat[4] * vec[1] + mat[12], /*x*/
        mat[1] * vec[0] + mat[5] * vec[1] + mat[13]  /*y*/];
}

// Helper for generate random ints
// The maximum is exclusive and the minimum is inclusive
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

function radian(degree)
{
    return degree / 180.0 * Math.PI;
}

//
// ─── HELPER FUNCTION FOR VEC2 ───────────────────────────────────────────────────
//

var vec2 = 
{
    dot: function(a, b)
    {
        return a[0] * b[0] + a[1] * b[1];
    },

    scalar: function(a, s)
    {
        return [s * a[0], s * a[1]];
    },

    add: function(a, b)
    {
        return [a[0] + b[0], a[1] + b[1]];
    },

    sub: function(a, b)
    {
        return [a[0] - b[0], a[1] - b[1]];
    },

    length: function(a)
    {
        return Math.sqrt(a[0] * a[0] + a[1] * a[1]);
    },

    // Material for 2D rotation:
    // https://www.siggraph.org/education/materials/HyperGraph/modeling/mod_tran/2drota.htm
    rotate: function(a, rad)
    {
        return [a[0] * Math.cos(rad) - a[1] * Math.sin(rad), a[1] * Math.cos(rad) + a[0] * Math.sin(rad)];
    },
}

//
// ─── MATERIAL ───────────────────────────────────────────────────────────────────
//
class Material
{
    // A material could have:
    // A shader (twgl.createProgramInfo)
    // Many attributes needed by the shader

    constructor({
        programInfo = undefined,
        uniforms = undefined,
    } = {})
    {
        this.programInfo = programInfo;
        this.uniforms = uniforms;
    }

    setUpMaterial(gl)
    {
        gl.useProgram(this.programInfo.program);
        twgl.setUniforms(this.programInfo, this.uniforms);
    }

    getProgramInfo()
    {
        return this.programInfo;
    }

    setUniform(uniforms)
    {
        this.uniforms = uniforms;
    }

    getUniform()
    {
        return this.uniforms;
    }
}

//
// ─── RENDER OBJECT ──────────────────────────────────────────────────────────────
//
class RenderObject
{
    constructor({
        material = undefined,
        bufferInfo = undefined,

        // undefined will be automatically translate to gl.TRIANGLES during render.
        drawType = undefined,
        gl = undefined,

        // Required render queue. the render object will be automatically added into the renderer.
        queue = 0,
    } = {})
    {
        this.material = material;
        this.bufferInfo = bufferInfo;

        this.drawType = drawType;
        this.vertexArrayInfo = undefined;

        // Render objects need to form a (1-way) linked list
        // to improve performance
        this.nextObject = undefined;
        this.prevObject = undefined;
        this.parentList = undefined;

        if(typeof gl !== "undefined")
        {
            this.drawType = (this.drawType === undefined) ? gl.TRIANGLES : this.drawType;

            if(typeof this.bufferInfo !== "undefined")
            {
                this.vertexArrayInfo = twgl.createVertexArrayInfo(gl, this.material.getProgramInfo(), this.bufferInfo);
            }
        }

        RenderObject.game.renderer.addObject(this, queue);
    }

    prepareRender(gl)
    {
        if(typeof this.drawType === "undefined")
        {
            this.drawType = gl.TRIANGLES;
        }

        if(typeof this.vertexArrayInfo == "undefined")
        {
            this.vertexArrayInfo = twgl.createVertexArrayInfo(gl, this.material.getProgramInfo(), this.bufferInfo);
        }
    }

    render(gl)
    {
        this.prepareRender(gl);

        this.material.setUpMaterial(gl);
        twgl.setBuffersAndAttributes(gl, this.material.getProgramInfo(), this.vertexArrayInfo);
        twgl.drawBufferInfo(gl, this.vertexArrayInfo, this.drawType, this.vertexArrayInfo.numelements, 0, 1);
    }

    static RegisterGameApp(game)
    {
        RenderObject.game = game;
    }
}

//
// ─── SPRITE RENDER OBJECT ───────────────────────────────────────────────────────
//
// A object of "Sprite RenderObject" stands for a set of sprites that shares same material (image file),
// And they could have different position, rotation, tint color, sprite sheet etc.
// This class should be used inside sprite class.
class SpriteRenderObject extends RenderObject
{
    constructor(gl, {
        spriteFile = "Assets/Images/test.png",
        sizeX = 1,
        sizeY = 1,
        startSize = 64,
        queue = 0,
    } = {})
    {
        super({
            material: new Material({
                programInfo: twgl.createProgramInfo(gl, [generalSpriteVS, generalSpriteFS]),
                uniforms:{
                    // Texture of those sprites (they share the same texture)
                    u_mainTex: SpriteTexPool.Singleton().getTexture(spriteFile),
                },
            }),
            bufferInfo: undefined, 
                // ^ Rotate the XZ plane to a XY plane.
                // (twgl's XYQuad is always square so we do not want it)
                // Not sure if this could introduce some precision problem ...
            drawType: gl.TRIANGLES,
            gl: gl,
            queue: queue,
        });

        this.instanceBuffer = {
            // OMG how to deal with instances...
            // emmmmmm...
            /*
                Use a linked list to hold all instances (Sprites).
                Iterate over the linked list to get an instance buffer. (O(n))
                Only update (iterate the whole list) when adding or removing sprites.
                Multiple actions in one frame will be combined to a single iteration.
                Add / Remove elements costs O(1), and a single O(n) to iterate them all.

                The instance buffer (array) will have a fixed size at beginning, and it will
                become 1.5x (realloc) if needed. (just like std::vector, 1.5x instead of 2x)

                Each element hold an index after iteration (creation / modification of the instance buffer),
                To directly update their instance data.
                After iteration, the SpriteRenderObject will modify the index hold by each instances.
                Instances could update data directly to the buffer without any extra cost.
            */

            // World matrix of each instance
            i_world: new Float32Array(startSize * 16),

            // Tint color (including alpha) of the sprite
            i_tintColor: new Float32Array(startSize * 4),

            // The sprite sheet texture trick thing
            // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);
            i_texOffsetScale: new Float32Array(startSize * 4),
        };

        var arrays = {
            position: [-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0],
            texcoord: [0, 0, 1, 0, 1, 1, 0, 1],
            indices:  [0, 3, 2, 0, 2, 1],
        };
        Object.assign(arrays, {
            i_world: {
                numComponents: 16,
                data: this.instanceBuffer.i_world,
                divisor: 1,
            },
            i_tintColor: {
                numComponents: 4,
                data: this.instanceBuffer.i_tintColor,
                divisor: 1,
            },
            i_texOffsetScale: {
                numComponents: 4,
                data: this.instanceBuffer.i_texOffsetScale,
                divisor: 1,
            },
        });
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

        this.vertexArrayInfo = twgl.createVertexArrayInfo(gl, this.material.getProgramInfo(), this.bufferInfo);

        // The linked list
        this.headObject = undefined;
        this.tailObject = undefined;

        // Should the instance buffer update using the linked list?
        // This only happens when adding or removing sprites.
        // When this render object was created, it should has an initial update.
        this.isDirty = true;
        this.spriteCount = 0;
        this.currentBufferSize = startSize;
    }

    // Add a sprite at the end of the list
    addSprite(sprite)
    {
        sprite.parentList = this;

        sprite.prevObject = this.tailObject;
        sprite.nextObject = undefined;

        // The list is empty
        if(typeof this.headObject === "undefined" &&
           typeof this.tailObject === "undefined")
        {
            this.headObject = sprite;
        }
        else
        {
            // The object should be add to the end of the list
            // to keep the order of instance buffer.
            this.tailObject.nextObject = sprite;
        }

        this.tailObject = sprite;

        // The instance buffer should be updated.
        this.isDirty = true;
        this.spriteCount += 1;
    }

    // Remove a sprite from the list
    removeSprite(sprite)
    {
        // TODO: check if the GC works properly so no memory leaks !
        // Because we have not really deleted the object.
        // It should be collected by JavaScript GC cuz no ref to the object.

        // You are deleting objects not belong to this list!
        if(sprite.parentList !== this)
        {
            return;
        }

        if(typeof sprite.nextObject !== "undefined")
        {
            sprite.nextObject.prevObject = sprite.prevObject;
        }
        else
        // You are deleting the tail node of this list (cuz it does not have next and it is in this list)
        {
            this.tailObject = this.tailObject.prevObject;
        }

        if(typeof sprite.prevObject !== "undefined")
        {
            sprite.prevObject.nextObject = sprite.nextObject;
        }
        else
        // You are deleting the head node of this list (cuz it does not have prev and it is in this list)
        {
            this.headObject = this.headObject.nextObject;
        }

        // The instance buffer should be updated.
        this.isDirty = true;
        this.spriteCount -= 1;
    }

    flushInstanceBuffer()
    {
        var reallocFlag = false;
        while(this.spriteCount > this.currentBufferSize)
        {
            // Actually this part will not work if we cannot realloc VBOs.
            // So simply return a false when the buffer is full.
            // TODO: realloc VBOs on GPU.
            return false;

            reallocFlag = true;
            this.currentBufferSize = Math.floor(this.currentBufferSize * 1.5);
        }

        if(reallocFlag === true)
        {
            // Re-alloc the buffers.
            
            // TODO: check if the GC works properly so no memory leaks !
            // Because we have not really deleted the object.
            // It should be collected by JavaScript GC cuz no ref to the object.
            
            // World matrix of each instance
            this.instanceBuffer.i_world = new Float32Array(startSize * 16);

            // Tint color (including alpha) of the sprite
            this.instanceBuffer.i_tintColor = new Float32Array(startSize * 4);

            // The sprite sheet texture trick thing
            // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);
            this.instanceBuffer.i_texOffsetScale = new Float32Array(startSize * 4);
        }

        // Re-assign index (arrays)
        // s: current sprite reference
        // idx: current index (for assigning the buffer)
        for(var s = this.headObject, idx = 0; s != undefined; s = s.nextObject, ++idx)
        {
            s.instanceBuffer.i_world = new Float32Array(this.instanceBuffer.i_world.buffer, idx * 16 * 4, 16);
            s.instanceBuffer.i_tintColor = new Float32Array(this.instanceBuffer.i_tintColor.buffer, idx * 4 * 4, 4);
            s.instanceBuffer.i_texOffsetScale = new Float32Array(this.instanceBuffer.i_texOffsetScale.buffer, idx * 4 * 4, 4);

            s.render();
        }
    }

    render(gl)
    {
        if(this.isDirty === true)
        {
            // Re-assign the instance buffer index to the sprites
            // The value will be filled later by calling render() of each sprite.
            // The buffer will automatically increase the size if needed.
            // This function will also call render() on each sprite.
            this.flushInstanceBuffer();

            this.isDirty = false;
        }
        else
        {
            for(var s = this.headObject; s != undefined; s = s.nextObject)
            {
                s.render();
            }
        }

        // Render the instances
        if(this.spriteCount > 0)
        {
            // Update the VBO for the instance buffer
            twgl.setAttribInfoBufferFromArray(gl, this.bufferInfo.attribs.i_world, this.instanceBuffer.i_world);
            twgl.setAttribInfoBufferFromArray(gl, this.bufferInfo.attribs.i_tintColor, this.instanceBuffer.i_tintColor);
            twgl.setAttribInfoBufferFromArray(gl, this.bufferInfo.attribs.i_texOffsetScale, this.instanceBuffer.i_texOffsetScale);

            this.prepareRender(gl);

            this.material.setUpMaterial(gl);
            twgl.setBuffersAndAttributes(gl, this.material.getProgramInfo(), this.vertexArrayInfo);
            twgl.drawBufferInfo(gl, this.vertexArrayInfo, this.drawType, this.vertexArrayInfo.numelements, 0, this.spriteCount);
        }
    }

    static RegisterGameApp(game)
    {
        SpriteRenderObject.game = game;
    }

    // This will only give you the render object.
    // SpriteRenderObject.addSprite() will not be called.
    static getSpriteRenderObject(name, {
        preferredSize = 64,
        renderQueue = 0,
    } = {})
    {
        // Create the dict if it doesn't exist
        if(typeof SpriteRenderObject.dict === "undefined")
        {
            SpriteRenderObject.dict = {};
        }

        // Modify the name with required render queue
        var nameWQueue = name + renderQueue;

        if(!SpriteRenderObject.dict.hasOwnProperty(nameWQueue))
        {
            SpriteRenderObject.dict[nameWQueue] = new SpriteRenderObject(SpriteRenderObject.game.gl,{
                spriteFile: name,
                sizeX: 1,
                sizeY: 1,
                startSize: preferredSize,
                queue: renderQueue,
            });
        }

        return SpriteRenderObject.dict[nameWQueue];
    }

    static clearRenderObjectDict()
    {
        // don't know if this will cause some GC problems...
        for(var key in SpriteRenderObject.dict)
        {
            delete SpriteRenderObject.dict[key];
        }
    }
}

//
// ─── TRANSFORM ──────────────────────────────────────────────────────────────────
//

class Transform
{
    constructor({
        position = twgl.v3.create(0, 0, 0),
        rotation = twgl.m4.identity(),
        scale = twgl.v3.create(1, 1, 1),
        children = [],
        parent = undefined,
    } = {})
    {
        this.position = position;
        this.rotation = rotation;
        this.scale = scale;
        this.children = children;
        this.parent = parent;

        // Calculate the local and world matrix (initial)
        this.localMatrix =  twgl.m4.scale
                            (
                                twgl.m4.multiply
                                (
                                    twgl.m4.translation(this.position), 
                                    this.rotation
                                ), 
                                this.scale
                            );
        this.worldMatrix = this.getWorldMatrix();
    }

    update()
    {
        // Calculate the local and world matrix
        this.localMatrix =  twgl.m4.scale
                            (
                                twgl.m4.multiply
                                (
                                    twgl.m4.translation(this.position), 
                                    this.rotation
                                ), 
                                this.scale
                            );
        this.worldMatrix = this.getWorldMatrix();        
    }

    getWorldMatrix()
    {
        if(typeof this.parent !== "undefined")
        {
            return twgl.m4.multiply(this.parent.getWorldMatrix(), this.localMatrix);
        }
        else
        {
            return this.localMatrix;
        }
    }
}

//
// ─── GAME OBJECT ────────────────────────────────────────────────────────────────
//

class GameObject
{
    constructor(gl, {
        renderObject = undefined,
        transform = new Transform(),
    } = {})
    {
        this.gl = gl;
        this.renderObject = renderObject;
        this.transform = transform;
    }

    updateBase(time, deltaTime)
    {
        this.transform.update();
        if(typeof this.collider !== "undefined")
        {
            this.collider.update();
        }
    }

    update(time, deltaTime)
    {

    }

    collides(other)
    {

    }
}

//
// ─── SPRITE TEXTURE POOL ───────────────────────────────────────────────────────
//

class SpriteTexPool
{
    static Singleton()
    {
        if(typeof SpriteTexPool.singleton == 'undefined')
        {
            SpriteTexPool.singleton = new SpriteTexPool();
        }

        return SpriteTexPool.singleton;
    }

    constructor()
    {
        this.spriteTexPool = {};
    }

    RegisterGameApp(game)
    {
        this.game = game;
        this.gl = this.game.gl;
    }

    getTexture(name)
    {
        if(typeof this.game !== "undefined")
        {
            if(!this.spriteTexPool.hasOwnProperty(name))
            {
                this.spriteTexPool[name] = twgl.createTexture(this.gl, {
                    src: name,
                    minMag: this.gl.NEAREST, // Assuming we r having pixel perfect ~w~
                })
            }

            return this.spriteTexPool[name];
        }
    }

    releaseTexture(name)
    {
        if(typeof this.game !== "undefined")
        {
            if(this.spriteTexPool.hasOwnProperty(name))
            {
                this.gl.deleteTexture(this.spriteTexPool[name]);
                delete this.spriteTexPool[name];
            }
        }
    }

    clearDict()
    {
        for(var key in this.spriteTexPool)
        {
            this.releaseTexture(key);
            delete this.spriteTexPool[key];
        }
    }
}

//
// ─── BOUNDBOXES ─────────────────────────────────────────────────────────────────
//

class BoundBox
{
    constructor({
        parentTransform = undefined,
        parent = undefined,
        boundMin = [0, 0],
        boundMax = [0, 0],
        label = "unlabeled",
        type = "abstruct"
    })
    {
        this.parentTransform = parentTransform;
        this.bounds = {min: boundMin, max: boundMax};
        this.label = label;
        this.type = type;
        this.parent = parent;
    }

    update() {}

    hitTest(target) {}
}

//
// ─── BOUNDBOX - OBB ─────────────────────────────────────────────────────────────
//

class OBB extends BoundBox
{
    constructor({
        parentTransform = undefined,
        parent = undefined,
        size = [1, 1],
        rotation = 0,
        label = "unlabeled",
    })
    {
        super({
            parentTransform: parentTransform,
            label: label,
            type: "OBB",
            parent: parent
        });

        this.position = [0, 0];

        // Extents in each direction: [[axis1+, axis1-], [axis2+, axis2-]]
        this.originExtents = [size[0] / 2, size[1] / 2];
        this.extents = [size[0] / 2, size[1] / 2];

        // Rotated axes of the OBB.
        this.axes = [[1, 0], [0, 1]];

        // Rotation in degrees.
        this.rotation = rotation;

        this.applyTranslation();
        this.calculateBounds(size);
    }

    applyTranslation()
    {
        this.position = [0, 0];
        this.axes[0] = vec2.rotate([1, 0], radian(this.rotation));
        this.axes[1] = vec2.rotate([0, 1], radian(this.rotation));

        if(typeof this.parentTransform !== "undefined")
        {
            var mat = this.parentTransform.getWorldMatrix();

            // Apply translation and rotation
            this.position = mulVec2Mat(mat, this.position);
            this.axes[0] = vec2.sub(mulVec2Mat(mat, this.axes[0]), this.position);
            this.axes[1] = vec2.sub(mulVec2Mat(mat, this.axes[1]), this.position);

            // Apply scaling
            var len0 = vec2.length(this.axes[0]);
            var len1 = vec2.length(this.axes[1]);

            this.axes[0] = vec2.scalar(this.axes[0], 1 / len0);
            this.axes[1] = vec2.scalar(this.axes[1], 1 / len1);
            this.extents[0] = this.originExtents[0] * len0;
            this.extents[1] = this.originExtents[1] * len1;
        }
    }

    calculateBounds(size)
    {
        // Use the circumscribed rectangle of the minimum circle that contains the OBB in any direction as the bounds of the OBB.
        this.radius = vec2.length(size) * 0.5;

        this.bounds.min = [-this.radius, -this.radius];
        this.bounds.max = [ this.radius,  this.radius];
    }

    update()
    {
        super.update();
        this.applyTranslation();
    }

    _intersect(extentA, extentB)
    {
        if(extentA[1] < extentB[0] || extentB[1] < extentA[0])
        {
            return false;
        }
        return true;
    }

    hitTest(target)
    {
        // Article about OBB intersection (Chinese):
        // https://www.cnblogs.com/iamzhanglei/archive/2012/06/07/2539751.html
        if(target.type == "OBB")
        {
            // Axes used for detection
            var detectingAxes = [this.axes[0], this.axes[1], target.axes[0], target.axes[1]];
            var subVector = vec2.sub(this.position, target.position);

            for(var i = 0; i < 4; i++)
            {
                var r1 = this.extents[0] * Math.abs(vec2.dot(detectingAxes[i], this.axes[0])) + this.extents[1] * Math.abs(vec2.dot(detectingAxes[i], this.axes[1]));
                var r2 = target.extents[0] * Math.abs(vec2.dot(detectingAxes[i], target.axes[0])) + target.extents[1] * Math.abs(vec2.dot(detectingAxes[i], target.axes[1]));
                var rs = Math.abs(vec2.dot(subVector, detectingAxes[i]));

                if(r1 + r2 <= rs)
                {
                    return false;
                }
            }

            return true;
        }
    }
}

//
// ─── SPRITES ────────────────────────────────────────────────────────────────────
//

class Sprite extends GameObject
{
    constructor(gl, {
        spriteFile = "Assets/Images/test.png",
        initCell = 0,
        position = twgl.v3.create(0, 0, 0),
        rotation = twgl.m4.identity(),
        scale = twgl.v3.create(1, 1, 1),
        tintColor = [1, 1, 1, 1],
        sizeX = 1,
        sizeY = 1,
        preferredSize = 64,
        parent = undefined,
        layer = 0,
        useCollider = true,
    } = {})
    {
        /*
            material: new Material({
                programInfo: twgl.createProgramInfo(gl, [generalSpriteVS, generalSpriteFS]),
                uniforms: {
                    // The world matrix of this object
                    i_world: twgl.m4.identity(),

                    // Tint color (including alpha) of the sprite
                    i_tintColor: tintColor,

                    // The sprite sheet texture trick thing
                    i_texOffsetScale: [
                        // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);
                        initCell % ImageSizes[spriteFile].cellCountX,
                        Math.floor(initCell / ImageSizes[spriteFile].cellCountX),
                        ImageSizes[spriteFile].cellCountX,
                        ImageSizes[spriteFile].cellCountY
                    ],
                    u_mainTex: SpriteTexPool.Singleton().getTexture(spriteFile),
                }
            }),
            bufferInfo: twgl.createPlaneBufferInfo(gl, sizeX, sizeY, 1, 1, 
                twgl.m4.axisRotation([1, 0, 0], 1.5707963)), 
                // ^ Rotate the XZ plane to a XY plane.
                // (twgl's XYQuad is always square so we do not want it)
                // Not sure if this could introduce some precision problem ...
        */

        scale[0] *= sizeX;
        scale[1] *= sizeY;

        super(gl, {
            renderObject: SpriteRenderObject.getSpriteRenderObject(spriteFile, {
                preferredSize: preferredSize,
                renderQueue: layer,
            }),
            transform: new Transform({
                position: position,
                rotation: rotation,
                scale: scale,
                parent: parent,
            }),
        });

        this.spriteName = spriteFile;
        this._cX = ImageSizes[spriteFile].cellCountX;
        this._cY = ImageSizes[spriteFile].cellCountY;
        this.tintColor = tintColor;
        this.currentCell = initCell;

        // This is different from this.renderObject.material.uniforms
        // this.uniforms contains only part of instance buffers 
        // ( It is from this.renderObject.material.uniforms ).
        this.instanceBuffer = {
            i_world: undefined,
            i_tintColor: undefined,
            i_texOffsetScale: undefined
        };

        // Sprites should also form a linked list
        // to improve performance
        this.nextObject = undefined;
        this.prevObject = undefined;
        this.parentList = undefined;

        // Add this to the sprite render object to be rendered.
        this.renderObject.addSprite(this);
    }
    
    getDefaultCollider()
    {
        return new OBB({
            parentTransform: this.transform,
            size: [1, 1],
        });
    }

    setCollider(collider)
    {
        this.collider = collider;
        this.collider.parent = this;
    }

    // render() will only be called if this sprite has already have a proper
    // instance buffer pointer.
    render()
    {
        twgl.m4.copy(this.transform.getWorldMatrix(), this.instanceBuffer.i_world);
        this.instanceBuffer.i_tintColor.set(this.tintColor);
        this.instanceBuffer.i_texOffsetScale.set(
        [
            // (x, y) -> texOffset; (z, w) -> texScale (inv of tiling);
            this.currentCell % this._cX,
            Math.floor(this.currentCell / this._cX),
            this._cX,
            this._cY
        ]);
    }

    rotate(degree)
    {
        twgl.m4.rotateZ(this.transform.rotation, radian(degree), this.transform.rotation);
    }

    // Remove this sprite from the render object
    destroy()
    {
        this.parentList.removeSprite(this);
        this.parentList = undefined;
        this.nextObject = undefined;
        this.prevObject = undefined;
    }
}

class ObjectList
{
    constructor()
    {
        this.headObject = undefined;
        this.currentObject = undefined;
    }

    // Push a object in the front of the list.
    push(_object)
    {
        _object.parentList = this;
        _object.prevObject = undefined;
        _object.nextObject = this.headObject;

        if(typeof this.headObject !== "undefined")
        {
            this.headObject.prevObject = _object;
        }

        this.headObject = _object;
    }

    remove(_object)
    {
        // TODO: check if the GC works properly so no memory leaks !
        // Because we have not really deleted the object.
        // It should be collected by JavaScript GC cuz no ref to the object.

        // You are deleting objects not belong to this list!
        if(_object.parentList !== this)
        {
            return;
        }

        if(typeof _object.nextObject !== "undefined")
        {
            _object.nextObject.prevObject = _object.prevObject;
        }

        if(typeof _object.prevObject !== "undefined")
        {
            _object.prevObject.nextObject = _object.nextObject;
        }
        else
        // You are deleting the head node of this list (cuz it does not have prev and it is in this list)
        {
            this.headObject = this.headObject.nextObject;
        }
    }
}

//
// ─── SCENE ──────────────────────────────────────────────────────────────────────
//
// Scene class holding all gameObjects in current scene.
class Scene
{
    constructor({
        game = undefined,
    } = {})
    {
        this.objectList = new Set();
        this.game = game;
        this.collisionLists = {};
    }

    push(gameObject)
    {
        gameObject.scene = this;
        this.objectList.add(gameObject);
    }

    remove(gameObject)
    {
        this.objectList.delete(gameObject);
    }

    update(time, deltaTime)
    {
        for(var obj of this.objectList)
        {
            if(typeof obj.collider !== "undefined" && typeof obj.collider.parentList === "undefined")
            {
                if(typeof this.collisionLists[obj.collider.label] === "undefined")
                {
                    this.collisionLists[obj.collider.label] = new ObjectList();
                }

                this.collisionLists[obj.collider.label].push(obj.collider);
            }

            obj.updateBase(time, deltaTime);
            obj.update(time, deltaTime);

            // Collision detection
            // TODO: Only "unlabeled" list now
            if(typeof this.collisionLists.unlabeled !== "undefined")
            {
                for(var objA = this.collisionLists.unlabeled.headObject; typeof objA !== "undefined"; objA = objA.nextObject)
                {
                    for(var objB = objA.nextObject; typeof objB !== "undefined"; objB = objB.nextObject)
                    {
                        if(objA.hitTest(objB) === true)
                        {
                            objA.parent.collides(objB.parent);
                            objB.parent.collides(objA.parent);
                        }
                    }
                }
            }
        }
    }
}

class Renderer
{
    constructor()
    {
        this.renderQueue = [];
        this.uniforms = 
        {
            // Translate the matrix with [0, 0, 10] will place the ortho camera at (0, 0, -10).
            // Default screen coord: 18 x 32 @ 32ppm / 1024 x 576, (-9, 9), (-16, 16).
            // u_viewProj: twgl.m4.translate(twgl.m4.ortho(-9, 9, 16, -16, 1, 100), [0, 0, 0]),
            // u_viewProj: twgl.m4.ortho(-16, 16, 9, -9, 1, -1),
            u_viewProj: twgl.m4.ortho(-16, 16, 9, -9, 1, -1),
            // u_viewProj: twgl.m4.ortho(-32, 32, 18, -18, 1, -1),
            // u_viewProj: twgl.m4.identity(),
        };
    }

    render(gl, time, deltaTime)
    {
        for(var idx = 0; idx < this.renderQueue.length; idx++)
        {
            var renderObjectList = this.renderQueue[idx];
            
            if(typeof renderObjectList !== "undefined")
            {
                // TODO: combine objects sharing same materials
                //       or sharing same shader but different uniforms
                for(var renderObject = renderObjectList.headObject; typeof renderObject !== "undefined"; renderObject = renderObject.nextObject)
                {
                    gl.useProgram(renderObject.material.programInfo.program);
                    twgl.setUniforms(renderObject.material.programInfo, this.uniforms);
                    renderObject.render(gl);
                }
            }
        }
    }

    addObject(renderObject, queue)
    {
        if(typeof this.renderQueue[queue] === "undefined")
        {
            this.renderQueue[queue] = new ObjectList();
        }
        this.renderQueue[queue].push(renderObject);
    }

    removeObject(renderObject, queue)
    {
        if(typeof this.renderQueue[queue] === "undefined")
        {
            return;
        }
        this.renderQueue[queue].remove(renderObject);
    }
}
