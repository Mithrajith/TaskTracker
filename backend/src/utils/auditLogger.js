import AuditLog from '../models/AuditLog.js';

export const logAudit = async ({
  actorId,
  action,
  resourceType,
  resourceId = null,
  metadata = {},
}) => {
  try {
    await AuditLog.create({
      actor: actorId,
      action,
      affectedResource: {
        resourceType,
        resourceId,
      },
      metadata,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
  }
};

