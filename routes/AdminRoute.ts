import express, {Request, Response,NextFunction} from 'express'
import { createVandor, GetVandorByID, GetVandors, } from '../controllers'

const router = express.Router()

router.post('/vandor', createVandor)

router.get('/vandors', GetVandors)

router.get('/vandor/:id', GetVandorByID)

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({message:"Hello from admin"})
})

export {router as AdminRoute}