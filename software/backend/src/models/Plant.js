const mongoose = require('mongoose');

const plantSchema = new mongoose.Schema(
  {
    plantId: {
      type: String,
      required: [true, 'Plant ID is required'],
      unique: true,
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
    species: {
      type: String,
      required: [true, 'Plant species is required'],
      trim: true,
      default: 'Solanum lycopersicum (Tomato)'
    },
    rowNumber: {
      type: Number,
      required: [true, 'Row number is required'],
      min: [1, 'Row number must be at least 1']
    },
    positionNumber: {
      type: Number,
      required: [true, 'Position number is required'],
      min: [1, 'Position number must be at least 1']
    },
    healthStatus: {
      type: String,
      enum: {
        values: ['healthy', 'warning', 'critical', 'unknown'],
        message: '{VALUE} is not a valid plant health status'
      },
      default: 'unknown',
      index: true
    },
    lastInspectedAt: {
      type: Date,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure uniqueness of plant position in each greenhouse
plantSchema.index({ greenhouseId: 1, rowNumber: 1, positionNumber: 1 }, { unique: true });

plantSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Plant = mongoose.model('Plant', plantSchema);
module.exports = Plant;
