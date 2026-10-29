const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: [true, 'Alert ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    greenhouseId: {
      type: String,
      required: [true, 'Greenhouse ID is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    plantId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null,
      index: true
    },
    inspectionId: {
      type: String,
      trim: true,
      default: null,
      index: true
    },
    alertType: {
      type: String,
      required: [true, 'Alert type is required'],
      enum: {
        values: [
          'nutrient_deficiency',
          'disease_detected',
          'robot_offline',
          'sensor_error',
          'system_warning'
        ],
        message: '{VALUE} is not a valid alert type'
      },
      index: true
    },
    severity: {
      type: String,
      required: [true, 'Severity is required'],
      enum: {
        values: ['info', 'warning', 'critical'],
        message: '{VALUE} is not a valid severity level'
      },
      default: 'warning',
      index: true
    },
    message: {
      type: String,
      required: [true, 'Alert message is required'],
      trim: true
    },
    acknowledged: {
      type: Boolean,
      default: false,
      index: true
    },
    acknowledgedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    acknowledgedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ greenhouseId: 1, acknowledged: 1, createdAt: -1 });

alertSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Alert = mongoose.model('Alert', alertSchema);
module.exports = Alert;
