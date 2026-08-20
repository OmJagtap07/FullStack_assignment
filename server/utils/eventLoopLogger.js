/**
 * eventLoopLogger.js
 * 
 * Demonstrates the mechanics of the JavaScript Event Loop (Call Stack vs Microtasks vs Macrotasks).
 * We use this to offload heavy analytics/logging tasks so they don't block the HTTP response 
 * from going back to the user instantly.
 */

export const eventLoopLogger = (eventMessage) => {
    // 1. CALL STACK (Synchronous)
    // This executes immediately on the main thread when the function is called.
    const timestamp = new Date().toISOString();
    console.log(`[Call Stack] Analytics event registered: ${eventMessage} at ${timestamp}`);

    // 2. MICROTASK QUEUE (queueMicrotask or Promises)
    // Executes immediately AFTER the current synchronous Call Stack clears, but BEFORE Macrotasks.
    // Used for urgent non-blocking state updates or fast data formatting.
    queueMicrotask(() => {
        const formattedData = `EVENT: ${eventMessage.toUpperCase()} | TIME: ${timestamp}`;
        console.log(`[Microtask Queue] Formatted analytics data: ${formattedData}`);
    });

    // 3. MACROTASK QUEUE (setTimeout, setInterval, I/O)
    // Executes AFTER the Call Stack and Microtask Queue are completely empty.
    // Used for heavy operations like saving to a database, ensuring the HTTP response is already sent!
    setTimeout(() => {
        // Simulating a heavy database write operation...
        console.log(`[Macrotask Queue] 💾 Heavy DB save completed for: ${eventMessage}`);
    }, 0);
};
