// const dbConf = require('../config/db.config');
// const redis = dbConf.redis;
const request = require('../provider/request');

const bot_token =
  'DG0RIQVKTTKCUEUGURNGOHBLWULTSSQFHISIFXGXDACBMGZFWKDWNBLZKQLFSJDY';
const dbConf = require('../config/db.config');
const redis = dbConf.redis;
const _ = require('lodash');
class Doctor {
  constructor() {
    this.API_URL =
      process.env.NODE_ENV === 'development'
        ? 'https://webapi.resaa.net'
        : 'http://resa-web-api.bsn.local';
    this.fields = 'subscriberNumber,firstName,lastName,currentlyAvailable';
  }

  static get_doctors({ limit = 100, offset = 0, specialtyId, code, name }) {
    let model = new Doctor();
    let uri = `${model.API_URL}/Doctors?fields=${
      model.fields
    }&limit=${limit}&offset=${offset}`;
    if (specialtyId) {
      uri += `&specialtyId=${specialtyId}`;
    }
    if (code) {
      uri += `&code=${code}`;
    }
    if (name) {
      uri += `&name=${name}`;
    }
    return new Promise((resolve, reject) => {
      // console.time('get_doctor_list_from_api');
      request({
        method: 'GET',
        json: true,
        uri: encodeURI(uri)
      })
        .then(res => {
          // console.timeEnd('get_doctor_list_from_api');
          console.time('sort_random_doctors');
          let available = res.result.doctors.filter(
            item => item.currentlyAvailable
          );
          let notavailable = res.result.doctors.filter(
            item => !item.currentlyAvailable
          );
          let doctors = _.sampleSize(available, limit);
          if (doctors.length < limit) {
            doctors.push(..._.sampleSize(notavailable, limit - doctors.length));
          }
          console.timeEnd('sort_random_doctors');
          resolve(doctors);
        })
        .catch(err => reject(err));
    });
  }
  static find(id) {
    let model = new Doctor();
    let uri = `${
      model.API_URL
    }/Doctors/${id}?fields=id,firstName,lastName,currentlyAvailable,subscriberNumber,specialty,tags,expertise,timetable,title,workplaces,providesDiagnosticDocumentsService&clientTimeZoneOffset=-210`;
    return request({
      method: 'GET',
      json: true,
      uri: uri
    });
  }
  static get_speciality_list() {
    return new Promise((resolve, reject) => {
      redis.get(`speciality_list`, async (err, specialities) => {
        if (specialities) {
          return resolve(JSON.parse(specialities));
        } else {
          let model = new Doctor();
          let res = await request({
            method: 'GET',
            json: true,
            uri: `${model.API_URL}/Rubika/Doctors/MedicalSpecialties`
          });
          redis.set(
            `speciality_list`,
            JSON.stringify(res.result.medicalSpecialties)
          );
          return resolve(res.result.medicalSpecialties);
        }
      });
    });
  }
  static get_time_price(id, phone) {
    let model = new Doctor();
    return request({
      method: 'GET',
      json: true,
      uri: `${
        model.API_URL
      }/Rubika/Doctors/${id}/communicationquote?patientphonenumber=${phone}`
    });
  }
  static image_id(doctor_id) {
    let model = new Doctor();
    return new Promise((resolve, reject) => {
      redis.get(`doctor_${doctor_id}_image`, (err, file_id) => {
        if (file_id) {
          return resolve(file_id);
        } else {
          request({
            method: 'GET',
            url: 'https://botapi.rubika.ir',
            headers: {
              bot_key: bot_token,
              'Content-Type': 'application/json'
            },
            json: true,
            body: {
              method: 'requestUploadFile',
              data: {
                file_name: 'doctor.png',
                type: 'Image'
              }
            }
          }).then(res => {
            request
              .get(`${model.API_URL}/Doctors/${doctor_id}/Image`, {
                encoding: null
              })
              .pipe(
                request.post(
                  res.data.upload_url,
                  {
                    headers: {
                      'bot-token': bot_token,
                      'file-id': res.data.file_id,
                      'hash-send-file': res.data.hash_send_file
                    }
                  },
                  (err, resp, body) => {
                    body = JSON.parse(body);
                    if (body.status === 'OK') {
                      redis.set(`doctor_${doctor_id}_image`, res.data.file_id);
                      return resolve(res.data.file_id);
                    }
                    reject();
                  }
                )
              );
          });
        }
      });
    });
  }
  static request_test_answer(id, phone) {
    return new Promise((resolve, reject) => {
      let model = new Doctor();
      return request({
        method: 'GET',
        json: true,
        uri: `${
          model.API_URL
        }/Rubika/Doctors/${id}/DiagnosticDocumentsService/Quote?patientPhoneNumber=${phone}`
      })
        .then(res => {
          let status = res.result.quote.status;
          let request_price = res.result.quote.costPerRequest;
          switch (status) {
            case 0:
              resolve({
                status: 'ok',
                request_price: request_price
              });
              break;
            case 1:
              resolve({
                status: 'ServiceUnavailable'
              });
              break;
            case 2:
              resolve({
                status: 'needTalk',
                request_price: request_price
              });
              break;
            case 3:
              resolve({
                status: 'needMoney',
                request_price: request_price
              });
              break;
          }
        })
        .catch(err => {
          reject({
            err
          });
        });
    });
  }
}

module.exports = Doctor;
