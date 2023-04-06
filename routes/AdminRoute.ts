import express, {Request, Response,NextFunction} from 'express'
import { createVendor, GetTransactions, GetTransactionbyID, GetVendorByID, GetVendors, } from '../controllers'

const router = express.Router()

router.post('/vendor', createVendor)

router.get('/vendors', GetVendors)

router.get('/vendor/:id', GetVendorByID)

router.get('/transactions', GetTransactions)

router.get('/transaction/:id', GetTransactionbyID)



router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({message:"Hello from admin"})
})

export {router as AdminRoute}