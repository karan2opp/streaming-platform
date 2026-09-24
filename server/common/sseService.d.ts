import { type Response } from "express";
declare class SSEService {
    private clients;
    /**
     * Register a new client SSE connection
     */
    addClient(id: string, res: Response): void;
    /**
     * Remove client SSE connection
     */
    removeClient(id: string): void;
    /**
     * Broadcast real-time event payload to all connected clients
     */
    broadcast(eventType: string, data: any): void;
}
export declare const sseService: SSEService;
export {};
//# sourceMappingURL=sseService.d.ts.map