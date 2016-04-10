window.musicbox.config.woodblock.characterBig = {

    position: { 
        x: 560, 
        y: 810, 
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
            width: 470, 
            height: 1200
        }
    }, 

    strikeLeft: { 
        sample: 'sample/timpani-low.mp3', 
        anticipation: 0.15
    }, 

    strikeRight: { 
        sample: 'sample/timpani-high.mp3', 
        anticipation: 0.3
    }, 

    eyes: { 
        position: { x: -5, y: -260 }, 
        scale: 1.1
    }, 

    armLeft: {
        texture: 'texture/slices_robot-big-arm-left.png', 
        position: { x: -3, y: 1 }, 
        animation: {
            rotation: { file: 'json/robot-big-arm-left.json', layer: 'guy1 armL-rotation' }
        }
    }, 

    stickLeft: {
        texture: 'texture/slices_robot-big-stick-left.png', 
        position: { x: -30, y: 24 }, 
        animation: {
            rotation: { file: 'json/robot-big-arm-left.json', layer: 'guy1 malletL-rotation' }
        }
    }, 

    armRight: {
        texture: 'texture/slices_robot-big-arm-right.png', 
        position: { x: 105, y: 1 }, 
        animation: {
            rotation: { file: 'json/robot-big-arm-right.json', layer: 'guy1 armR-rotation' }, 
        }
    }, 

    stickRight: {
        texture: 'texture/slices_robot-big-stick-right.png', 
        position: { x: 25, y: 26 }, 
        animation: {
            rotation: { file: 'json/robot-big-arm-right.json', layer: 'guy1 malletR-rotation' }
        }
    }, 

    face: {
        texture: 'texture/slices_robot-big-face.png', 
        position: { x: -10, y: -265 }
    }, 

    body: { 
        texture: 'texture/slices_robot-big-body.png', 
        position: { x: 220, y: 260 }
    }, 

    front: { 
        texture: 'texture/slices_woodblocks.png', 
        position: { x: 210, y: 460 }
    }, 

    legs: { 
        texture: 'texture/slices_robot-big-legs.png', 
        position: { x: 210, y: 210 }
    }

};
