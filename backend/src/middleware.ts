import { NextFunction, Request, Response } from "express";
import { JWT_PASSWORD } from "./config";
import jwt from "jsonwebtoken";

export const userMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const header  = req.headers["authorization"]
    if (!header) {
        return res.status(401).json({ msg: "You are not logged in" })
    }
    try {
        const decoded = jwt.verify(header as string, JWT_PASSWORD) as { id?: string }
        if (!decoded || !decoded.id) throw new Error('invalid')
        // @ts-ignore augment
        req.userId = decoded.id
        next()
    } catch {
        return res.status(401).json({ msg: "Invalid token" })
    }
}