var playState = {
    create: function() { 
        
        // Create a local variable with 'var player'
        //this.player = game.add.sprite(250, 170, 'player');
        
        this.player = game.add.sprite(game.width/2, game.height/2, 'player');
		this.player.scale.setTo(.05,.05);
        
        /**
         * Manipulating the anchor position of the added player, eventually 
         * we decide on centering it.
         */
        // set the anchor point to the top left of the sprite (default value)
        this.player.anchor.setTo(0.5, 0.5); 
        
        // Tell Phaser that the player will use the Arcade physics engine
        game.physics.arcade.enable(this.player); 
        // Add vertical gravity to the player
        this.player.body.gravity.y = 500;
		
        this.cursor = game.input.keyboard.createCursorKeys();
        
        this.createWorld();
        
        // Display the coin
        this.coin = game.add.sprite(game.world.randomX, game.world.randomY, 'coin');
		this.coin.scale.setTo(.05,.05);

        // Add Arcade physics to the coin
        game.physics.arcade.enable(this.coin);
        // Set the anchor point to its center
        this.coin.anchor.setTo(0.5, 0.5);
        
        // Display the score
        this.scoreLabel = game.add.text(30, 30, 'score: 0',{ font: '18px Arial', fill: '#ffffff' });
        // Initialize the score
        game.global.score = 0;
		
		// Display the time
		this.timer = game.add.text(400, 30, 'time: 120',{ font: '18px Arial', fill: '#ffffff' });
		// Initialize the time
		this.timeLeft = 10;
		
		//Display the deaths
		this.death = game.add.text(400, 300, 'deaths: 0',{ font: '18px Arial', fill: '#ffffff' });
		//Initialize the deaths
		this.deaths = 0;
        
        // Create an enemy group with Arcade physics
        this.enemies = game.add.group();
        this.enemies.enableBody = true;
        // Create 10 enemies in the group with the 'enemy' image
        // Enemies are "dead" by default so they are not visible in the game
        this.enemies.createMultiple(10, 'enemy');
		    
        // Call 'addEnemy' every 2.2 seconds
        game.time.events.loop(2200, this.addEnemy, this);
		game.time.events.loop(1000, this.gameTimer, this);
		//this.enemies.scale.setTo(.05,.05)
    },
    createWorld: function() {
        // Create our group with Arcade physics
        this.walls = game.add.group();
        this.walls.enableBody = true;
        // Create the 10 walls in the group
        game.add.sprite(0, 0, 'wallV', 0, this.walls); // Left
        game.add.sprite(480, 0, 'wallV', 0, this.walls); // Right
        game.add.sprite(0, 0, 'wallH', 0, this.walls); // Top left
        game.add.sprite(300, 0, 'wallH', 0, this.walls); // Top right
        game.add.sprite(0, 320, 'wallH', 0, this.walls); // Bottom left
        game.add.sprite(300, 320, 'wallH', 0, this.walls); // Bottom right
        game.add.sprite(-100, 160, 'wallH', 0, this.walls); // Middle left
        game.add.sprite(400, 160, 'wallH', 0, this.walls); // Middle right
        var middleTop = game.add.sprite(100, 80, 'wallH', 0, this.walls);
        middleTop.scale.setTo(1.5, 1);
        var middleBottom = game.add.sprite(100, 240, 'wallH', 0 , this.walls);
        middleBottom.scale.setTo(1.5, 1);
        // Set all the walls to be immovable
        this.walls.setAll('body.immovable', true);
    },

    update: function() {
        // Tell Phaser that the player and the walls should collide
        game.physics.arcade.collide(this.player, this.walls);
        
        // We have to use 'this.' to call a function from our state
        this.movePlayer();
        
        if (!this.player.inWorld) {
            this.playerDie();
        }
        
        game.physics.arcade.overlap(this.player, this.coin, this.takeCoin,null, this);
        
        // Make the enemies and walls collide
        game.physics.arcade.collide(this.enemies, this.walls);
        // Call the 'playerDie' function when the player and an enemy overlap
        game.physics.arcade.overlap(this.player, this.enemies, this.playerDie, null, this);
    },
    
    movePlayer: function() {
        // If the left arrow key is pressed
        if (this.cursor.left.isDown) {
            // Move the player to the left
            // The velocity is in pixels per second
            this.player.body.velocity.x = -200;
        }
        // If the right arrow key is pressed
        else if (this.cursor.right.isDown) {
            // Move the player to the right
            this.player.body.velocity.x = 200;
        }
        // If neither the right or left arrow key is pressed
        else {
            // Stop the player
            this.player.body.velocity.x = 0;
        }
        // If the up arrow key is pressed and the player is on the ground
        if (this.cursor.up.isDown && this.player.body.touching.down) {
            // Move the player upward (jump)
            this.player.body.velocity.y = -320;
        }
    },
    takeCoin: function(player, coin) {
        // Update the score
        game.global.score += 5;
        this.scoreLabel.text = 'score: ' + game.global.score;
        // Change the coin position
        this.updateCoinPosition();
    },
    updateCoinPosition: function() {
        // Store all the possible coin positions in an array
        var coinPosition = [
        {x: 140, y: 60}, {x: 360, y: 60}, // Top row
        {x: 60, y: 140}, {x: 440, y: 140}, // Middle row
        {x: 130, y: 300}, {x: 370, y: 300} // Bottom row
        ];
        // Remove the current coin position from the array
        // Otherwise the coin could appear at the same spot twice in a row
        for (var i = 0; i < coinPosition.length; i++) {
        if (coinPosition[i].x == this.coin.x) {
        coinPosition.splice(i, 1);
        }
        }
        // Randomly select a position from the array with 'game.rnd.pick'
        var newPosition = game.rnd.pick(coinPosition);
        // Set the new position of the coin
        this.coin.reset(newPosition.x, newPosition.y);
    },
    playerDie: function() {
        //game.state.start('main');
		this.player.reset(game.world.randomX, game.world.randomY)
		this.deaths += 1;
		this.death.text = 'deaths: ' + this.deaths;
    },
    addEnemy: function() {
        // Get the first dead enemy of the group
        var enemy = this.enemies.getFirstDead();
        // If there isn't any dead enemy, do nothing
        if (!enemy) {
        return;
        }
        // Initialize the enemy
        enemy.anchor.setTo(0.5, 1);
        enemy.reset(game.width/2, 0);
        enemy.body.gravity.y = 500;
        enemy.body.velocity.x = 100 * game.rnd.pick([-1, 1]);
        enemy.body.bounce.x = 1;
        enemy.checkWorldBounds = true;
        enemy.outOfBoundsKill = true;
    },
	gameTimer: function() {
		this.timeLeft -= 1;
		this.timer.text = 'time: ' + this.timeLeft;
		if(this.timeLeft == -1)
			game.state.start('menu')
	}
};