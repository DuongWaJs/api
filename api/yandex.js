const mainAPI = 'https://serpapi.com/'
const keyAPI = [
  "8adb5ee609123e2289db00d46dbfb27a5a6977429d335eda308b899fe5acba2e",
  "e7f4b31ecf50732878461b4453a2aa6c7a773cc68b60010506be80e3c8291969",
  "803898902f62a7494ba00c3fede8fb622137b62d27e26b4dd50a703660add90c"
];
const axios = require('axios');

exports.info = {
  title: 'yandex',
  path: '/yandex',
  desc: '',
  example_url: [
    {
    method: 'GET',
    query: '?keyword=anime',
    desc: '',
    }
  ],
};
exports.methods = {
  get: async(req, res, next)=> {
    try {
      const {
        keyword
      } = req.query;
      var array = [];
      for (var i = 0; i < 10; i++) {
        const get = (await axios.get(`${mainAPI}search.json?engine=yandex_images&p=${i}&text=${encodeURI(keyword)}&api_key=${keyAPI[rn(0, keyAPI.length)]}`)).data;
        if ('error' in get) {
          console.log(`[ ${this.name} ] -> ${get.error}`);
          break;
        };
        const result = get.images_results;
        for (var obj of result) {
          const url = obj.original;
          array.push(url);
        };
      };
      res.json({
        'status': true,
        'result': {
          'url': array
        }
      });
    }
    catch(error) {
      res.json({
        'status': false,
        error
      });
    };
  },
};