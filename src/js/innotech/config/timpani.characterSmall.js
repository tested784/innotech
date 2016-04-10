window.musicbox.config.timpani.characterSmall = {

    position: { 
        x: 1400, 
        y: 1000, 
    }, 
    
    eyes: {
        position: { 
            x: 0, 
            y: -195
        }, 
        scale: 0.79, 
        color: 0x100d11
    }, 

    hitbox: { 
        small: { 
            x: -150, 
            y: -500, 
            width: 650, 
            height: 900
        }
    }, 
    

    face: {
        texture: 'texture/slices_monkey-little-face.png', 
        position: { x: 0, y: -170 }
    }, 

    strikeBoth: {
        sample: 'sample/timpani-triangle.mp3',
        anticipation: 0.25
    }, 

    armLeft: {
        texture: 'texture/slices_timpani-little-arm-left.png', 
        position: { x: 0, y: 0 }, 
        animation: {
            rotation: { file: 'json/timpani-little-arms.json', layer: 'C_guy2 armL-rotation' }
        }
    }, 

    stickLeft: {
        texture: 'texture/slices_timpani-little-stick-left.png', 
        position: { x: -5, y: 12 }, 
        animation: {
            rotation: { file: 'json/timpani-little-arms.json', layer: 'C_guy2 stickL-rotation' }
        }
    }, 

    armRight: {
        texture: 'texture/slices_timpani-little-arm-right.png', 
        position: { x: 58, y: 0 },
        animation: {
            rotation: { file: 'json/timpani-little-arms.json', layer: 'C_guy2 armR-rotation' }
        }
    }, 

    stickRight: {
        texture: 'texture/slices_timpani-little-stick-right.png', 
        position: { x: 15, y: -5 }, 
        animation: {
            rotation: { file: 'json/timpani-little-arms.json', layer: 'C_guy2 chime holder-rotation' }
        }
    }, 

    body: { 
        texture: 'texture/slices_monkey-little-body.png', 
        position: { x: 120, y: 135 }
    }, 

    legs: { 
        texture: 'texture/slices_monkey-little-legs.png', 
        position: { x: 125, y: 120 }
    }

};
