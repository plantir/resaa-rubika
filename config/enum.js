const state = {
  start: 0,
  '0': 'start',
  medical_question: 1,
  '1': 'medical_question',
  search_doctor: 2,
  '2': 'search_doctor',
  select_doctor: 4,
  '4': 'select_doctor',
  doctor_detail: 5,
  '5': 'doctor_detail',
  test_answer: 6,
  '6': 'test_answer',
  call_doctor: 7,
  '7': 'call_doctor'
};
const regex_state = {
  start: /^شروع$|بازگشت به خانه/,
  call_doctor: /تماس با دکتر *.*/,
  charge: /شارژ اعتبار رسا/,
  speciality: /انتخاب پزشکان دیگر|بازگشت به صفحه تخصص ها/,
  my_doctor: /پرسش از پزشک خودم/,
  payment_check: /بررسی وضعیت پرداخت/,
  register: /[98][9][0-3|9][0-9]{8,8}$/
};
module.exports = {
  state,
  regex_state
};
