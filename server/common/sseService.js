import {} from "express";
class SSEService {
    clients = [];
    /**
     * Register a new client SSE connection
     */
    addClient(id, res) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders();
        const client = { id, res };
        this.clients.push(client);
        // Send initial connection message
        res.write(`data: ${JSON.stringify({ type: "CONNECTED", message: "SSE stream established" })}\n\n`);
        res.on("close", () => {
            this.removeClient(id);
        });
    }
    /**
     * Remove client SSE connection
     */
    removeClient(id) {
        this.clients = this.clients.filter((client) => client.id !== id);
    }
    /**
     * Broadcast real-time event payload to all connected clients
     */
    broadcast(eventType, data) {
        const payload = JSON.stringify({ type: eventType, data });
        this.clients.forEach((client) => {
            client.res.write(`data: ${payload}\n\n`);
        });
    }
}
export const sseService = new SSEService();
//# sourceMappingURL=sseService.js.map