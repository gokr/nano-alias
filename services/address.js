const models = require('../models');
const xrbRegex = /((?:xrb_[13][a-km-zA-HJ-NP-Z0-9]{59})|(?:nano_[13][a-km-zA-HJ-NP-Z0-9]{59}))/;
const jdenticon = require("jdenticon");
const config = require('../config.json');
const crypto = require('crypto');
const hashAvatar = (alias,address) => {
  return crypto.createHmac('sha256', config.privateKey).update(alias+address).digest('hex');
};

let methods = {};

methods.find = (address) => {
  return new Promise((resolve, reject) => {
    if (!address) {
      return reject('No address was provided');
    }
    models.alias
      .findAll({
        where: {
          address: address,
          listed: true,
          registered: true
        }
      })
      .then((aliases) => {
        if (!aliases) { return reject('Could not find any aliases with that address'); }
        let results = [];
        aliases.forEach((alias) => {
          let result = alias.dataValues;
          result.avatar = jdenticon.toSvg(hashAvatar(result.alias,result.address), 64);
          delete result.email;
          delete result.registered;
          delete result.token;
          results.push(result);
        });
        resolve(results);
      })
      .catch((err) => { reject(err); });
  });
};

module.exports = methods;
