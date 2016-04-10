window.musicbox.config.conga.characterBig = {

    position: { 
        x: 600, 
        y: 750, 
    }, 

    strikeLeft: {
        anticipation: 0.15
    }, 

    eyes: { 
        position: { 
            x: 0, 
            y: -215
        }
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
            width: 430, 
            height: 1200
        }
    }, 

    strikeRight: {
        anticipation: 0.15
    }, 

    armLeft: {
        texture: 'texture/slices_conga-big-arm-left.png', 
        position: { x: -30, y: -3 }, 
        animation: {
            rotation: { 
                file: 'json/conga-big-arm-left.json', 
                layer: 'C_guy1 armL-rotation' 
            }
        }
    }, 

    armRight: {
        texture: 'texture/slices_conga-big-arm-right.png', 
        position: { x: 120, y: -3 }, 
        animation: {
            rotation: { 
                file: 'json/conga-big-arm-right.json', 
                layer: 'C_guy1 armR-rotation'
            }
        }
    }, 

    body: { 
        texture: 'texture/slices_bird-big-body.png', 
        position: { x: 175, y: 330 }
    }, 

    face: {
        texture: 'texture/slices_bird-big-face.png', 
        position: { x: -5, y: -180 }
    }, 
    
    front: { 
        texture: 'texture/slices_congas.png', 
        position: { x: 180, y: 520 }
    }, 

    legs: { 
        texture: 'texture/slices_bird-big-legs.png', 
        position: { x: 180, y: 300 }
    }

};
