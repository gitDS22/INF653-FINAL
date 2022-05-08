const fs = require ('fs');
const path = require('path');

const stateJSONData = JSON.parse(fs.readFileSync(path.join(__dirname, 'states.json')));

module.exports = {stateJSONData};