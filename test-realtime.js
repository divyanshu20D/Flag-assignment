// Simple test script to verify real-time functionality
const Redis = require('ioredis')

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6380')

// Test publishing a flag event
const testEvent = {
    type: 'flag_updated',
    workspaceId: 'test-workspace',
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
    timestamp: new Date().toISOString(),
    changes: {
        enabled: { from: false, to: true }
    }
}

async function testRedisConnection() {
    try {
        console.log('Testing Redis connection...')
        await redis.ping()
        console.log('✅ Redis connection successful')

        console.log('Publishing test event...')
        await redis.publish(`flag_events:test-workspace`, JSON.stringify(testEvent))
        console.log('✅ Event published successfully')

        process.exit(0)
    } catch (error) {
        console.error('❌ Redis test failed:', error)
        process.exit(1)
    }
}

testRedisConnection()