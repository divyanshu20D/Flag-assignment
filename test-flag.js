// Test script for your US country flag rule
async function testFlag() {
    const flagKey = 'Third one for the rules'; // Your actual flag key

    // Test cases
    const testCases = [
        {
            name: 'US user should match',
            unitId: 'user_123',
            attributes: { country: 'US' }
        },
        {
            name: 'Non-US user should not match',
            unitId: 'user_456',
            attributes: { country: 'CA' }
        },
        {
            name: 'User without country attribute',
            unitId: 'user_789',
            attributes: {}
        }
    ];

    for (const testCase of testCases) {
        try {
            const response = await fetch('/api/v1/evaluate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    key: flagKey,
                    unitId: testCase.unitId,
                    attributes: testCase.attributes
                })
            });

            const result = await response.json();
            console.log(`${testCase.name}:`, result);
        } catch (error) {
            console.error(`Error testing ${testCase.name}:`, error);
        }
    }
}

// Run in browser console
testFlag();