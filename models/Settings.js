import mongoose from 'mongoose';

const SettingsSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { timestamps: true }
);

const Settings = mongoose.models.Settings || mongoose.model('Settings', SettingsSchema);

export default Settings;

// Helper: get setting by key
export async function getSetting(key, defaultValue = null) {
  const doc = await Settings.findOne({ key }).lean();
  return doc ? doc.value : defaultValue;
}

// Helper: set setting by key
export async function setSetting(key, value) {
  return Settings.findOneAndUpdate(
    { key },
    { value },
    { upsert: true, new: true }
  );
}
