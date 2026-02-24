import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs/promises'

const uploadReportToCloudinary = async (file, folder = 'arogya/reports') => {
  if (!file) return ''

  const result = await cloudinary.uploader.upload(file.path, {
    folder,
    resource_type: 'auto',
    use_filename: false,
    unique_filename: true,
  })

  if (file.path) {
    try {
      await fs.unlink(file.path)
    } catch {
      // best-effort cleanup
    }
  }

  return result.secure_url || result.url || ''
}

export default uploadReportToCloudinary
