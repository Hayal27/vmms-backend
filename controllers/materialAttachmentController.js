/**
 * Material Attachment Controller
 * Handles file uploads (photos/documents) for materials
 * Ethiopian IT Park Corporation - VMMS v4.0
 */

const BaseController = require('./BaseController');
const path = require('path');
const fs = require('fs');

class MaterialAttachmentController extends BaseController {
  /**
   * Upload attachments for a material
   * @route POST /api/materials/:id/attachments
   * @access Private
   */
  static async uploadAttachments(req, res) {
    try {
      const { id } = req.params; // material_id
      
      if (!id) {
        return this.error(res, 'Material ID is required', 400);
      }

      // Check if material exists
      const materialExists = await this.exists('materials', 'id', id);
      if (!materialExists) {
        return this.error(res, 'Material not found', 404);
      }

      const uploadedFiles = [];
      const photos = req.files?.photos || [];
      const documents = req.files?.documents || [];

      // Process photos
      for (const photo of photos) {
        const attachmentData = {
          material_id: id,
          file_name: photo.originalname,
          file_type: 'photo',
          file_path: photo.path.replace(/\\/g, '/'),
          file_size: photo.size,
          mime_type: photo.mimetype,
          uploaded_by: req.user?.user_id || null
        };

        const query = `
          INSERT INTO material_attachments 
          (material_id, file_name, file_type, file_path, file_size, mime_type, uploaded_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const result = await this.executeQuery(query, [
          attachmentData.material_id,
          attachmentData.file_name,
          attachmentData.file_type,
          attachmentData.file_path,
          attachmentData.file_size,
          attachmentData.mime_type,
          attachmentData.uploaded_by
        ]);

        uploadedFiles.push({
          id: result.insertId,
          type: 'photo',
          filename: photo.originalname,
          path: attachmentData.file_path,
          size: photo.size
        });
      }

      // Process documents
      for (const doc of documents) {
        const attachmentData = {
          material_id: id,
          file_name: doc.originalname,
          file_type: 'document',
          file_path: doc.path.replace(/\\/g, '/'),
          file_size: doc.size,
          mime_type: doc.mimetype,
          uploaded_by: req.user?.user_id || null
        };

        const query = `
          INSERT INTO material_attachments 
          (material_id, file_name, file_type, file_path, file_size, mime_type, uploaded_by, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const result = await this.executeQuery(query, [
          attachmentData.material_id,
          attachmentData.file_name,
          attachmentData.file_type,
          attachmentData.file_path,
          attachmentData.file_size,
          attachmentData.mime_type,
          attachmentData.uploaded_by
        ]);

        uploadedFiles.push({
          id: result.insertId,
          type: 'document',
          filename: doc.originalname,
          path: attachmentData.file_path,
          size: doc.size
        });
      }

      // Add timeline entry
      await this.addToTimeline(
        id,
        'attachments_uploaded',
        `${uploadedFiles.length} file(s) uploaded`,
        req.user?.user_id || null
      );

      // Log activity
      await this.logActivity(
        req.user?.user_id || null,
        'upload_attachments',
        'material',
        id,
        { files_count: uploadedFiles.length },
        req.ip
      );

      return this.success(res, {
        material_id: id,
        uploaded: uploadedFiles.length,
        files: uploadedFiles
      }, 'Attachments uploaded successfully', 201);

    } catch (error) {
      return this.error(res, 'Failed to upload attachments', 500, error);
    }
  }

  /**
   * Get all attachments for a material
   * @route GET /api/materials/:id/attachments
   * @access Private
   */
  static async getAttachments(req, res) {
    try {
      const { id } = req.params;

      const query = `
        SELECT 
          ma.*,
          u.user_name as uploaded_by_name
        FROM material_attachments ma
        LEFT JOIN users u ON ma.uploaded_by = u.user_id
        WHERE ma.material_id = ?
        ORDER BY ma.created_at DESC
      `;

      const attachments = await this.executeQuery(query, [id]);

      return this.success(res, attachments, 'Attachments retrieved successfully');

    } catch (error) {
      return this.error(res, 'Failed to retrieve attachments', 500, error);
    }
  }

  /**
   * Delete attachment
   * @route DELETE /api/materials/:id/attachments/:attachmentId
   * @access Private
   */
  static async deleteAttachment(req, res) {
    try {
      const { id, attachmentId } = req.params;

      // Get attachment info
      const query = 'SELECT * FROM material_attachments WHERE id = ? AND material_id = ?';
      const attachments = await this.executeQuery(query, [attachmentId, id]);

      if (attachments.length === 0) {
        return this.error(res, 'Attachment not found', 404);
      }

      const attachment = attachments[0];

      // Delete physical file
      if (fs.existsSync(attachment.file_path)) {
        fs.unlinkSync(attachment.file_path);
      }

      // Delete database record
      const deleteQuery = 'DELETE FROM material_attachments WHERE id = ?';
      await this.executeQuery(deleteQuery, [attachmentId]);

      // Add timeline entry
      await this.addToTimeline(
        id,
        'attachment_deleted',
        `Attachment deleted: ${attachment.file_name}`,
        req.user?.user_id || null
      );

      return this.success(res, { id: attachmentId }, 'Attachment deleted successfully');

    } catch (error) {
      return this.error(res, 'Failed to delete attachment', 500, error);
    }
  }

  /**
   * Download attachment
   * @route GET /api/materials/:id/attachments/:attachmentId/download
   * @access Private
   */
  static async downloadAttachment(req, res) {
    try {
      const { id, attachmentId } = req.params;

      // Get attachment info
      const query = 'SELECT * FROM material_attachments WHERE id = ? AND material_id = ?';
      const attachments = await this.executeQuery(query, [attachmentId, id]);

      if (attachments.length === 0) {
        return this.error(res, 'Attachment not found', 404);
      }

      const attachment = attachments[0];

      // Check if file exists
      if (!fs.existsSync(attachment.file_path)) {
        return this.error(res, 'File not found on server', 404);
      }

      // Send file
      res.download(attachment.file_path, attachment.file_name);

    } catch (error) {
      return this.error(res, 'Failed to download attachment', 500, error);
    }
  }

  /**
   * Add entry to material timeline
   */
  static async addToTimeline(material_id, action, description, user_id) {
    const query = `
      INSERT INTO material_timeline (material_id, action, description, user_id, created_at)
      VALUES (?, ?, ?, ?, NOW())
    `;
    
    await this.executeQuery(query, [material_id, action, description, user_id]);
  }
}

module.exports = MaterialAttachmentController;
