import express, {Request, Response, NextFunction} from 'express'
import { addToCart, CreateOrder, CustomerLogIn, CustomerSignUp, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderById, GetOrders, RequestOtp } from '../controllers/CustomerController';
import { Authenticate } from '../middlewares';


const router = express.Router();


//** ------------------ Signup / Create Customer --------------------------**/
router.post('/signup', CustomerSignUp)

//** ------------------ Login --------------------------**/

router.post("/login", CustomerLogIn)

//authentication
router.use(Authenticate)

//** ------------------ Verify Customer Account --------------------------**/

router.patch('/verify', CustomerVerify)

//** ------------------ OTP / Requesting OTP --------------------------**/

router.get('/otp', RequestOtp)

//** ------------------ Profile --------------------------**/

router.get('/profile', GetCustomerProfile)

//** ------------------ Edit Profile --------------------------**/

router.patch('/profile', EditCustomerProfile)

//Cart
router.post('/cart', addToCart)
router.get('/cart', GetCart)
router.delete('/cart/:id', DeleteCart)

//Payment

//Order
router.post('/create-order', CreateOrder)
router.get('/orders', GetOrders)
router.get('/order/:id', GetOrderById)

export { router as CustomerRoute };