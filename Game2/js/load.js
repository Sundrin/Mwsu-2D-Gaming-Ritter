var loadState = {

    preload: function () {
        var loadingLabel = game.add.text(game.width/2, 150, 'loading...', { font: '30px Arial', fill: '#ffffff' });
        loadingLabel.anchor.setTo(0.5, 0.5);

        var progressBar = game.add.sprite(game.width/2, 200, 'progressBar');
        progressBar.anchor.setTo(0.5, 0.5);
        game.load.setPreloadSprite(progressBar);
    
		//Sound when player jumps
		game.load.audio('jump', ['assets/jump.ogg', 'assets/jump.mp3']);
		//Sound when player takes coin
		game.load.audio('coin', ['assets/coin.ogg', 'assets/coin.mp3']);
		//Sound when player dies
		game.load.audio('dead', ['assets/dead.ogg', 'assets/dead.mp3']);
        game.load.image('player', 'assets/DragonbornPlayer.png');
        game.load.image('enemy', 'assets/enemy.png');
        game.load.image('coin', 'assets/DragonbornEmblem.png');
        game.load.image('wallV', 'assets/wallVertical.png');
        game.load.image('wallH', 'assets/wallHorizontal.png');
        game.load.image('background', 'assets/background.png'); 
    },

    create: function() {
        game.state.start('menu');
    }
};