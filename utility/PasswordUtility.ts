import bcrypt from 'bcrypt'

export const GenrateSalt = async () => {
    return await bcrypt.genSalt()
}

export const GenratePassword = async (password: string, salt: string) => {
    return await bcrypt.hash(password, salt)
}