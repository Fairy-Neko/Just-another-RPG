//I don't know how to do OOP in JS...lol

//Hitboxes:
//OOB
//Circle

//


//Sprite sheet animation, ctor.
function AnimatedSprite(spriteSource, rows, cols, animationList, startState)
{
    //Check if cols is an array or not.
    //If not, boardcast it into an array, with same columns on each row.
    if (typeof cols == 'number')
    {
        _cols = cols;
        cols = [];

        for (i = 0; i < rows; i++)
        {
            cols[i] = _cols;
        }
    }
    else if (typeof cols == 'object')
    {
        for (i = 0; i < rows; i++)
        {
            if (typeof cols[i] !== 'number')
            {
                Console.log("Error with in ctor of AnimatedSprite: param cols is not an array of numbers!")
                return false;
            }
        }
    }
    else
    {
        Console.log("Error with in ctor of AnimatedSprite: param cols is neither an array nor a number!")
        return false;
    }

    //Create a defult animation List that contains all of the spritesheet.
    animationList = (typeof animationList !== 'undefined') ? animationList : {default : [0, rows]}

    if(typeof startState == 'undefined')
    {
        for(var _stateKey in animationList)
        {
            startState = _stateKey;
        }
    }

    this.m_rowTotal = rows;
    this.m_colTotal = cols;
    this.m_animList = animationList;

    this.m_state = {animName : animationList[0]}
}

AnimatedSprite.prototype =
{
    constructor: AnimatedSprite,

}
