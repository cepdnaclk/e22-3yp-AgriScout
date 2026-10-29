const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    inspectionId: {
      type: String,
      required: [true, 'Inspection ID is required'],
      unique: true,
      trim: true,
      index: true
    },
    robotId: {
      type: String,
      required: [true, 'Robot ID is required'],
      trim: true,
      uppercase: true,
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
      required: [true, 'Plant ID is required'],
      trim: true,
      uppercase: true,
      index: true
    },
    timestamp: {
      type: Date,
      required: [true, 'Inspection timestamp is required'],
      default: Date.now,
      index: true
    },
    // NPK Soil nutrient readings in mg/kg.
    // Explicit null indicates sensor measurement was unavailable (distinguished from 0).
    npkValues: {
      nitrogen: {
        type: Number,
        default: null,
        min: [0, 'Nitrogen value cannot be negative']
      },
      phosphorus: {
        type: Number,
        default: null,
        min: [0, 'Phosphorus value cannot be negative']
      },
      potassium: {
        type: Number,
        default: null,
        min: [0, 'Potassium value cannot be negative']
      },
      unit: {
        type: String,
        default: 'mg/kg'
      },
      sensorStatus: {
        type: String,
        enum: ['measured', 'unavailable', 'error'],
        default: 'unavailable'
      }
    },
    // Optional environmental soil readings
    soilTemperature: {
      type: Number,
      default: null // Celsius
    },
    soilMoisture: {
      type: Number,
      default: null // Percentage
    },
    // Leaf image storage URL / path reference
    leafImageUrl: {
      type: String,
      default: null
    },
    // AI disease prediction results
    aiPrediction: {
      disease: {
        type: String,
        default: 'Unknown'
      },
      confidence: {
        type: Number,
        min: 0,
        max: 1,
        default: 0
      },
      modelVersion: {
        type: String,
        default: 'none'
      },
      status: {
        type: String,
        enum: ['detected', 'uncertain', 'not_configured', 'error'],
        default: 'not_configured'
      },
      rawProbabilities: {
        type: Map,
        of: Number,
        default: {}
      }
    },
    inspectionStatus: {
      type: String,
      enum: ['completed', 'flagged', 'pending_review'],
      default: 'completed',
      index: true
    },
    uploadMetadata: {
      uploadedAt: {
        type: Date,
        default: Date.now
      },
      clientTimestamp: {
        type: Date,
        default: null
      },
      isOfflineQueued: {
        type: Boolean,
        default: false
      },
      retryCount: {
        type: Number,
        default: 0
      }
    }
  },
  {
    timestamps: true
  }
);

// Indexes for fast querying & time-series aggregation
inspectionSchema.index({ plantId: 1, timestamp: -1 });
inspectionSchema.index({ greenhouseId: 1, timestamp: -1 });
inspectionSchema.index({ robotId: 1, timestamp: -1 });

inspectionSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Inspection = mongoose.model('Inspection', inspectionSchema);
module.exports = Inspection;
