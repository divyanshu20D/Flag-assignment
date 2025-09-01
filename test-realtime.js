// Simple test script to verify real-time functionality
const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

async function testRealtime() {
    try {
        console.log('🧪 Testing real-time functionality...')

        // Test event
        const testEvent = {
            type: 'flag_updated',
            flag: {
                key: 'test-flag',
                defaultValue: true,
                enabled: true,
                updatedAt: new Date().toISOString(),
                rules: []
            },
            user: {
                id: 'test-user',
                name: 'Test User',
                email: 'test@example.com',
                role: 'ADMIN'
            },
            changes: {
                enabled: { from: false, to: true }
            },
            timestamp: new Date().toISOString()
        }

        console.log('📡 Publishing test event...')
        await redis.publish('flag_events', JSON.stringify(testEvent))
        console.log('✅ Test event published')

        // Wait a bit for processing
        await new Promise(resolve => setTimeout(resolve, 1000))

        console.log('🎉 Test completed!')
    } catch (error) {
        console.error('❌ Test failed:', error)
    } finally {
        await redis.quit()
    }
}

testRealtime()