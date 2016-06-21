var SpaceHipster = SpaceHipster || {};

//title screen
SpaceHipster.Game = function(){};

SpaceHipster.Game.prototype = {
  create: function() {
  	//set world dimensions
    this.game.world.setBounds(0, 0, 1920, 1920);

    //background
    this.background = this.game.add.tileSprite(0, 0, this.game.world.width, this.game.world.height, 'space');

    //create player
    this.player = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, 'playership');
    this.player.scale.setTo(2);
	this.player.anchor.setTo(0.5, 0.5);
    this.player.animations.add('fly', [0, 1, 2, 3], 5, true);
    this.player.animations.play('fly');

    //player initial score of zero
    this.playerScore = 0;

    //enable player physics
    this.game.physics.arcade.enable(this.player);
	this.player.body.drag.set(100);
    this.playerSpeed = 120;
    this.player.body.collideWorldBounds = true;
	
	//create bullet
	this.bullets = this.game.add.group();
	this.bullets.enableBody = true;
	this.bullets.physicsBodyType = Phaser.Physics.ARCADE;
	this.bullets.createMultiple(10, 'bullet');
	this.bullets.setAll('checkWorldBounds', true);
	this.bullets.setAll('outOfBoundsKill', true);

    //the camera will follow the player in the world
    this.game.camera.follow(this.player);

    //generate game elements
    this.generateCollectables();
    this.generateAsteriods();

    //show score
    this.showLabels();
	
	//controls
	this.cursors = this.game.input.keyboard.createCursorKeys();
	this.shootKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
	//call shoot bullet function
	this.shootKey.onDown.add(this.shootBullet, this);

    //sounds
    this.explosionSound = this.game.add.audio('explosion');
    console.log(this.explosionSound);
    this.collectSound = this.game.add.audio('collect');
  },
  update: function() {
	  if (this.cursors.left.isDown) {
		  this.player.body.angularVelocity = -200;
	  }
	  else if (this.cursors.right.isDown) {
		  this.player.body.angularVelocity = 200;
	  }
	  else {
		  this.player.body.angularVelocity = 0;
	  }
	  
	  if (this.cursors.up.isDown) {
		  this.game.physics.arcade.accelerationFromRotation(this.player.rotation, 200, this.player.body.acceleration);
	  }
	  else {
		  this.player.body.acceleration.set(0);
	  }

    //collision between player and asteroids
    this.game.physics.arcade.collide(this.player, this.asteroids, this.hitAsteroid, null, this);
	
	//Bullet collision with asteroid
	this.game.physics.arcade.collide(this.bullets, this.asteroids, this.destroyAsteroid, null, this);

    //overlapping between player and collectables
    this.game.physics.arcade.overlap(this.player, this.collectables, this.collect, null, this);
  },
  generateCollectables: function() {
    this.collectables = this.game.add.group();

    //enable physics in them
    this.collectables.enableBody = true;
    this.collectables.physicsBodyType = Phaser.Physics.ARCADE;

    //phaser's random number generator
    var numCollectables = this.game.rnd.integerInRange(100, 150)
    var collectable;

    for (var i = 0; i < numCollectables; i++) {
      //add sprite
      collectable = this.collectables.create(this.game.world.randomX, this.game.world.randomY, 'power');
      collectable.animations.add('fly', [0, 1, 2, 3], 5, true);
      collectable.animations.play('fly');
    }

  },
  //Based on addEnemy function from other game
  shootBullet: function() {
	  var bullet = this.bullets.getFirstDead();
	  if (!bullet) {
		  return;
	  }
	  // Initialize the bullet
	  bullet.anchor.setTo(0.5, 1);
	  bullet.reset(this.player.x, this.player.y);
	  bullet.rotation = this.player.rotation + 50.2;
	  this.game.physics.arcade.velocityFromRotation(this.player.rotation, 400, bullet.body.velocity);
	  bullet.checkWorldBounds = true;
	  bullet.outOfBoundsKill = true;
	  
  },
  generateAsteriods: function() {
    this.asteroids = this.game.add.group();
    
    //enable physics in them
    this.asteroids.enableBody = true;

    //phaser's random number generator
    var numAsteroids = this.game.rnd.integerInRange(150, 200)
    var asteriod;

    for (var i = 0; i < numAsteroids; i++) {
      //add sprite
      asteriod = this.asteroids.create(this.game.world.randomX, this.game.world.randomY, 'rock');
      asteriod.scale.setTo(this.game.rnd.integerInRange(10, 40)/10);

      //physics properties
      asteriod.body.velocity.x = this.game.rnd.integerInRange(-20, 20);
      asteriod.body.velocity.y = this.game.rnd.integerInRange(-20, 20);
      asteriod.body.immovable = true;
      asteriod.body.collideWorldBounds = true;
    }
  },
  hitAsteroid: function(player, asteroid) {
    //play explosion sound
    this.explosionSound.play();

    //make the player explode
    var emitter = this.game.add.emitter(this.player.x, this.player.y, 100);
    emitter.makeParticles('playerParticle');
    emitter.minParticleSpeed.setTo(-200, -200);
    emitter.maxParticleSpeed.setTo(200, 200);
    emitter.gravity = 0;
    emitter.start(true, 1000, null, 100);
    this.player.kill();

    this.game.time.events.add(800, this.gameOver, this);
  },
  destroyAsteroid: function(bullet, asteroid) {
	  //asteroid explosion
	  this.explosionSound.play();
	  var emitter = this.game.add.emitter(asteroid.x, asteroid.y, 100);
      emitter.makeParticles('playerParticle');
      emitter.minParticleSpeed.setTo(-200, -200);
      emitter.maxParticleSpeed.setTo(200, 200);
      emitter.gravity = 0;
	  emitter.start(true, 1000, null, 100);
	  asteroid.kill();
	  bullet.kill();
  },
  gameOver: function() {    
    //pass it the score as a parameter 
    this.game.state.start('MainMenu', true, false, this.playerScore);
  },
  collect: function(player, collectable) {
    //play collect sound
    this.collectSound.play();

    //update score
    this.playerScore++;
    this.scoreLabel.text = this.playerScore;

    //remove sprite
    collectable.destroy();
  },
  showLabels: function() {
    //score text
    var text = "0";
    var style = { font: "20px Arial", fill: "#fff", align: "center" };
    this.scoreLabel = this.game.add.text(this.game.width-50, this.game.height - 50, text, style);
    this.scoreLabel.fixedToCamera = true;
  }
};

/*
TODO

-audio
-asteriod bounch
*/
