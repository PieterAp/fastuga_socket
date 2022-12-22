const { disconnect } = require('process')

const httpServer = require('http').createServer()
const io = require("socket.io")(httpServer, {
    cors: {
        // The origin is the same as the Vue app domain:
        // Change if necessary
        origin: "http://127.0.0.1:5173",
        //origin: "http://172.22.21.93",
        methods: ["GET", "POST"],
        credentials: true
    }
})
httpServer.listen(8080, () => {
    console.log('listening on *:8080')
})
io.on('connection', (socket) => {

    socket.on('loggedIn', function (user) {
        socket.join(user.id)
        if (user.type == 'EM') {
            socket.join('Manager')
        }
        if (user.type == 'EC') {
            socket.join('Chef')
        }
        if (user.type == 'ED') {
            socket.join('Delivery')
        }
    })

    socket.on('loggedOut', function (user) {
        socket.leave(user.id)
        socket.leave('administrator')
    })

    socket.on('updateUser', function (user) {
        socket.in('Manager').except(user.id).emit('updateUser', user)
        socket.in(user.id).emit('updateUser', user)
    })

    socket.on('updateItem', function (item) {
        socket.in('Chef').emit('updateItem', item)
        socket.in('Manager').emit('updateItem', item)
        socket.in('Delivery').emit('updateItem', item)
    })

    socket.on('updateItemReady', function (item) {
        socket.in('Chef').emit('updateItemReady', item)
        socket.in('Manager').emit('updateItemReady', item)
        socket.in('Delivery').emit('updateItemReady', item)
    })

    socket.on('newItem', function (item) {
        socket.in('Chef').emit('newItem', item)
        socket.in('Manager').emit('newItem', item)
        socket.in('Delivery').emit('newItem', item)
    })

    socket.on('orderReady', function (item) { 
        socket.in('Chef').emit('orderReady', item)       
        socket.in('Delivery').emit('orderReady', item)
        socket.in('Manager').emit('orderReady', item)
    })

    socket.on('orderCancelled', function (userID, updatedPoints, orderTicketNumber) {  
        socket.in(userID).emit('orderCancelled', updatedPoints)

        //not done yet
        //socket.in('Chef').emit('orderCancelled', orderTicketNumber)
        //socket.in('Manager').emit('orderCancelled', orderTicketNumber)
        //socket.in('Delivery').emit('orderCancelled', orderTicketNumber)
    })

    socket.on('blocked', function (userID) {
       socket.in(userID).emit('blocked', 'Your account was locked')
    })
  
    socket.on('notifyOrderDelivery', function (userID,order) {          
        socket.in('Chef').emit('notifyOrderDelivery', "Order with ticket #" + order.ticket_number + " is now beeing delivered")
        socket.in('Manager').emit('notifyOrderDelivery', "Order with ticket #" + order.ticket_number + " is now beeing delivered by ")
        socket.in('Delivery').emit('notifyOrderDelivery', "Order with ticket #" + order.ticket_number + " is now beeing delivered by ")
        socket.in(userID).emit('notifyOrderDelivery', 'Your order is beeing delivered')
     })

    socket.on('deleteUser', (userID) => {
        socket.in(userID).emit('deleteUser', 'Your account was deleted')
    })

})