window.musicbox.config.conga.characterSmall = {

    position: { 
        x: 1300, 
        y: 920, 
    }, 

    eyes: { 
        position: { 
            x: 0, 
            y: -105
        }, 
        scale: 0.79
    }, 

    hitbox: { 
        small: { 
            x: -70, 
            y: -500, 
            width: 500, 
            height: 900
        }
    }, 
    
    strikeBoth: {
        anticipation: 0.15
    }, 

    armLeft: {
        texture: 'texture/slices_conga-little-arm-left.png', 
        position: { x: 0, y: 0 }, 
        animation: {
            rotation: { file: 'json/conga-little-arms.json', layer: 'C_guy2 armL-rotation' }
        }
    }, 

    stickLeft: {
        texture: 'texture/slices_conga-little-stick-left.png', 
        position: { x: -16, y: 10 }, 
        behindArms: true, 
        animation: {
            rotation: { file: 'json/conga-little-arms.json', layer: 'C_guy2 stickL-rotation' }
        }
    }, 

    armRight: {
        texture: 'texture/slices_conga-little-arm-right.png', 
        position: { x: 85, y: 0 },
        back: true, 
        animation: {
            rotation: { file: 'json/conga-little-arms.json', layer: 'C_guy2 armR-rotation' }
        }
    }, 

    face: {
        texture: 'texture/slices_bird-little-face.png', 
        position: { x: -0, y: -80 }
    }, 
    
    body: { 
        texture: 'texture/slices_bird-little-body.png', 
        position: { x: 160, y: 200 }
    }, 

    legs: { 
        texture: 'texture/slices_bird-little-legs.png', 
        position: { x: 160, y: 200 }
    }

};
