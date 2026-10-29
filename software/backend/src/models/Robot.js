const mongoose = require('mongoose');

const robotSchema = new mongoose.Schema(
  {
    robotId: {
      type: String,
      required: [true, 'Robot ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Robot name is required'],
      trim: true,
      default: 'Greenhouse Rover Alpha'
    },
    apiKeyHash: {
      type: String,
      required: [true, 'Robot API Key hash is required']
    },
    greenhouseId: {
      type: String,
      required: [true, 'Greenhouse ID is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    connectionStatus: {
      type: String,
      enum: {
        values: ['online', 'offline', 'idle', 'inspecting', 'error'],
        message: '{VALUE} is not a valid robot connection status'
      },
      default: 'offline',
      index: true
    },
    batteryLevel: {
      type: Number,
      min: [0, 'Battery cannot be less than 0%'],
      max: [100, 'Battery cannot exceed 100%'],
      default: null
    },
    currentPlantId: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    lastSeenAt: {
      type: Date,
      default: null,
      index: true
    },
    lastInspectionTime: {
      type: Date,
      default: null
    },
    errorStatus: {
      hasError: {
        type: Boolean,
        default: false
      },
      errorMessage: {
        type: String,
        default: ''
      },
      errorDetails: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      reportedAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true
  }
);

robotSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.apiKeyHash;
  delete obj.__v;
  return obj;
};

const Robot = mongoose.model('Robot', robotSchema);
module.exports = Robot;
