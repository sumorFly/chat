const express = require('express') // import express
const app = express() //create instance
const http = require('http') //create http server
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
let users = []
let Color = function () {
  this.r = Math.floor(Math.random() * 255)
  this.g = Math.floor(Math.random() * 255)
  this.b = Math.floor(Math.random() * 255)
  this.color = 'rgba(' + this.r + ',' + this.g + ',' + this.b + ',0.8)'
  return this.color
}

app.use('/', express.static(__dirname + '/www'))

server.listen(process.env.PORT || 3001)

io.sockets.on('connection', function (socket) {
  //监听客户端连接
  //用户登录
  socket.on('login', function (nickname) {
    //监听客户端发送的信息
    let users_nickName = users.filter((u) => u.nickname == nickname)
    if (users_nickName.length > 0) {
      socket.emit('nickExisted') //返回已存在
    } else {
      socket.nickname = nickname
      let color = new Color()
      // 给每个用户对应的颜色
      users.push({
        nickname: socket.nickname,
        color: color.color,
      })
      console.log(users)
      socket.emit('loginSuccess') //给该socket的客户端发送登录成功的消息
      io.sockets.emit('system', nickname, users.length, 'login', users) //广播系统消息
    }
  })
  //用户离线
  socket.on('disconnect', function () {
    //监听客户端发送的信息
    if (socket.nickname != null) {
      // 删除离开用户
      users = users.filter((u) => u.nickname != socket.nickname)

      socket.broadcast.emit(
        'system',
        socket.nickname,
        users.length,
        'logout',
        users,
      ) //给除自己以外的客户端广播消息
    }
  })
  //有新的消息
  socket.on('postMsg', function (msg, color) {
    //监听客户端发送的信息
    console.log(users)
    socket.broadcast.emit('newMsg', socket.nickname, msg, color, users) //给除自己以外的客户端广播消息
  })
})
