window.onload = function () {
  // 实例化chat程序
  let hiChat = new Chat()
  hiChat.init()
}
//
let Chat = function () {
  this.socket = null
}
let socket = io()
Chat.prototype = {
  init: function () {
    let that = this
    this.socket = io.connect() //建立到服务器的socket连接
    //监听socket的connect
    this.socket.on('connect', function () {
      document.getElementById('info').textContent = 'Input Your Name PLZ'
      document.getElementById('nicknameInput').style.display = 'block'
      document.getElementById('nameInput').focus()
    })
    // 检查用户名
    this.socket.on('nickExisted', function () {
      document.getElementById('info').textContent = 'Name Already exsits'
    })
    //登录成功后
    this.socket.on('loginSuccess', function () {
      document.getElementById('loginWrapper').style.display = 'none'
      document.getElementById('messageInput').focus()
    })
    // 监听到连接服务器失败
    this.socket.on('error', function (err) {
      if (document.getElementById('loginWrapper').style.display == 'none') {
        document.getElementById('status').textContent = 'Connect Fail'
      } else {
        document.getElementById('info').textContent = '!Connect Fail'
      }
    })
    //有新的消息发布时及时展示
    this.socket.on('newMsg', function (nickName, msg, color, users) {
      let user = users.filter((u) => u.nickname == nickName)
      console.log(users)
      let userColor = user[0].color
      that._displayNewMessage(nickName, msg, userColor)
    })
    //监听聊天室所有用户状态以及判定有多少用户存在
    this.socket.on('system', function (nickName, userCount, type, users) {
      let user =
        type === 'logout' ? [] : users.filter((u) => u.nickname == nickName)

      let color = user[0] ? user[0].color : '#000'
      let msg = nickName + (type == 'login' ? '上线了' : '离开了')
      that._displayNewMessage('system', msg, color)
      document.getElementById('status').textContent = ' online ' + userCount
    })
    // 登录
    document.getElementById('loginBtn').addEventListener(
      'click',
      function () {
        let nickname = document.getElementById('nameInput').value
        if (nickname.trim().length != '') {
          that.socket.emit('login', nickname)
        } else {
          alert(' Input Your Name PLZ')
          document.getElementById('nameInput').focus()
        }
      },
      false,
    )
    //发送消息的按钮添加监听事件
    document.getElementById('sendBtn').addEventListener(
      'click',
      function () {
        const messageInput = document.getElementById('messageInput'),
          msg = messageInput.value,
          color = '#000'
        messageInput.value = ''
        messageInput.focus()
        if (msg.trim().length != 0) {
          that.socket.emit('postMsg', msg, color) //向服务器发送新的消息

          that._displayNewMessage('(我)', msg, color)
          return
        }
      },
      false,
    )
  }, //init

  _displayNewMessage: function (user, msg, color) {
    const container = document.getElementById('historyLog'),
      msgToDisplay = document.createElement('p'),
      date = new Date().toTimeString().substr(0, 8) //获取当前的时间

    msgToDisplay.style.color = color || '#000' //
    if (user !== 'system') {
    }

    msgToDisplay.innerHTML =
      user + '<span class="timespan">(' + date + '): </span>' + msg
    container.appendChild(msgToDisplay) //向消息列表插入子元素
    container.scrollTop = container.scrollHeight //超出窗口高度酒有滚动条
  },
}
