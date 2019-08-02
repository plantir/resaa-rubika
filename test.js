const request = require('request-promise');

request
  .get('https://webapi.resaa.net/Rubika/Doctors/MedicalSpecialties')
  .then(res => console.log(res))
  .catch(err => console.log(err));
