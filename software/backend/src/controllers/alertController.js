const Alert = require('../models/Alert');

/**
 * Get all alerts with filtering and pagination
 */
const getAllAlerts = async (req, res, next) => {
  try {
    const { greenhouseId, acknowledged, severity, alertType, page = 1, limit = 50 } = req.query;

    const filter = {};
    if (greenhouseId) filter.greenhouseId = greenhouseId.toUpperCase();
    if (acknowledged !== undefined) filter.acknowledged = acknowledged === 'true';
    if (severity) filter.severity = severity;
    if (alertType) filter.alertType = alertType;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Alert.countDocuments(filter);
    const alerts = await Alert.find(filter)
      .populate('acknowledgedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const unacknowledgedCount = await Alert.countDocuments({ acknowledged: false });

    res.status(200).json({
      success: true,
      count: alerts.length,
      total,
      unacknowledgedCount,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: alerts
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Acknowledge an alert
 */
const acknowledgeAlert = async (req, res, next) => {
  try {
    const { id } = req.params;

    const query = id.match(/^[0-9a-fA-F]{24}$/)
      ? { $or: [{ _id: id }, { alertId: id }] }
      : { alertId: id };

    const alert = await Alert.findOne(query);
    if (!alert) {
      return res.status(404).json({
        success: false,
        error: `Alert '${id}' not found.`
      });
    }

    if (alert.acknowledged) {
      return res.status(200).json({
        success: true,
        message: 'Alert already acknowledged',
        data: alert
      });
    }

    alert.acknowledged = true;
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = req.user ? req.user._id : null;
    await alert.save();

    await alert.populate('acknowledgedBy', 'name email role');

    res.status(200).json({
      success: true,
      message: 'Alert acknowledged successfully',
      data: alert
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllAlerts,
  acknowledgeAlert
};
