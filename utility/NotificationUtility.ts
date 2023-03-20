//Email


//notification


//OTP

export const GenerateOtp = () => {

    const otp = Math.floor(100000 + Math.random() * 900000)
    let expiry = new Date()
    expiry.setTime(new Date().getTime() + (30 * 60 * 1000))
    return { otp, expiry}
}

export const onRequestOTP = async (otp: number, toPhoneNumber: string) => {
    const accoundSid = '';
    const authToken = '';

    const client = require('twilio')(accoundSid, authToken)

    const response = await client.messages.create({
        body: `Your OTP is ${otp}`,
        from: '',
        to: `+91${toPhoneNumber}`
    })

    return response;
}

//Payment notification or emails