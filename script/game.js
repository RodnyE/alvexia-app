app.Script(config.PATH.lib+"/socket-io.min.js");
app.Script(config.PATH.lib+"/joy.min.js");
app.Script(config.PATH.script+"/global.js");
var engine = {};
app.Script(config.PATH.script+"/engine.js");
app.Script(config.PATH.script+"/socket-engine.js");
app.Script(config.PATH.lib+"/fpsmeter.min.js");


function OnStart() {
  mx.debug_init();
  app.SetScreenMode("Game");
  
  // USER STATUS //
  config.USER = {
    socket: {query: app.GetData("auth-query")},
    name: mx.LoadText("login-user"),
    pass: mx.LoadText("login-pass"),
    is_connect: false,
    socket_enabled: false,
  }
  
  
  game_view = dom.get("#game-view");
  tg_game_view = dom.get("canvas.tg-layer");
  fg_game_view = dom.get("canvas.fg-layer");
  bg_game_view = dom.get("canvas.bg-layer");
  joy = new JoyStick("joystick", {}, engine.joystick);
  
  game_view.width = screen.width;
  game_view.height = screen.height;
  tg_game_view.width = screen.width;
  tg_game_view.height = screen.height;
  fg_game_view.width = screen.width;
  fg_game_view.height = screen.height;
  bg_game_view.width = screen.width;
  bg_game_view.height = screen.height;
  
  //comprobar si tiene soporte
  if (!fg_game_view.getContext) return app.Quit(raw.parse("CANVAS_ERROR"));

  //inicializando api de canvas
  tgame = tg_game_view.getContext("2d"); //capa superior
  fgame = fg_game_view.getContext("2d"); //capa delantera
  bgame = bg_game_view.getContext("2d"); //capa de fondo
  
  //obtener elementos del DOM
  btns = dom.getAll("button.btn-action-items");
  for(let i = 0; i < btns.length; i++) btns[i].dom.on("touchstart",()=>{})
  
  //mantener la pantalla
  mx.Animate(0.3, () => app.SetScreenMode("Game")).start()
  
  if(config.TEST_ENABLE) ActivateTest()
  engine.init();
  Connect();
}



// CONEXION //
function Connect() {
  mx.ShowProgress();
  config.USER.socket_enabled = true;
  socket = io.connect(config.URL.socket, config.USER.socket);

  socket.on("connect", ()=>{
    mx.HideProgress();
    config.USER.is_connect = true;
  });
  
  socket.on("disconnect", ()=>{
    mx.ShowProgress("Reconectando...");
    config.USER.is_connect = false;
  });
  
  socket.on("reconnected", ()=>{
    mx.HideProgress();
    config.USER.is_connect = true;
  });
  
  engine.socket(socket);
  
}

// OPCIONES DE TESTEO //
function ActivateTest(){
  fps_count = new FPSMeter({
    left: "auto",
    right: screen.width/2+"px"
  });
  
  let sr = gx._screen_reference;
  let pf = gx._paint_offset;
  input_lupa = dom.get("#lupa");
  input_lupa.style.display = "inline";
  input_lupa.onchange = ()=>{
    gx._screen_reference = sr*(parseFloat(input_lupa.value)/100)*2;
    gx._paint_offset = pf*(parseFloat(input_lupa.value)*100)/2
  }
}