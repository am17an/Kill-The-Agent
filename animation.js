var canvas = document.createElement("canvas");
var ctx    = canvas.getContext('2d');
canvas.width = 512;
canvas.height = 480;
document.body.appendChild(canvas);

var agentsKilled = 0;


var sprite = function(options) {
  var that = {};

  that.frameIndex = 0;
  that.tickCount  = 0;
  that.ticksPerFrame = 5;
  that.numberOfFrames = options.numberOfFrames;
  that.direction = 1;
  that.active = options.active;

  that.context = options.context; 
  that.width   = options.width;
  that.height  = options.height;
  that.image   = options.image;
  that.x       = options.x;
  that.y       = options.y;
  that.speed   = options.speed;

  that.render = function() {

    that.context.drawImage(
      that.image,
      that.frameIndex * that.width/ that.numberOfFrames,
      that.height*that.direction,
      that.width/that.numberOfFrames,
      that.height,
      that.x,
      that.y,
      that.width/that.numberOfFrames,
      that.height
    );
  }

  return that;
}

var keysDown = {};
var activeBulletPool = [];
var n_bullets  = 10;

var Bullet = function(options) {
  this.sprite = sprite(options);
  this.active = options.active;
}

Bullet.prototype.render = function(){
  this.sprite.render();
}

Bullet.prototype.update = function() {
  var directions = [[0,-1], [-1,0], [0, 1], [1,0]];

  this.sprite.x = this.sprite.x + directions[this.sprite.bulletDirection][0]*this.sprite.speed;
  this.sprite.y = this.sprite.y + directions[this.sprite.bulletDirection][1]*this.sprite.speed;

  var x = this.sprite.x;
  var y = this.sprite.y;


  if(x + 16 >= canvas.width || (x - 16 < 0) || (y + 16 >= canvas.height) || (y - 16 < 0)) {
    this.active = false;
  }
}
Bullet.prototype.render = function() {

  var that = this.sprite;
    that.context.drawImage(
    that.image,
    that.direction * that.width/ that.numberOfFrames,
    0,
    that.width/that.numberOfFrames,
    that.height,
    that.x,
    that.y,
    that.width/that.numberOfFrames,
    that.height
  );


}


function drawActiveBullets() {
  if(activeBulletPool.length === 0) {
    return;
  }
  for(var i = 0 ; i < activeBulletPool.length; ++i) {
    if(activeBulletPool[i].active) {
      activeBulletPool[i].update();
      activeBulletPool[i].render();
    }
  }
  removeInactive();
}

function removeInactive() {
  activeBulletPool = _.reject(activeBulletPool, function(e){
    return !e.active;
  })
}



function requestBullet(x, y, direction) {
  var bullet = new Bullet({
    width: 60,
    height: 20,
    numberOfFrames: 3,
    image: bulletImage,
    active: true,
    context: ctx,
    speed: 5
  });
  bullet.sprite.x = x + 10;
  bullet.sprite.y = y + 10;
  bullet.sprite.bulletDirection = direction;
  bullet.sprite.direction = direction;
  activeBulletPool.push(bullet);
}

addEventListener("keydown", function(ev){
  keysDown[ev.keyCode] = true;
}, false);

addEventListener("keyup", function(ev){
  delete keysDown[ev.keyCode];
}, false);



var professor = sprite({
  context: ctx,
  width: 576,
  height: 65,
  image: profImage,
  numberOfFrames: 9,
  x: canvas.width/2,
  y: canvas.height/2,
  speed: 5
});

professor.update = function(modifier) {
  var that = professor;
  var modifier = modifier || 1;
  if(!professor.dying) {
    var newDirection = 0;
    var moved = false;
    if (38 in keysDown) { // Player holding up
      that.y -= that.speed * modifier;
      newDirection = 0;
      moved = true;
    }
    if (40 in keysDown) { // Player holding down
      that.y += that.speed * modifier;
      newDirection = 2;
      moved = true;
    }
    if (37 in keysDown) { // Player holding left
      that.x -= that.speed * modifier;
      newDirection = 1;
      moved = true;
    }
    if (39 in keysDown) { // Player holding right
      that.x += that.speed * modifier;
      newDirection = 3;
      moved = true;
    }

    if(newDirection != that.direction) {
      that.frameIndex = 0;
    } else {
      if(that.frameIndex < that.numberOfFrames - 1 && moved) {
        that.frameIndex += 1;
      } else {
        that.frameIndex = 0;
      }
    }
    if(moved){
      that.direction = newDirection;
    }
  } else {
    if(that.tickCount > that.ticksPerFrame) {
      that.tickCount = 0;
      if(that.frameIndex < that.numberOfFrames - 1) {
        that.frameIndex += 1;
      } else {
        resetToWalk(that, profImage);
        that.direction = 0;
        that.dying = false;
      }
    } else {
      that.tickCount ++;
    }
  }
}




var fbiImage = new Image();
fbiImage.src = 'assets/FBI_walk_cycle.png';
fbi = sprite ( {
  context: ctx,
  width: 576,
  height: 65,
  image: fbiImage,
  numberOfFrames: 9,
  x: Math.floor(Math.random() * canvas.width) +50,
  y: Math.floor(Math.random() * canvas.height) + 50,
  speed: 3
});


// sprites
var lastTick = 0;
fbi.dying = false;
fbi.shooting = false;
fbi.lastShoot = 0;
fbi.update = function() {
  var that = fbi;

  var directions = [[0,-1], [-1,0], [0, 1], [1,0]];

  if(!that.dying && !that.shooting) {
    var newDirection = that.direction;

    if(lastTick > 40) {
      lastTick = 0;
      newDirection = Math.floor(Math.random()*4);
    } else {
      lastTick ++;
    }

    if(newDirection != that.direction) {
      that.frameIndex = 0;
    } 
    else {
      if(that.frameIndex < that.numberOfFrames - 1) {
        that.frameIndex += 1;
      } else {
        that.frameIndex = 0;
      }
    }
    that.direction = newDirection;

    that.x = that.x + directions[that.direction][0]*that.speed;
    that.y = that.y + directions[that.direction][1]*that.speed;

    // Bounds
    if(that.x + 50 >=canvas.width) {
      that.direction = 1;
    } else if (that.x -50 <= 0) {
      that.direction = 3;
    } else if(that.y + 50 >= canvas.height) {
      that.direction = 0;
    } else if(that.y - 50 <=0) {
      that.direction = 2;
    }

    // 0 means left  
    // 1 top
    // 2 back
    var pictureMapping = [];
    pictureMapping[0] = 2;
    pictureMapping[1] = 0;
    pictureMapping[2] = 1;

    if(that.direction <= 2 && that.lastShoot > 50) {
      that.lastShoot = 0;
      that.image = fbiShooting;
      that.shooting = true;
      that.numberOfFrames = 2;
      that.frameIndex = 0;
      that.width = 144;
      requestBullet(that.x, that.y, that.direction);
      that.direction = pictureMapping[that.direction];
      that.tickCount = 0;
    } else {
      that.lastShoot ++;
    }

  } else if(that.dying){
    if(that.tickCount > that.ticksPerFrame) {
      that.tickCount = 0;
      if(that.frameIndex < that.numberOfFrames - 1) {
        that.frameIndex += 1; 
      } else {
        that.dying = false;
        that.x = Math.floor(Math.random() * canvas.width) +50;
        that.y = Math.floor(Math.random() * canvas.height) +50;
        resetToWalk(that, fbiImage);
      }
    } else {
      that.tickCount ++;
    }
  } else if(that.shooting) {
    if(that.tickCount > that.ticksPerFrame) {
      that.tickCount = 0;
      if(that.frameIndex < that.numberOfFrames - 1) {
        that.frameIndex += 1;
      } else {
        that.shooting = false;
        resetToWalk(that, fbiImage);
      }
    } else {
      that.tickCount ++;
    }
  }
}

function resetToWalk(that, image) {
  that.numberOfFrames = 9;
  that.image = image;
  that.width = 576;
}


// Images 

var numImages = 7;
var imagesLoaded = 0;

backgroundImage = new Image();
backgroundImage.src = 'assets/background.png';
backgroundImage.onload = function() {
  imagesLoaded++;
  start();
}

fbiDying = new Image();
fbiDying.src = 'assets/FBI_hurt.png';
fbiDying.onload = function() {
  imagesLoaded++;
  start();
}

professorDying = new Image();
professorDying.src= 'assets/professor_hurt_no_hat.png';
professorDying.onload = function() {
  imagesLoaded++;
  start();
}

bulletImage = new Image();
bulletImage.src = 'assets/bullet.png';
bulletImage.onload = function() {
  imagesLoaded ++;
  start();
}

fbiShooting = new Image();
fbiShooting.src = 'assets/fbi_shoot.png';
fbiShooting.onload = function() {
  imagesLoaded ++;
  start();
}

var profImage = new Image();
profImage.src = 'assets/professor.png';
profImage.onload = function(){
  imagesLoaded++;
  start();
}

fbiImage.onload = function() {
  imagesLoaded++;
  start();
}


function start() {
  if(imagesLoaded === numImages) {
    professor.render();
    fbi.render();
    gameLoop();
  }
}


function checkCollisions() {
  if(
    fbi.x  <= (professor.x + 32)
      && professor.x  <= (fbi.x + 32)
    && fbi.y <= (professor.y + 32)
    && professor.y  <= (fbi.y + 32) && !fbi.dying) {
      fbi.dying = true;
      fbi.image = fbiDying;
      fbi.frameIndex = 0;
      fbi.numberOfFrames = 6;
      fbi.width = 384;
      fbi.direction = 0;
      agentsKilled++;
    }

    var dead = false;
    for(var i = 0 ; i < activeBulletPool.length; ++i) {
      if(activeBulletPool[i].active) {
        if(
          activeBulletPool[i].sprite.x  <= (professor.x + 20)
          && professor.x  <= (activeBulletPool[i].sprite.x + 20)
          && activeBulletPool[i].sprite.y <= (professor.y + 20)
          && professor.y  <= (activeBulletPool[i].sprite.y + 20)) {
            // You Fucking Died!
            professor.dying = true;
            professor.image = professorDying;
            professor.frameIndex = 0;
            professor.numberOfFrames = 6;
            professor.width = 384;
            professor.direction = 0;
            dead = true;
          }
      }
    }
    return dead;
}


var isProfessorDead = false;
var endFrames = 0;

function gameLoop() {

  ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
  ctx.fillStyle ="rgb(250, 250, 250)";
  ctx.font = "16px courier";
  ctx.textAlign="left";
  ctx.textBaseLine = "top";
  ctx.fillText("Kills: " + agentsKilled, 50, 50);
  professor.update();
  professor.render();
  fbi.update();
  fbi.render();
  drawActiveBullets();
  if(!isProfessorDead) {
    if(checkCollisions()){
      isProfessorDead = true;
    }
  } else {
    endFrames ++;
    if(endFrames == 40) {
      gameOver();
    }
  }
  window.requestAnimationFrame(gameLoop);
}

function endGame() {
  alert('Game Over Son');
};

function reset() {
  activeBulletPool = [];
  isProfessorDead = false;
  endFrames = 0;
  keysDown = {};
  agentsKilled = 0;
  gameLoop();
}
