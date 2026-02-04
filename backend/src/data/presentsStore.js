const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, 'presents.json');

function loadPresents() {
  if (!fs.existsSync(dataPath)) {
    return [];
  }
  const data = fs.readFileSync(dataPath, 'utf-8');
  return JSON.parse(data);
}

function savePresents(presents) {
  fs.writeFileSync(dataPath, JSON.stringify(presents, null, 2));
}

function getPresents() {
  return loadPresents();
}

function getPresentById(id) {
  const presents = loadPresents();
  return presents.find(p => p.id === id);
}

function markAsBought(id, buyerName) {
  const presents = loadPresents();
  const index = presents.findIndex(p => p.id === id);
  
  if (index === -1) return null;
  
  if (presents[index].bought) {
    return { error: 'This present has already been bought' };
  }
  
  presents[index].bought = true;
  presents[index].buyerName = buyerName;
  presents[index].boughtAt = new Date().toISOString();
  
  savePresents(presents);
  return presents[index];
}

function addPresent(presentData) {
  const presents = loadPresents();
  const newPresent = {
    id: String(Date.now()),
    name: presentData.name,
    description: presentData.description,
    price: parseFloat(presentData.price),
    photo: presentData.photo,
    url: presentData.url,
    bought: false
  };
  presents.push(newPresent);
  savePresents(presents);
  return newPresent;
}

function deletePresent(id) {
  const presents = loadPresents();
  const index = presents.findIndex(p => p.id === id);
  if (index === -1) return null;
  const deleted = presents.splice(index, 1)[0];
  savePresents(presents);
  return deleted;
}

module.exports = { getPresents, getPresentById, markAsBought, addPresent, deletePresent };
