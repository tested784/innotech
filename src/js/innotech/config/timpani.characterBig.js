window.musicbox.config.timpani.characterBig = {

    position: { 
        x: 550, 
        y: 790, 
    }, 

    hitbox: { 
        left: { 
            x: -300, 
            y: -600, 
            width: 500, 
            height: 1200
        }, 
        right: { 
            x: 200, 
            y: -600, 
            width: 500, 
            height: 1200
        }
    }, 

    face: {
        texture: 'texture/slices_monkey-big-face.png', 
        position: { x: 12, y: -230 }
    }, 

    strikeLeft: { 
        anticipation: 0.15
    }, 

    strikeRight: { 
        anticipation: 0.3
    }, 

    eyes: { 
        position: { 
            x: 15, 
            y: -255
        }, 
        color: 0x100d11
    }, 

    armLeft: {
        texture: 'texture/slices_timpani-big-arm-left.png', 
        position: { x: 0, y: 0 }, 
        animation: {
            rotation: { file: 'json/timpani-big-arm-left.json', layer: 'C_guy1 armL-rotation' }
        }
    }, 

    stickLeft: {
        texture: 'texture/slices_timpani-big-stick-left.png', 
        position: { x: -25, y: -12 }, 
        animation: {
            rotation: { file: 'json/timpani-big-arm-left.json', layer: 'C_guy1 malletL-rotation' }
        }
    }, 

    armRight: {
        texture: 'texture/slices_timpani-big-arm-right.png', 
        position: { x: 110, y: 0 }, 
        animation: {
            rotation: { file: 'json/timpani-big-arm-right.json', layer: 'C_guy1 armR-rotation' }, 
            position: { file: 'json/timpani-big-arm-right.json', layer: 'C_guy1 armR-position' }
        }
    }, 

    stickRight: {
        texture: 'texture/slices_timpani-big-stick-right.png', 
        position: { x: -15, y: 17 }, 
        animation: {
            rotation: { file: 'json/timpani-big-arm-right.json', layer: 'C_guy1 malletR-rotation' }
        }
    }, 

    body: { 
        texture: 'texture/slices_monkey-big-body.png', 
        position: { x: 220, y: 260 }
    }, 

    front: { 
        texture: 'texture/slices_timpanis.png', 
        position: { x: 220, y: 550 }, 
        behindArms: true
    }, 

    legs: { 
        texture: 'texture/slices_monkey-big-legs.png', 
        position: { x: 220, y: 240 }
    }


};
