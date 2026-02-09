import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'

const uploadImageToCloudinary = async (file, folder = 'arogya') => {
    if (!file) {
        return ''
    }

    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        throw new Error('Invalid image file')
    }

    const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image'
    })

    if (file.path) {
        try {
            await fs.unlink(file.path)
        } catch (error) {
            // Best effort cleanup
        }
    }

    return result.secure_url || result.url || ''
}

export default uploadImageToCloudinary
