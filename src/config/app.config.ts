export default () => ({
    appSecret: process.env.JWT_SECRET,
    expirationTime: { expiresIn: process.env.JWT_EXPIRATION_TIME },
})