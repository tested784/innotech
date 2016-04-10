window.musicbox.config.conga.sequencer = {

    beats: 12, 
    timeSignature: 6, 
    bpm: 160, 

    samples: [ 
        'assets/sample/conga-cowbell.mp3', 
        'assets/sample/conga-high.mp3', 
        'assets/sample/conga-low.mp3'
    ], 

    symbols: [
        'assets/image/ui_congas1.svg', 
        'assets/image/ui_congas2.svg', 
        'assets/image/ui_congas3.svg'
    ], 

    order: [ 
        'small', 
        'left', 
        'right' 
    ], 

    tracks: [
        [1,0,1,0,1,1,0,1,0,1,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0],// [0,0,0,1,0,0,0,0,1,0,0,1],
        [0,0,0,0,0,0,0,0,0,0,0,0]// [1,0,0,0,0,0,1,1,0,0,1,0]
    ]

};
    
