const { 
    PutObjectCommand, 
    DeleteObjectCommand,
    GetObjectCommand
} = require("@aws-sdk/client-s3")

const { randomUUID } = require("crypto")
const s3 = require("../../../config/s3")
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner")

//---------------------------------------------------------
//Upload Image - User Profile

const uploadUserProfileImageService = async (file) => {
    if (!file || !file.buffer || !file.originalname || !file.mimetype) {
        throw new Error("Invalid image file")
    }
    const fileExtension = file.originalname.split(".").pop()
    const key = `profile-images/${randomUUID()}.${fileExtension}`

    const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    })

    await s3.send(command)

    return key
}


//---------------------------------------------------
//Delete Image - User Profile

const deleteUserProfileImageService = async (key) => {
    if (!key) return

    const command = new DeleteObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    })

    await s3.send(command)
}


//----------------------------------------------------
//Get Image - User Profile

const getUserProfileImageUrlService = async (key) => {
    if (!key) return null

    const command = new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: key
    })

    return getSignedUrl(s3, command, {
        expiresIn: 3600
    })
}


//------------------------------------------------------------

module.exports = {
    uploadUserProfileImageService,
    deleteUserProfileImageService,
    getUserProfileImageUrlService
}