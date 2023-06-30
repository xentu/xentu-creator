// Source code for game.js

print("Hello from javascript!");

// assets
texture0 = assets.load_texture("/assets/xentu-logo.png");

// variables
renderer.set_background("#444444");

// handle the init event
game.on("init", function() {
    print("Initialized!");
});

// handle the update event
game.on("update", function(dt) {
   if (keyboard.key_clicked(KB_ESCAPE)) {
		game.exit();
	}
})

// handle the draw event
game.on("draw", function(dt) {
    renderer.clear();
    renderer.begin();
    renderer.draw_texture(texture0, 10, 10, 100, 100);
    renderer.present();
})