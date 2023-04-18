import { Request, Response } from 'express'
import { createSessionValidation, createUserValidation } from '../validations/auth.validation'
import { v4 as uuidv4 } from 'uuid'
import { logger } from '../utils/logger'
import { checkPassword, hashing } from '../utils/hashing'
import { createUser, findUserByEmail } from '../services/auth.service'
import UserType from '../types/user.type'
import { signJWT, verifyJWT } from '../utils/jwt'

export const registerUser = async (req: Request, res: Response) => {
    req.body.user_id = uuidv4()
    const { error, value } = createUserValidation(req.body)
    if (error) {
        logger.error('ERR: auth - register = ', error.details[0].message)
        return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    } try {
        value.password = `${hashing(value.password)}`

        await createUser(value)
        return res.status(201).json({ status: true, statusCode: 201, message: 'Success register user' })
    } catch (error) {
        logger.error('ERR: auth - register = ', error)
        return res.status(422).send({ status: false, statusCode: 422, message: error })
    }
}

export const createSession = async (req: Request, res: Response) => {
    const (error, value) => createSessionValidation(req.body)
    if (error) {
        logger.error('ERR: auth - create session = ', error.details[0].message)
        return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    }
    try {
        const user: any = await findUserByEmail(value.email)
        const isValid = checkPassword(value.password, user.password)

        if (!isValid) return res.status(401).json({ status: false, statusCode: 401, message: 'Invalid email or password' })

        const accessToken = signJWT({ ...user }, { expiresIn: 'Id' })

        return res.status(200).send({ status: true, statusCode: 200, message: 'Login Success', data: { accessToken } }
        )



    } catch (error) {
        logger.error('ERR: auth - create session = ', error.message)
        return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    }
}

export const refreshSession = async (req: Request, res: Response) => {
    const (error, value) => createSessionValidation(req.body)
    if (error) {
        logger.error('ERR: auth - refresh session = ', error.details[0].message)
        return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    }

    try {
        const { decoded }: any = verifyJWT(value.refreshToken)

        const user = await findUserByEmail(decoded._doc.email)
        if (!user) return false

        const accessToken = signJWT({ ...user }, { expiresIn: 'Id' })

        const refreshToken = signJWT({ ...user }, { expiresIn: '1y' })
        return res.status(200).send({ status: true, statusCode: 200, message: 'Refresh Session Success', data: { accessToken, refreshToken } }
    } catch (error: any) {
        logger.error('ERR: auth - refresh session = ', error.message)
        return res.status(422).send({ status: false, statusCode: 422, message: error.details[0].message })
    }




}
