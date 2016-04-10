window.musicbox.config.kit.characterBig = {

   

    strikeLeft: { 
        anticipation: 0.25
    }, 

    strikeRight: { 
        anticipation: 0.25
    }, 

    armLeft: {
        texture: 'texture/slices_drum-big-arm-left.png', 
        position: { x: 0, y: 0 }, 
        animation: {
            rotation: {
                file: 'json/drum-big-arms.json', 
                layer: 'C_guy1 armL-rotation'
            }
        }
    }, 

    stickLeft: {
        texture: 'texture/slices_drum-big-stick-left.png', 
        position: { x: -40, y: -12 }, 
        behindArms: true, 
        animation: {
            rotation: {
                file: 'json/drum-big-arms.json', 
                layer: 'C_guy1 stickL-rotation'
            }
        }
    }, 

    armRight: {
        texture: 'texture/slices_drum-big-arm-right.png', 
        position: { x: 120, y: 0 }, 
        animation: {
            rotation: {
                file: 'json/drum-big-arms.json', 
                layer: 'C_guy1 armR-rotation'
            }
        }
    }, 

    stickRight: {
        texture: 'texture/slices_drum-big-stick-right.png', 
        position: { x: 29, y: 29 }, 
        behindArms: true, 
        animation: {
            rotation: {
                file: 'json/drum-big-arms.json', 
                layer: 'C_guy1 stickR-rotation'
            }
        }
    }, 

    position: { 
        x: 450, 
        y: 740, 
    }, 

    hitbox: { 
        left: { 
            x: 300, 
            y: -600, 
            width: 350, 
            height: 1200
        }, 
        right: { 
            x: -200, 
            y: -600, 
            width: 500, 
            height: 1200
        }
    }, 

    eyes: { 
        position: { 
            x: -10, 
            y: -250
        }
    }, 
    
    body: { 
        texture: 'texture/slices_monster-big-body.png', 
        position: { x: 280, y: 300 }
    }, 

    front: { 
        texture: 'texture/slices_drum-kit.png', 
        position: { x: 220, y: 500 }, 
        behindArms: true
    }, 

    legs: { 
        texture: 'texture/slices_monster-big-legs.png', 
        position: { x: 280, y: 230 }
    }

}