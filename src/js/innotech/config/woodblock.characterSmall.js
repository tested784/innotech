window.musicbox.config.woodblock.characterSmall = {

    position: { 
        x: 1340, 
        y: 1050, 
    }, 

    strikeBoth: {
        anticipation: 0.25
    }, 

    hitbox: { 
        small: { 
            x: -110, 
            y: -500, 
            width: 530, 
            height: 800
        }
    }, 

    armLeft: {
        texture: 'texture/slices_robot-little-arm-left.png', 
        position: { x: 1, y: 1 }, 
        animation: {
            rotation: { file: 'json/robot-little-arms.json', layer: 'guy2 armL-rotation' }
        }
    }, 

    stickLeft: {
        texture: 'texture/slices_robot-little-stick-left.png', 
        position: { x: 10, y: 8 }, 
        behindArms: true, 
        animation: {
            rotation: { file: 'json/robot-little-arms.json', layer: 'guy2 stickL-rotation' }
        }
    }, 

    armRight: {
        texture: 'texture/slices_robot-little-arm-right.png', 
        position: { x: 55, y: 0 },
        animation: {
            rotation: { file: 'json/robot-little-arms.json', layer: 'guy2 armR-rotation' }
        }
    }, 

    stickRight: {
        texture: 'texture/slices_robot-little-stick-right.png', 
        position: { x: -9, y: 15 }, 
        behindArms: true, 
        animation: {
            rotation: { file: 'json/robot-little-arms.json', layer: 'guy2 stickR-rotation' }
        }
    }, 

    body: { 
        texture: 'texture/slices_robot-little-body.png', 
        position: { x: 120, y: 135 }
    }, 

    legs: { 
        texture: 'texture/slices_robot-little-legs.png', 
        position: { x: 120, y: 118 }
    }, 

    face: {
        texture: 'texture/slices_robot-little-face.png', 
        position: { x: -5, y: -200 }
    }, 

    eyes: { 
        position: { x: 0, y: -200 }, 
        scale: 0.79
    }

};
