import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { redisSub, CHANNELS, type FlagEvent } from './redis'
import { prisma } from './prisma'

let io: SocketIOServer | null = null

export function initializeSocket(server: HTTPServer) {
    if (io) {
        console.log('Socket.IO already initialized')
        return io
    }

    console.log('🚀 Initializing Socket.IO server...')

    io = new SocketIOServer(server, {
        cors: {
            origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
            methods: ["GET", "POST"]
        },
        transports: ['websocket', 'polling']
    })

    // Simplified authentication - just get first user for testing
    io.use(async (socket, next) => {
        try {
            console.log('🔐 Socket connection attempt...')

            // Get a default user for testing
            const user = await prisma.user.findFirst({
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    workspaceId: true
                }
            })

            if (!user) {
                console.log('❌ No users found in database')
                return next(new Error('No users found'))
            }

            console.log(`✅ Using user: ${user.email}`)
            socket.data.user = user
            next()
        } catch (error) {
            console.error('❌ Socket authentication error:', error)
            next(new Error('Authentication failed'))
        }
    })

    io.on('connection', (socket) => {
        const user = socket.data.user
        console.log(`🔌 User ${user.email} connected to workspace ${user.workspaceId}`)

        // Join workspace room
        socket.join(`workspace:${user.workspaceId}`)

        socket.on('disconnect', () => {
            console.log(`🔌 User ${user.email} disconnected`)
        })
    })

    // Subscribe to Redis flag events
    setupRedisSubscription()

    console.log('✅ Socket.IO server initialized successfully')
    return io
}

function setupRedisSubscription() {
    if (!io) {
        console.log('❌ No Socket.IO instance for Redis subscription')
        return
    }

    console.log('📡 Setting up Redis subscription...')

    try {
        // Subscribe to all workspace flag events
        redisSub.psubscribe('flag_events:*')

        redisSub.on('psubscribe', (pattern, count) => {
            console.log(`✅ Subscribed to Redis pattern: ${pattern} (${count} subscriptions)`)
        })

        redisSub.on('pmessage', (pattern, channel, message) => {
            try {
                console.log(`📨 Received Redis message on ${channel}`)
                const event: FlagEvent = JSON.parse(message)
                const workspaceRoom = `workspace:${event.workspaceId}`

                // Broadcast to all users in the workspace
                io!.to(workspaceRoom).emit('flag_event', event)

                console.log(`📡 Broadcasted ${event.type} for flag ${event.flag.key} to workspace ${event.workspaceId}`)
            } catch (error) {
                console.error('❌ Error processing Redis message:', error)
            }
        })

        redisSub.on('error', (error) => {
            console.error('❌ Redis subscription error:', error)
        })
    } catch (error) {
        console.error('❌ Failed to setup Redis subscription:', error)
    }
}

export function getSocketIO() {
    return io
}