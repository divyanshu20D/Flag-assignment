// Test if the server is running with Socket.IO
const { io } = require('socket.io-client')

async function testConnection() {
    console.log('Testing Socket.IO connection...')

    const socket = io('http://localhost:3000', {
        auth: {
            sessionToken: 'test-token'
        },
        transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
        console.log('✅ Socket.IO connection successful')
        socket.disconnect()
        process.exit(0)
    })

    socket.on('connect_error', (error) => {
        console.error('❌ Socket.IO connection failed:', error.message)
        process.exit(1)
    })

    // Timeout after 5 seconds
    setTimeout(() => {
        console.error('❌ Connection timeout')
        socket.disconnect()
        process.exit(1)
    }, 5000)
}

testConnection()