<?php

$images = [
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_bass-drum.png",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_congas.png",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_drum-kit.png",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_eyes.png",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_timpanis.png",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_woodblocks.png",
];

$avatars = [
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_bird",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_conga",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_drum",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_monkey",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_monster",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_robot",
    "https://rythm-dot-gweb-musiclab-site.appspot.com/assets/texture/slices_timpani",
];

foreach ($avatars as $avatar){
    //little
    array_push($images, $avatar . "-big-body.png");
    array_push($images, $avatar . "-big-face.png");
    array_push($images, $avatar . "-big-legs.png");
    array_push($images, $avatar . "-big-arm-left.png");
    array_push($images, $avatar . "-big-arm-right.png");
    array_push($images, $avatar . "-big-stick-left.png");
    array_push($images, $avatar . "-big-stick-right.png");

    //big
    array_push($images, $avatar . "-little-body.png");
    array_push($images, $avatar . "-little-face.png");
    array_push($images, $avatar . "-little-legs.png");
    array_push($images, $avatar . "-little-arm-left.png");
    array_push($images, $avatar . "-little-arm-right.png");
    array_push($images, $avatar . "-little-stick-left.png");
    array_push($images, $avatar . "-little-stick-right.png");
};

foreach ($images as $image){
    copy($image, __DIR__ . "asset_import.php/" . array_pop(explode('texture/', $image)));
}