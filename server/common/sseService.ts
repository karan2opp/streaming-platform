import { type Response } from "express";

interface SSEClient {
  id: string;
  res: Response;
}

class SSEService {
  private clients: SSEClient[] = [];

  /**
   * Register a new client SSE connection
   */
  public addClient(id: string, res: Response): void {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const client: SSEClient = { id, res };
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
  public removeClient(id: string): void {
    this.clients = this.clients.filter((client) => client.id !== id);
  }

  /**
   * Broadcast real-time event payload to all connected clients
   */
  public broadcast(eventType: string, data: any): void {
    const payload = JSON.stringify({ type: eventType, data });
    this.clients.forEach((client) => {
      client.res.write(`data: ${payload}\n\n`);
    });
  }
}

export const sseService = new SSEService();
