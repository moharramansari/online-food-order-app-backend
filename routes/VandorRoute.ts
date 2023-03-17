import express, {Request, Response,NextFunction} from 'express'

const router = express.Router()

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({message:"Hello from vandor"})
})

export {router as VandorRoute}