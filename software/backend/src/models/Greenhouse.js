const mongoose = require('mongoose');

const greenhouseSchema = new mongoose.Schema(
  {
    greenhouseId: {
      type: String,
      required: [true, 'Greenhouse ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true
    },
    name: {
      type: String,
      required: [true, 'Greenhouse name is required'],
      trim: true,
      maxlength: [120, 'Name cannot exceed 120 characters']
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Facility'
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'maintenance', 'inactive'],
        message: '{VALUE} is not a valid greenhouse status'
      },
      default: 'active',
      index: true
    }
  },
  {
    timestamps: true
  }
);

greenhouseSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.__v;
  return obj;
};

const Greenhouse = mongoose.model('Greenhouse', greenhouseSchema);
module.exports = Greenhouse;
