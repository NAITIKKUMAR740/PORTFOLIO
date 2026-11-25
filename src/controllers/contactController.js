const contactService = require('../services/contactService');
const env = require('../config/env');
const asyncHandler = require('../utils/asyncHandler');

const submitContact = asyncHandler(async (req, res) => {
  const saved = await contactService.submitContactMessage(req.body, {
    userAgent: req.get('user-agent') || '',
  });

  const responseData = {
    id: saved._id,
    emailStatus: saved.emailStatus,
    createdAt: saved.createdAt,
  };

  if (!env.isProd && saved.emailPreviewUrl) {
    responseData.emailPreviewUrl = saved.emailPreviewUrl;
  }

  res.status(201).json({
    success: true,
    message: 'Thank you! Your message has been received and saved.',
    data: responseData,
  });
});

const listMessages = asyncHandler(async (req, res) => {
  const messages = await contactService.listContactMessages({
    status: req.query.status,
  });
  res.status(200).json({
    success: true,
    count: messages.length,
    data: messages,
  });
});

const updateMessageStatus = asyncHandler(async (req, res) => {
  const updated = await contactService.updateContactStatus(req.params.id, req.body.status);
  res.status(200).json({
    success: true,
    message: 'Message status updated',
    data: updated,
  });
});

const deleteMessage = asyncHandler(async (req, res) => {
  await contactService.deleteContactMessage(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Message deleted successfully',
  });
});

module.exports = {
  submitContact,
  listMessages,
  updateMessageStatus,
  deleteMessage,
};
