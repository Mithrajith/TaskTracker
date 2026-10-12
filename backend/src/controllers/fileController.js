import Submission from '../models/Submission.js';
import { ROLES } from '../config/constants.js';
import { getFileStreamFromGridFS } from '../services/gridfsService.js';

export const getProofImage = async (req, res, next) => {
  try {
    const { fileId } = req.params;

    // Check authorization: find submission associated with this fileId
    const submission = await Submission.findOne({ fileId });
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Proof image record not found',
      });
    }

    // Role-based access control: Admin can view any proof, students can only view their own
    if (
      req.user.role === ROLES.STUDENT &&
      submission.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have permission to view this proof image',
      });
    }

    // Retrieve file stream from GridFS
    const fileResult = await getFileStreamFromGridFS(fileId);
    if (!fileResult) {
      return res.status(404).json({
        success: false,
        message: 'File bytes not found in storage',
      });
    }

    const { fileDoc, downloadStream } = fileResult;

    // Set response headers
    const contentType = submission.fileMimeType || fileDoc.contentType || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', fileDoc.length);
    res.setHeader('Cache-Control', 'private, max-age=86400'); // Cache privately in browser
    res.setHeader('Content-Disposition', `inline; filename="${fileDoc.metadata?.originalName || 'proof.jpg'}"`);

    downloadStream.on('error', (err) => {
      console.error('Error streaming file from GridFS:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Error streaming file' });
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    next(error);
  }
};
