let axios = require('axios');

exports.info = {
  title: 'home',
  path: '/danbooru',
  desc: '',
  example_url: [
    {
    method: 'GET',
    query: '?query=tag&l=1',
    desc: 'tìm ảnh',
    }
  ],
};
exports.methods = {
  get: async(req, res, next)=> {
    var {
      query,
      l = 10,
    } = req.query;
    if (!query) return res.json({
      error: "Thiếu query"
    });
    //var gioihan = limit || "50"
    new Promise(async a=> {
      let resolve = [];
      for (let i = 0; i < l; i++)try {
        let danbooru = await axios({
          method: 'get',
          url: 'https://danbooru.donmai.us/posts.json?tags='+ encodeURI(query).replace("%20", "_") +'&z=1&limit=200' +`page=${i}`,
          headers: {
            'Content-Type': 'application/json'
          }
        });
        resolve.push(...danbooru.data);
      } catch(e) {
        continue;
      };
      a(resolve);
    })
    .then(data=> {
      let link = [];
      let map = data.map($=>$.large_file_url).filter($=>!!$);

      map.forEach($=>link.includes($)?'': link.push($));
      res.send({
        count: link.length, data: link,
      })
    });

  },
};