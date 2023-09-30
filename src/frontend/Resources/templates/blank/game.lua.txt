-- Source code for game.lua

print("Hello from lua!")

-- assets
texture0 = assets.load_texture("/assets/xentu-logo.png")

-- variables
renderer.set_background("#444444")

-- handle the init event
game.on("init", function()
    print("Initialized!")
end)

-- handle the update event
game.on("update", function(dt)
    if keyboard.key_clicked(KB_ESCAPE) then
        game.exit()
    end
end)

-- handle the draw event
game.on("draw", function(dt)
    renderer.clear()
    renderer.begin()
    renderer.draw_texture(texture0, 10, 10, 100, 100)
    renderer.present()
end)