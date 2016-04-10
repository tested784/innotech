window.musicbox.config.kit.sequencer = {

    beats: 8, 
    timeSignature: 4, 
    bpm: 96, 

    samples: [ 
        'assets/sample/kit-hat.mp3', 
        'assets/sample/kit-snare.mp3', 
        'assets/sample/kit-tom.mp3'
    ], 
    symbols: [
        'assets/image/ui_drums1.svg', 
        'assets/image/ui_drums2.svg', 
        'assets/image/ui_drums3.svg'
    ], 

    order: [ 
        'right', 
        'left', 
        'small' 
    ], 
    
    tracks: [
        [0,0,0,0,0,0,0,0], // [1,1,1,1,1,1,1,1],
        [0,0,0,0,0,0,0,0], // [0,0,1,0,0,0,1,0],
        [1,0,0,1,1,0,0,0]
    ]

};
