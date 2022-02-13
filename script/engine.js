
//objetos del juego
var gx = {
  player: null,
  world: null,
  pjs: {},
  _emitps: 60,
};


// INICIALIZAR JUEGO //
engine.init = ()=> {
  // PLAYER //
  gx.player = {
    pos: [0,0],
    speed: 0,
    mov: [0,0],
    size: [40, 50],
    deg: 0,
    texture: "hero_",
    img: new Image(),
    
    _mov_enable: true,
    _emit_joy_enable: false,
  };
  
  var player = gx.player;
  
  // WORLD //
  gx.world = {
    size: [0,0],
    pos: [0,0],
    bioma: "nature",
    textures: [],
    img_data: {
      floor: null
    }
  };
  var world = gx.world;
  engine.load_world();
  
  // MOSTRAR //
  mx.Animate("frame", engine.generate_frame).start();
  
  // LOGICA //
  mx.Animate("frame", ()=>{
    if(config.USER.is_connect){
      if(player._emit_joy_enable && player._mov_enable){
        //emitir al servidor
        socket.emit("move_pj", {x:player.pos[0], y:player.pos[1]});
        total_emit++;
        player._mov_enable = false;
        window.setTimeout(()=>{player._mov_enable=true}, 1000/gx._emitps);
      }
      
      //mover personaje localmente
      player.pos[0] += player.mov[0];
      player.pos[1] += player.mov[1];
      gx.world.pos = [-player.pos[0],-player.pos[1]];
      
    }
  }).start()
  
}

// ACCIONES JOYSTICK //
engine.joystick = d => {
    var player = gx.player;
    player._emit_joy_enable = d.x!=0 && d.y!=0;
    player.mov[0] = d.x/100*player.speed;
    player.mov[1] = -d.y/100*player.speed;
}

// GENERAR WORLD //
engine.load_world = () => {
  let path_world = config.PATH.img_world + "/" + gx.world.bioma;
  let img_floor = new Image();
      img_floor.onload = ()=>{img_floor.ready=true};
      img_floor.src = mx.BImg(path_world+"/base");
      img_floor.width = 50;
      img_floor.height = 50;
  
  gx.world.img_data.floor = img_floor;
};

// PINTAR FRAME //
engine.generate_frame = () => {
  engine.clear_frame();
  let player = gx.player;
  let world = gx.world;
  let world_img = world.img_data;
  
  if (world_img.floor.ready) game.drawImage(world_img.floor, cvw(world.pos[0])+game_view.width/2, cvw(world.pos[1])+game_view.height/2, cvw(world.size[0]), cvw(world.size[1]))
  if (player.img.ready) game.drawImage(player.img, game_view.width/2-cvw(player.size[0])/2, game_view.height/2-cvw(player.size[1])/2, cvw(player.size[0]), cvw(player.size[1]));
  for (let i in gx.pjs) if(gx.pjs[i]!==undefined) {
    let pj = gx.pjs[i];
    if(pj.img.ready) game.drawImage(
         pj.img, 
         cvw(pj.pos[0] + world.pos[0] - pj.size[0]/2)+game_view.width/2,
         cvw(pj.pos[1] + world.pos[1] - pj.size[1]/2)+game_view.height/2,
         cvw(pj.size[0]),
         cvw(pj.size[1])
    );
  }
  
  engine.debug([
    "player x: "+player.pos[0],
    "player y: "+player.pos[1],
    "mov x: "+player.mov[0],
    "mov y: "+player.mov[1],
    "world x: "+world.pos[0],
    "world y: "+world.pos[1],
    "joy emits sent: "+total_emit+" ("+gx._emitps+"emit/s)",
    "delay emits: "+delay_emit_count+"s"
  ])
}

// BORRAR FRAME //
engine.clear_frame = () => game.clearRect(0,0,game_view.width, game_view.height);

engine.tile = n=>n*gx.world.img_data.floor.width;

// DEBUG CANVAS //
engine.debug = txt=>{
  let ww = 10;
  for(let i of txt){
    game.fillText(i,10,ww)
    ww+=10;
  };
}