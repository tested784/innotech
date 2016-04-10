window.musicbox.config.kit.characterSmall = {

    position: { 
        x: 1200, 
        y: 920, 
    }, 

    eyes: { 
        position: { 
            x: 4, 
            y: -135
        }, 
        scale: 0.79
    }, 


    hitbox: { 
        small: { 
            x: -100, 
            y: -500, 
            width: 650, 
            height: 900
        }
    }, 
    
    strikeBoth: {
        anticipation: 0.15
    }, 

    armLeft: {
        texture: 'texture/slices_drum-little-arm-left.png', 
        position: { x: 0, y: 0 }, 
        animation: {
            rotation: {
                file: 'json/drum-little-arms.json', 
                layer: 'C_guy2 armL-rotation'
            }
        }
    }, 

    stickRight: {
        texture: 'texture/slices_drum-little-stick-right.png', 
        position: { x: 13, y: -11 }, 
        animation: {
            rotation: {
                file: 'json/drum-little-arms.json', 
                layer: 'C_guy2 mallet-rotation'
            }
        }
    }, 

    armRight: {
        texture: 'texture/slices_drum-little-arm-right.png', 
        position: { x: 75, y: 0 },
        animation: {
            rotation: {
                file: 'json/drum-little-arms.json', 
                layer: 'C_guy2 armR-rotation'
            }
        }
    }, 

    body: { 
        texture: 'texture/slices_monster-little-body.png', 
        position: { x: 150, y: 180 }
    }, 

    front: { 
        texture: 'texture/slices_bass-drum.png', 
        position: { x: 150, y: 350 }
    }, 

    legs: { 
        texture: 'texture/slices_monster-little-legs.png', 
        position: { x: 150, y: 170 }
    }

}
