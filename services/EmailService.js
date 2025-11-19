/**
 * Email Service for VMMS
 * Handles sending email notifications for material applications
 */

const nodemailer = require('nodemailer');
const db = require('../models/db');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter with configuration from .env
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        service: 'gmail', // Use Gmail service instead of manual config
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        },
        connectionTimeout: 60000, // 60 seconds
        greetingTimeout: 30000, // 30 seconds
        socketTimeout: 60000, // 60 seconds
        debug: true, // Enable debug logs
        logger: true // Enable logger
      });

      console.log('✅ Email service initialized successfully');
      console.log('📧 Using Gmail service with user:', process.env.EMAIL_USER);
      
      // Test the connection
      this.testConnection();
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  /**
   * Test email connection
   */
  async testConnection() {
    try {
      if (this.transporter) {
        await this.transporter.verify();
        console.log('✅ Email server connection verified successfully');
      }
    } catch (error) {
      console.error('❌ Email server connection failed:', error.message);
      console.log('💡 Possible solutions:');
      console.log('   1. Check if EMAIL_USER and EMAIL_PASS are correct in .env');
      console.log('   2. Enable "Less secure app access" in Gmail settings');
      console.log('   3. Use App Password instead of regular password');
      console.log('   4. Check network/firewall settings');
    }
  }

  /**
   * Send material application notification to user and gate officers
   * @param {Object} materialData - Material application data
   * @param {string} userEmail - Current user's email
   */
  async sendMaterialApplicationNotification(materialData, userEmail) {
    try {
      // Get all Gate Officers (role_id = 9) emails
      const [gateOfficers] = await db.execute(
        'SELECT email, name FROM employees WHERE role_id = 9 AND is_active = 1 AND email IS NOT NULL',
        []
      );

      console.log(`📧 Found ${gateOfficers.length} gate officers to notify`);

      // Prepare email content
      const emailContent = this.generateEmailContent(materialData);
      
      // Send notification to current user (application status tracking)
      if (userEmail) {
        await this.sendEmail(
          userEmail,
          'Material Application Submitted - Tracking Information',
          this.generateUserNotificationEmail(materialData),
          this.generateUserNotificationHTML(materialData)
        );
        console.log(`✅ Status tracking email sent to user: ${userEmail}`);
      }

      // Send notification to all Gate Officers (for approval action)
      const gateOfficerEmails = gateOfficers.map(officer => officer.email);
      if (gateOfficerEmails.length > 0) {
        await this.sendEmail(
          gateOfficerEmails,
          'New Material Application - Action Required',
          emailContent.text,
          emailContent.html
        );
        console.log(`✅ Approval notification sent to ${gateOfficerEmails.length} gate officers`);
      }

      return {
        success: true,
        userNotified: !!userEmail,
        gateOfficersNotified: gateOfficerEmails.length,
        gateOfficerEmails
      };

    } catch (error) {
      console.error('❌ Failed to send material application notification:', error);
      throw error;
    }
  }

  /**
   * Send email using the configured transporter
   * @param {string|Array} to - Recipient email(s)
   * @param {string} subject - Email subject
   * @param {string} text - Plain text content
   * @param {string} html - HTML content
   */
  async sendEmail(to, subject, text, html) {
    if (!this.transporter) {
      throw new Error('Email transporter not initialized');
    }

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@vmms.com',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      text,
      html
    };

    const result = await this.transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    return result;
  }

  /**
   * Generate email content for gate officers (approval notification)
   * @param {Object} materialData - Material application data
   */
  generateEmailContent(materialData) {
    const text = `
New Material Application - Action Required

Application Details:
- Tracking Number: ${materialData.tracking_number}
- Company Name: ${materialData.company_name}
- Due Date: ${materialData.due_date} ${materialData.due_time || ''}
- Vehicle Plate: ${materialData.vehicle_plate_no}
- Requester: ${materialData.requester_name}
- Phone: ${materialData.requester_phone}
- Internal Approver: ${materialData.approver_name}

Material Items (${materialData.material_items?.length || 0} items):
${materialData.material_items?.map((item, index) => 
  `${index + 1}. ${item.item_name} - Qty: ${item.quantity} ${item.measurement}
     Type: ${item.is_returnable ? 'Returnable' : 'Non-returnable'}
     Description: ${item.description || 'N/A'}`
).join('\n') || 'No items specified'}

${materialData.notes ? `Notes: ${materialData.notes}` : ''}

Status: PENDING APPROVAL

Please log into the VMMS system to review and take action on this application.

---
Ethiopian IT Park Corporation - VMMS
This is an automated notification. Please do not reply to this email.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .info-section { margin: 20px 0; }
        .info-title { font-weight: bold; color: #2563eb; margin-bottom: 10px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .info-item { padding: 8px; background-color: #f8f9fa; border-radius: 4px; }
        .material-item { background-color: #f1f5f9; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #2563eb; }
        .status-badge { background-color: #fbbf24; color: #92400e; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .action-button { background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>New Material Application</h1>
        <p>Action Required - Approval Needed</p>
    </div>
    
    <div class="content">
        <div class="info-section">
            <div class="info-title">Application Details</div>
            <div class="info-grid">
                <div class="info-item"><strong>Tracking Number:</strong><br>${materialData.tracking_number}</div>
                <div class="info-item"><strong>Status:</strong><br><span class="status-badge">PENDING APPROVAL</span></div>
                <div class="info-item"><strong>Company Name:</strong><br>${materialData.company_name}</div>
                <div class="info-item"><strong>Due Date:</strong><br>${materialData.due_date} ${materialData.due_time || ''}</div>
                <div class="info-item"><strong>Vehicle Plate:</strong><br>${materialData.vehicle_plate_no}</div>
                <div class="info-item"><strong>Requester:</strong><br>${materialData.requester_name}</div>
            </div>
        </div>

        <div class="info-section">
            <div class="info-title">Contact Information</div>
            <div class="info-grid">
                <div class="info-item"><strong>Requester Phone:</strong><br>${materialData.requester_phone}</div>
                <div class="info-item"><strong>Internal Approver:</strong><br>${materialData.approver_name}</div>
            </div>
        </div>

        <div class="info-section">
            <div class="info-title">Material Items (${materialData.material_items?.length || 0} items)</div>
            ${materialData.material_items?.map((item, index) => `
                <div class="material-item">
                    <strong>${index + 1}. ${item.item_name}</strong><br>
                    <strong>Quantity:</strong> ${item.quantity} ${item.measurement}<br>
                    <strong>Type:</strong> ${item.is_returnable ? 'Returnable' : 'Non-returnable'}<br>
                    ${item.description ? `<strong>Description:</strong> ${item.description}` : ''}
                </div>
            `).join('') || '<p>No items specified</p>'}
        </div>

        ${materialData.notes ? `
        <div class="info-section">
            <div class="info-title">Additional Notes</div>
            <div class="info-item">${materialData.notes}</div>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 30px 0;">
            <a href="#" class="action-button">Review Application in VMMS</a>
        </div>
    </div>

    <div class="footer">
        <p><strong>Ethiopian IT Park Corporation - VMMS</strong></p>
        <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
</body>
</html>
    `;

    return { text, html };
  }

  /**
   * Generate user notification email (status tracking)
   * @param {Object} materialData - Material application data
   */
  generateUserNotificationEmail(materialData) {
    return `
Material Application Submitted Successfully

Your material application has been submitted and is now pending approval.

Application Details:
- Tracking Number: ${materialData.tracking_number}
- Application ID: ${materialData.id}
- Company Name: ${materialData.company_name}
- Due Date: ${materialData.due_date} ${materialData.due_time || ''}
- Status: PENDING APPROVAL

Material Items: ${materialData.material_items?.length || 0} items

You will receive another notification once your application has been reviewed and approved/rejected.

Please keep your tracking number for reference: ${materialData.tracking_number}

---
Ethiopian IT Park Corporation - VMMS
This is an automated notification. Please do not reply to this email.
    `;
  }

  /**
   * Generate user notification HTML email
   * @param {Object} materialData - Material application data
   */
  generateUserNotificationHTML(materialData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #10b981; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .tracking-box { background-color: #ecfdf5; border: 2px solid #10b981; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .tracking-number { font-size: 24px; font-weight: bold; color: #047857; font-family: monospace; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .info-item { padding: 8px; background-color: #f8f9fa; border-radius: 4px; }
        .status-badge { background-color: #fbbf24; color: #92400e; padding: 4px 12px; border-radius: 20px; font-weight: bold; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>✅ Application Submitted Successfully</h1>
        <p>Your material application is now pending approval</p>
    </div>
    
    <div class="content">
        <div class="tracking-box">
            <p><strong>Your Tracking Number</strong></p>
            <div class="tracking-number">${materialData.tracking_number}</div>
            <p style="margin-top: 10px; font-size: 14px;">Please save this number for future reference</p>
        </div>

        <div style="margin: 20px 0;">
            <h3>Application Details</h3>
            <div class="info-grid">
                <div class="info-item"><strong>Application ID:</strong><br>${materialData.id}</div>
                <div class="info-item"><strong>Status:</strong><br><span class="status-badge">PENDING APPROVAL</span></div>
                <div class="info-item"><strong>Company Name:</strong><br>${materialData.company_name}</div>
                <div class="info-item"><strong>Due Date:</strong><br>${materialData.due_date} ${materialData.due_time || ''}</div>
            </div>
        </div>

        <div style="margin: 20px 0;">
            <h3>What's Next?</h3>
            <ul>
                <li>Your application is now in the approval queue</li>
                <li>Gate officers will review your application</li>
                <li>You will receive an email notification once approved/rejected</li>
                <li>Use your tracking number to check status anytime</li>
            </ul>
        </div>
    </div>

    <div class="footer">
        <p><strong>Ethiopian IT Park Corporation - VMMS</strong></p>
        <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
</body>
</html>
    `;
  }

  /**
   * Send material approval/rejection notification to applicant
   * @param {Object} materialData - Material data
   * @param {string} action - 'approve' or 'reject'
   * @param {string} notes - Approval/rejection notes
   * @param {string} approverName - Name of the approver
   */
  async sendApprovalNotification(materialData, action, notes = '', approverName = '') {
    try {
      // Get applicant's email (the person who created the material)
      let applicantEmail = null;
      if (materialData.created_by) {
        const [applicantResult] = await db.execute(
          'SELECT e.email, e.name FROM users u JOIN employees e ON u.employee_id = e.employee_id WHERE u.user_id = ?',
          [materialData.created_by]
        );
        applicantEmail = applicantResult.length > 0 ? applicantResult[0].email : null;
      }

      if (!applicantEmail) {
        console.log('⚠️ No applicant email found for material:', materialData.id);
        return { success: false, reason: 'No applicant email found' };
      }

      // Prepare email content
      const emailContent = this.generateApprovalEmailContent(materialData, action, notes, approverName);
      
      // Send notification to applicant
      await this.sendEmail(
        applicantEmail,
        `Material Application ${action === 'approve' ? 'Approved' : 'Rejected'} - ${materialData.tracking_number}`,
        emailContent.text,
        emailContent.html
      );

      console.log(`✅ ${action === 'approve' ? 'Approval' : 'Rejection'} notification sent to applicant: ${applicantEmail}`);

      return {
        success: true,
        applicantEmail,
        action
      };

    } catch (error) {
      console.error(`❌ Failed to send ${action} notification:`, error);
      throw error;
    }
  }

  /**
   * Generate approval/rejection email content
   * @param {Object} materialData - Material data
   * @param {string} action - 'approve' or 'reject'
   * @param {string} notes - Approval/rejection notes
   * @param {string} approverName - Name of the approver
   */
  generateApprovalEmailContent(materialData, action, notes, approverName) {
    const isApproved = action === 'approve';
    const statusText = isApproved ? 'APPROVED' : 'REJECTED';
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const statusBg = isApproved ? '#ecfdf5' : '#fef2f2';
    
    const text = `
Material Application ${statusText}

Your material application has been ${action}ed by the gate officer.

Application Details:
- Tracking Number: ${materialData.tracking_number}
- Company Name: ${materialData.company_name}
- Status: ${statusText}
- ${isApproved ? 'Approved' : 'Rejected'} By: ${approverName}
- ${isApproved ? 'Approved' : 'Rejected'} At: ${new Date().toLocaleString()}

${notes ? `${isApproved ? 'Approval' : 'Rejection'} Notes: ${notes}` : ''}

${isApproved ? 
  'Your material application has been approved. You can now proceed with your material delivery/pickup as scheduled.' :
  'Your material application has been rejected. Please review the rejection notes and resubmit if necessary.'
}

${isApproved ? 
  'Next Steps:\n- Proceed to the gate with your tracking number\n- Present this email or your QR code\n- Follow the gate officer instructions' :
  'Next Steps:\n- Review the rejection reason\n- Make necessary corrections\n- Resubmit your application if needed'
}

---
Ethiopian IT Park Corporation - VMMS
This is an automated notification. Please do not reply to this email.
    `;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: ${statusColor}; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .status-box { background-color: ${statusBg}; border: 2px solid ${statusColor}; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; }
        .status-text { font-size: 24px; font-weight: bold; color: ${statusColor}; }
        .tracking-box { background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .tracking-number { font-size: 18px; font-weight: bold; color: #495057; font-family: monospace; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 10px 0; }
        .info-item { padding: 8px; background-color: #f8f9fa; border-radius: 4px; }
        .notes-section { background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .next-steps { background-color: ${isApproved ? '#d1ecf1' : '#f8d7da'}; border: 1px solid ${isApproved ? '#bee5eb' : '#f5c6cb'}; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        ul { margin: 10px 0; padding-left: 20px; }
        li { margin: 5px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${isApproved ? '✅' : '❌'} Application ${statusText}</h1>
        <p>Your material application has been ${action}ed</p>
    </div>
    
    <div class="content">
        <div class="status-box">
            <div class="status-text">${statusText}</div>
            <p style="margin-top: 10px; font-size: 16px;">Status updated by ${approverName}</p>
        </div>

        <div class="tracking-box">
            <p><strong>Tracking Number</strong></p>
            <div class="tracking-number">${materialData.tracking_number}</div>
        </div>

        <div style="margin: 20px 0;">
            <h3>Application Details</h3>
            <div class="info-grid">
                <div class="info-item"><strong>Company Name:</strong><br>${materialData.company_name}</div>
                <div class="info-item"><strong>Status:</strong><br><span style="color: ${statusColor}; font-weight: bold;">${statusText}</span></div>
                <div class="info-item"><strong>${isApproved ? 'Approved' : 'Rejected'} By:</strong><br>${approverName}</div>
                <div class="info-item"><strong>${isApproved ? 'Approved' : 'Rejected'} At:</strong><br>${new Date().toLocaleString()}</div>
            </div>
        </div>

        ${notes ? `
        <div class="notes-section">
            <h3>${isApproved ? 'Approval' : 'Rejection'} Notes</h3>
            <p>${notes}</p>
        </div>
        ` : ''}

        <div class="next-steps">
            <h3>Next Steps</h3>
            ${isApproved ? `
            <p><strong>Your application has been approved!</strong> You can now proceed with your material delivery/pickup as scheduled.</p>
            <ul>
                <li>Proceed to the gate with your tracking number</li>
                <li>Present this email or your QR code</li>
                <li>Follow the gate officer instructions</li>
                <li>Ensure you arrive within your scheduled time</li>
            </ul>
            ` : `
            <p><strong>Your application has been rejected.</strong> Please review the rejection reason and take appropriate action.</p>
            <ul>
                <li>Review the rejection reason above</li>
                <li>Make necessary corrections to your application</li>
                <li>Resubmit your application if needed</li>
                <li>Contact support if you need assistance</li>
            </ul>
            `}
        </div>
    </div>

    <div class="footer">
        <p><strong>Ethiopian IT Park Corporation - VMMS</strong></p>
        <p>This is an automated notification. Please do not reply to this email.</p>
    </div>
</body>
</html>
    `;

    return { text, html };
  }
}

module.exports = new EmailService();
