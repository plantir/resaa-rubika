const dbConf = require('../config/db.config')
const redis = dbConf.redis
const request = require('request-promise');
const fs = require('fs')
const bot_token = 'DG0RIQVKTTKCUEUGURNGOHBLWULTSSQFHISIFXGXDACBMGZFWKDWNBLZKQLFSJDY'
const doctor_bot_api = process.env.NODE_ENV === 'development' ? 'http://localhost:8888' : 'http://doctorbottelegram.bsn.local'
class User {

    constructor(chatId) {
        this.API_URL = process.env.NODE_ENV === 'development' ? 'https://webapi.resaa.net' : 'http://resa-web-api.bsn.local';
        this.chatId = chatId;
    }
    get state() {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_state", (err, state) => {
                resolve(state)
            })
        })
    }
    set state(state) {
        redis.set(this.chatId + "_state", state)
    }
    get phone() {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_phone", (err, phone) => {
                resolve(phone)
            })
        })
    }
    set phone(phone) {
        redis.set(this.chatId + "_phone", phone)
    }
    get token() {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_token", (err, token) => {
                resolve(token)
            })
        })
    }
    set token(token) {
        redis.set(this.chatId + "_token", token)
    }
    get subscribe() {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_subscribe", (err, subscribe) => {
                resolve(subscribe)
            })
        })
    }
    set subscribe(subscribe) {
        redis.set(this.chatId + "_subscribe", subscribe)
    }
    get visit_doctor() {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_visit_doctor", (err, visit_doctor) => {
                resolve(visit_doctor)
            })
        })
    }
    set visit_doctor(visit_doctor) {
        redis.set(this.chatId + "_visit_doctor", visit_doctor)
    }
    get last_visit_doctor() {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_last_visit_doctor", (err, doctor) => {
                if (!doctor) {
                    return resolve(null)
                }
                resolve(JSON.parse(doctor))
            })
        })
    }
    set last_visit_doctor(doctor) {
        redis.set(this.chatId + "_last_visit_doctor", JSON.stringify(doctor))
    }

    register(phoneNumber) {
        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                uri: `${this.API_URL}/rubika/Patients/Registration`,
                body: {
                    phoneNumber
                },
                json: true,
            }).then(res => {
                this.phone = phoneNumber;
                resolve(true)
            }).catch(err => {
                if (err.error.code == 409) {
                    this.phone = phoneNumber;
                    reject("شما با این شماره موبایل قبلا ثبت نام کرده بودید و با موفقیت وارد شدید");
                } else {
                    reject("خطایی رخ داده است لطفا بعدا امتحان کنید")
                }
            })
        })
    }
    charge(phoneNumber, chat_id, amount) {
        return new Promise((resolve, reject) => {

            resolve(true)
        })
    }
    payment_token(phoneNumber, chatId, amount) {

        return new Promise((resolve, reject) => {
            request({
                method: 'POST',
                uri: `${this.API_URL}/Rubika/Charge`,
                body: {
                    phoneNumber,
                    chatId,
                    amount
                },
                json: true,
            }).then(res => {
                resolve(res.result.paymentToken)
            }).catch(err => {
                reject(err)
            })
        })
    }
    static payment_verify(orderId) {
        let model = new User()
        return request.put(`${model.API_URL}/Rubika/Charge/Verify?orderId=${orderId}`)
    }
    push_history({
        text,
        body
    }) {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_state_history", async (err, state_history) => {
                if (state_history) {
                    state_history = JSON.parse(state_history)
                } else {
                    state_history = []
                }
                let state = await this.state;
                state_history.push({
                    state,
                    text,
                    body
                })
                state_history = JSON.stringify(state_history);
                redis.set(this.chatId + "_state_history", state_history, (err, succsess) => {
                    if (succsess) {
                        return resolve(succsess)
                    }
                    if (err) {
                        return reject(err)
                    }
                })
            })
        })
    }
    pop_history() {
        return new Promise((resolve, reject) => {

            redis.get(this.chatId + "_state_history", (err, state_history) => {
                if (!state_history) {
                    return resolve(null)
                }
                state_history = JSON.parse(state_history)
                state_history.pop();
                let last_history = state_history.pop()
                state_history = JSON.stringify(state_history)
                redis.set(this.chatId + "_state_history", state_history, (err, succsess) => {
                    if (succsess) {
                        return resolve(last_history)
                    }
                    if (err) {
                        return reject(err)
                    }
                })
            })
        })
    }
    reset_state_history() {
        let state_history = JSON.stringify([])
        redis.set(this.chatId + "_state_history", state_history)
    }
    start_video() {
        redis.get("start_video_file", (err, file_id) => {
            if (file_id) {
                return resolve(file_id)
            }
            request({
                method: "GET",
                url: "https://botapi.rubika.ir",
                headers: {
                    "bot_key": bot_token,
                    "Content-Type": "application/json"
                },
                json: true,
                body: {
                    "method": "requestUploadFile",
                    "data": {
                        "file_name": "start.png",
                        "type": "File"
                    }
                }
            }).then(res => {

                fs.createReadStream('./resaa_bot/assets/start.mp4').pipe(request.post(res.data.upload_url, {
                    headers: {
                        'bot-token': bot_token,
                        'file-id': res.data.file_id,
                        'hash-send-file': res.data.hash_send_file,
                    },
                    // body: 'test'

                }, (err, res, body) => {}));
            })
        })
    }
    add_file(file_url) {
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_testAnswer_files", (err, testAnswers) => {
                if (testAnswers && testAnswers !== 'null') {
                    testAnswers = JSON.parse(testAnswers)
                } else {
                    testAnswers = []
                }
                testAnswers.push(file_url);
                testAnswers = JSON.stringify(testAnswers)
                redis.set(this.chatId + "_testAnswer_files", testAnswers, (err, succsess) => {
                    if (succsess) {
                        return resolve(JSON.parse(testAnswers))
                    }
                    if (err) {
                        return reject(err)
                    }
                })
            })
        })
    }
    remove_files() {
        return new Promise((resolve, reject) => {
            redis.set(this.chatId + "_testAnswer_files", null, (err, succsess) => {
                if (succsess) {
                    return resolve()
                }
                if (err) {
                    return reject(err)
                }
            })
        })
    }
    send_testAnswer(doctor_chat_id) {
        if (process.env.NODE_ENV == 'development') {
            doctor_chat_id = 96852497;
        }
        return new Promise((resolve, reject) => {
            redis.get(this.chatId + "_testAnswer_files", (err, testAnswers) => {
                if (!testAnswers && testAnswers == 'null') {
                    return reject('شما فایلی برای ارسال ندارید لطفا مراحل ارسال جواب آزمایش را مجددا طی کنید')
                }
                testAnswers = JSON.parse(testAnswers)
                request({
                    url: `${doctor_bot_api}/testAnswer`,
                    method: 'POST',
                    body: {
                        testAnswers,
                        chat_id: doctor_chat_id
                    },
                    json: true
                }).then(res => {
                    this.remove_files()
                    resolve(res)
                }).catch(err => {
                    reject('درخواست شما با مشکل مواجه شد لطفا مجددا تلاش کنید')
                })
            })
        })

    }
}

module.exports = User;