# Source code for game.py

print("Hello from python!")

# assets
texture0 = assets.load_texture("/assets/xentu-logo.png")

# variables
renderer.set_background("#444444")

# handle the init event
def init():
    print("Initialized!")

# handle the update event
def update(dt):
    if keyboard.key_clicked(KB_ESCAPE):
        game.exit()

# handle the draw event
def draw(dt):
    renderer.clear()
    renderer.begin()
    renderer.draw_texture(texture0, 10, 10, 100, 100)
    renderer.present()