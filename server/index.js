import express, {} from "express";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";
import dotenv from "dotenv";
import { ApiResponse } from "./common/Api_Response.js";
import videoRoutes from "./module/video/videoRoutes.js";
dotenv.config();
const app = express();
// Enable CORS for frontend (http://localhost:5173)
app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json());
// Auth0 JWT Verification Middleware
const checkJwt = auth({
    audience: process.env.AUTH0_AUDIENCE ?? "",
    issuerBaseURL: process.env.AUTH0_DOMAIN ?? "",
    tokenSigningAlg: "RS256",
});
// Public route using standard ApiResponse
app.get("/health", (req, res) => {
    const response = new ApiResponse(200, { status: "healthy" }, "Public endpoint accessible by anyone");
    res.status(response.statusCode).json(response);
});
// Video routes (Upload auth, Feed listing, Video persistence)
app.use("/api/videos", videoRoutes);
// Protected route using standard ApiResponse
app.get("/api/protected", checkJwt, (req, res) => {
    const response = new ApiResponse(200, { auth: req.auth }, "Access granted!");
    res.status(response.statusCode).json(response);
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
//# sourceMappingURL=index.js.map