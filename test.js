const rp = require('request-promise');

function request(option) {
  console.log(option);
}
request.get = () => {
  console.log('get');
};
// class request {
//   static constructor(option) {
//     console.log(option);
//   }
// }
request.get();
