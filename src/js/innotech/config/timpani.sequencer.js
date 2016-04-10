window.musicbox.config.timpani.sequencer = {
    
    beats: 6, 
    timeSignature: 3, 
    bpm: 105, 
    
    samples: [ 
        'assets/sample/timpani-triangle.mp3', 
        'assets/sample/timpani-high.mp3', 
        'assets/sample/timpani-low.mp3'
    ], 
    
    symbols: [
        'assets/image/ui_timpani1.svg', 
        'assets/image/ui_timpani2.svg', 
        'assets/image/ui_timpani3.svg'
    ], 

    order: [ 
        'small', 
        'left', 
        'right' 
    ], 
    
    tracks: [
        [0,0,0,0,0,0], // [1,0,0,0,0,0],
        [0,0,0,0,0,0], // [0,1,1,0,1,1], 
        [1,0,0,0,1,0]
    ]

};