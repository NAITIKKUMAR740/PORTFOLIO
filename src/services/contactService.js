const ContactMessage = require('../models/ContactMessage');
const emailService = require('./emailService');
const ApiError = require('../utils/ApiError');

/**
 * Validates, stores a contact message in MongoDB, and triggers server-side email dispatch.
 */
const submitContactMessage = async (payload, meta = {}) => {
  const contact = await ContactMessage.create({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    message: payload.message,
    userAgent: meta.userAgent || '',
  });

  const emailResult = await emailService.sendContactEmails(contact);

  contact.emailStatus = emailResult.emailStatus;
  contact.emailPreviewUrl = emailResult.emailPreviewUrl;
  contact.emailError = emailResult.emailError;
  await contact.save();

  return contact.toObject();
};

/**
 * Lists contact messages for the admin inbox, newest first.
 */
const listContactMessages = async (filters = {}) => {
  const query = {};
  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  return ContactMessage.find(query).sort({ createdAt: -1 }).lean();
};

/**
 * Updates a contact message's workflow status.
 */
const updateContactStatus = async (id, status) => {
  const updated = await ContactMessage.findByIdAndUpdate(
    id,
    { $set: { status } },
    { new: true, runValidators: true }
  ).lean();

  if (!updated) {
    throw new ApiError(404, 'Contact message not found');
  }
  return updated;
};

/**
 * Deletes a contact message by ID.
 */
const deleteContactMessage = async (id) => {
  const deleted = await ContactMessage.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(404, 'Contact message not found');
  }
  return deleted;
};

module.exports = {
  submitContactMessage,
  listContactMessages,
  updateContactStatus,
  deleteContactMessage,
};
