/**
* @author Jesse Jay Wallace <jjaywallace@gmail.com>
* @overview
* http://www.jjwallace.info/
*/

var serverPort = 8080;

console.log("Initializing Server.");

var express = require('express');
var connect = require('connect');
var app = express();
var serv = require('http').Server(app);  //.createServer(app);
var io = require('socket.io').listen(serv,{});//(serv);  //

console.log("Starting Server.");

var serveStatic = require('serve-static');
connect().use(serveStatic(__dirname)).listen(serverPort, function(){
    console.log('Server running on ' + serverPort + ' !');
});
 
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

serv.listen(8081);

/////DO SHIT WITH SERVER
var SOCKET_LIST = {};
var PLAYER_LIST = {};
io.sockets.on('connection', function(socket){
    socket.id = Math.random();
    SOCKET_LIST[socket.id] = socket;
    var player = Player(socket.id);
    PLAYER_LIST[socket.id] = player;    
    console.log('Player ' + socket.id + ' Connected!');
    console.log("Remote Address: " + socket.request.connection.remoteAddress);
    
    var str = socket.request.connection.remoteAddress;
    var res = str.split("f:");
    socket.emit('myIP', res[1]);
    
    socket.emit('getID',socket.id);
    socket.emit('joinGame',socket.id);
    console.log('Player ' + socket.id + ' Added!');
    //socket.emit('gameMsg', 'Player ' + socket.id + ' Joined The Game!');
    for(var i in SOCKET_LIST){ 
            var socketList = SOCKET_LIST[i];
            socketList.emit('gameMsg', 'Player ' + socket.id + ' Joined The Game!');
            //socket.emit('addPlayer',socket.id);
            socketList.emit('addPlayer', objectLength(SOCKET_LIST));
            socketList.emit('topRightMessage', objectLength(SOCKET_LIST));
        }
    
    console.log('Total Players Connected: ' + objectLength(SOCKET_LIST));
    
    socket.on('disconnect',function(){
        //socketList.emit('removePlayer', socket.id);
        console.log('Player ' + socket.id + ' Disconnected!');
        //socket.emit('gameMsg', 'Player ' + socket.id + ' Disconnected!');
        for(var i in SOCKET_LIST){ 
            var socketList = SOCKET_LIST[i];
            socketList.emit('gameMsg', 'Player ' + socket.id + ' Disconnected!');
            
            socketList.emit('removePlayer',socket.id);
            
            socketList.emit('topRightMessage', objectLength(SOCKET_LIST));
            console.log('Total Players Connected: ' + objectLength(SOCKET_LIST));
        }
        delete SOCKET_LIST[socket.id];
        delete PLAYER_LIST[socket.id];
    });
    
    socket.on('servMsg',function(data){
        console.log(data.reason);
    });
    
    socket.on('getLocation',function(data){
        //console.log(data.reason);
    });
    
    //AI fish food
    
    //AI fake players
    
        
//    socketList.on('fishRot',function(data){
//        for(var d = 0; d < data.length; d++){
//            //if(player[d].id == data[d].id){
//                console.log('data: ' + data[d].rot);
//                player[data[d].id].rot = data[d].rot;
//            //}
//        }
//    });
    
    socket.on('fishRot',function(data){
        if(data.id < 0){}else{
            player.rot = data.rot;
        }
    });
    
});

function objectLength(obj) {
  var result = 0;
  for(var prop in obj) {
    if (obj.hasOwnProperty(prop)) {
    // or Object.prototype.hasOwnProperty.call(obj, prop)
      result++;
    }
  }
  return result;
}

var Player = function(id){
    var self = {
    x:250,
    y:250,
    rot:90,
    id:id,
    speed:7,
    number:"" + Math.floor(10 * Math.random()),
    name:"Jimmy",
    size:1
    }
    self.updatePosition = function(){
        self.x -= Math.sin(self.rot/180*Math.PI) * self.speed;
        self.y += Math.cos(self.rot/180*Math.PI) * self.speed;
        //console.log(id + '  x:' + Math.round(self.x) + '  y:' + Math.round(self.y) + '  ROT:' + Math.round(self.rot));
    }
    return self;
}

var FishFood = function(id){
    var self = {
    x:250,
    y:250,
    rot:90,
    id:id,
    speed:7,
    number:"" + Math.floor(10 * Math.random()),
    name:"Jimmy",
    size:1,
    alive:1
    }
    self.updatePosition = function(){
//        self.x -= Math.sin(self.rot/180*Math.PI) * self.speed;
//        self.y += Math.cos(self.rot/180*Math.PI) * self.speed;
        self.x ++;
        self.rot += rand(-5,5);
        //console.log(id + '  x:' + Math.round(self.x) + '  y:' + Math.round(self.y) + '  ROT:' + Math.round(self.rot));
    }
    return self;
}

//VIDEO 4 2:58 sec

setInterval(function(){
    var pack = [];
    for(var i in PLAYER_LIST){
        var player = PLAYER_LIST[i];
        player.updatePosition();
        
        pack.push({
            x:player.x,
            y:player.y,
            rot:player.rot,
            id:player.id,
            speed:player.speed,
            number:player.number
        })
    }
    
    var fishPack = [];
    for (var i = 0; i < 10; i++){
        var fishFood = FishFood(i);
        fishFood.updatePosition();
        fishPack.push({
            x:fishFood.x,
            y:fishFood.y,
            rot:fishFood.rot,
            id:fishFood.id,
            speed:fishFood.speed,
            number:fishFood.number,
            alive:fishFood.alive
        })
        
    }
    
    for(var i in SOCKET_LIST){
        var socket = SOCKET_LIST[i];
        socket.emit('newPositions',pack);
        //socket.emit('newYellow',fishPack);
    }
}, 1000/36)

function rand( lowest, highest){
    var adjustedHigh = (highest - lowest) + 1;       
    return Math.floor(Math.random()*adjustedHigh) + parseFloat(lowest);
}