import { Request, Response, NextFunction } from "express";
import { EditVandorInputs, VandorLoginInputs } from "../dto";
import { GenrateSignature, ValidatePassword } from "../utility";
import { FindVandor } from "./AdminController";


export const VandorLogin = async (req: Request, res: Response, next: NextFunction) => {

    const { email, password } = <VandorLoginInputs>req.body;
    
    const existingVandor = await FindVandor('', email);

    if (existingVandor !== null) {
        //validation and given access
        const validation = await ValidatePassword(password, existingVandor.password, existingVandor.salt);

        if (validation) {
            const signature = GenrateSignature({
                _id: existingVandor._id,
                email: existingVandor.email,
                foodTypes: existingVandor.foodType,
                name : existingVandor.email
            })
            return res.json(signature)
        } else {
            return res.json({"message" : "Password is not valid"})
        }
    }

    return res.json({"message" : "Login cridential not valid"})
}

export const GetVandorProfile = async (req: Request, res: Response, next: NextFunction) => {    
    const user = req.user;
    if (user) {
        const existingVandor = await FindVandor(user._id)
        return res.json(existingVandor)
    }

    return res.json({"message" : "Vandor information Not Found"})
}

export const UpdateVandorProfile = async (req: Request, res: Response, next: NextFunction) => { 

    const { foodTypes, name, address, phone } = <EditVandorInputs>req.body;
    
    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id)

        if (existingVandor !== null) {
            existingVandor.name = name;
            existingVandor.address = address;
            existingVandor.phone = phone;
            existingVandor.foodType = foodTypes

            const savedResult = await existingVandor.save();
            return res.json(savedResult);
        }

        return res.json(existingVandor)
    }

    return res.json({"message" : "Vandor information Not Found"})
}

export const UpdateVandorService = async (req: Request, res: Response, next: NextFunction) => { 

    const user = req.user;

    if (user) {
        const existingVandor = await FindVandor(user._id)

        if (existingVandor !== null) {
            existingVandor.serviceAvailble = !existingVandor.serviceAvailble
            
            const savedResult = await existingVandor.save();
            return res.json(savedResult);
        }

        return res.json(existingVandor)
    }

    return res.json({"message" : "Vandor information Not Found"})
}

