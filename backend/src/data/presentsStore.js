const Present = require('../models/Present');

async function getPresents() {
  return Present.find().sort({ createdAt: -1 });
}

async function getPresentById(id) {
  return Present.findById(id);
}

async function markAsBought(id, buyerName) {
  const present = await Present.findById(id);
  if (!present) return null;
  if (present.bought) return { error: 'This present has already been bought' };
  
  present.bought = true;
  present.buyerName = buyerName;
  present.boughtAt = new Date();
  await present.save();
  return present;
}

async function addPresent(data) {
  const present = new Present({
    name: data.name,
    description: data.description,
    price: parseFloat(data.price),
    photo: data.photo,
    url: data.url
  });
  await present.save();
  return present;
}

async function deletePresent(id) {
  return Present.findByIdAndDelete(id);
}

async function releasePresent(id) {
  const present = await Present.findById(id);
  if (!present) return null;
  if (!present.bought) return { error: 'This present is not bought' };
  
  present.bought = false;
  present.buyerName = undefined;
  present.boughtAt = undefined;
  await present.save();
  return present;
}

async function updatePresent(id, updates) {
  return Present.findByIdAndUpdate(id, {
    name: updates.name,
    description: updates.description,
    price: updates.price ? parseFloat(updates.price) : undefined,
    photo: updates.photo,
    url: updates.url
  }, { new: true });
}

module.exports = { getPresents, getPresentById, markAsBought, addPresent, deletePresent, releasePresent, updatePresent };
