import { Request,Response, NextFunction } from "express";
import { CreateVandorInput } from "../dto";

export const createVandor = async (req: Request, res: Response, next: NextFunction) => {
    const {name, address, pincode, foodType, email, password, ownerName, phone} = <CreateVandorInput>req.body;
    res.json({name, address, pincode, foodType, email, password, ownerName, phone})
}

export const GetVandors = async (req: Request, res: Response, next: NextFunction) => {
    
}

export const GetVandorByID = async (req: Request, res: Response, next: NextFunction) => {
    
}