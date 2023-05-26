let cache = {};
let isURL = url=>/^http(|s):\/\//.test(url);
let isFB = url => /^http(|s):\/\/([^]*)(facebook|fb)\.(com|watch)\//.test(url);


exports.info = {
  title: 'Facebook',
  path: '/fb/:type',
  desc: 'fb download',
  example_url: [
    {
    method: 'GET',
    query: '/info-post?url=https://www.facebook.com/100772132293412/posts/pfbid02Vm1hXWQJ7qT2VQxP7rUWPhymCoxtZaXBFuRB2oavPMt4H4TGC18moCVU3TLGmzt5l/',
    desc: 'lấy src (photo, video) từ link bài đăng',
    }
  ],
};
exports.methods = {
  get: async(req, res, next)=> {
  let rep = (data, status = 200)=>res.status(status).send(data);
  let type = req.params.type;
try {
  let url = req.url.slice(req.url.indexOf('url=') + 4);
  if (!url || !isURL(url)) return rep(`Chưa Nhập Liên Kết Bài Đăng.`, 400);
  if (!isFB(url)) return rep(`Liên Kết Chưa Xác Định.`); if (/story\.php/.test(url)) url = url.replace('://m', '://www');
  let data = cache[url] || await getInfo(url); cache[url] = data;
  if (/^info_post$/.test(type)) {
    let clude = (req.query.clude || '').split(',').map($ => $.split(/\[|\]|\./));
    let out = allValueByKey(data, clude);

    clude.forEach((key, i, o, d = out[key[0]]) => d.length == 0 ? out[key[0]] = null : out[key[0]] = eval(`(()=>(d${(key[1] ? key.splice(1) : [0]).filter($ => $ != '').map($ => `?.['${$}']`).join('')} || null))();`))

    return rep(clude == 0 ? data : out);
  };
  if (/^info-post$/.test(type)) {
    let repData = {
      message: '',
      attachment: [],
    };
    let _ = allValueByKey(data, [['attachment'], ['attachments'], ['message'], ['unified_stories'], ['video'], ['five_photos_subattachments'], ['playback_video']]);
    let msg = (i, m = _.message) => m?.[i]?.story?.message?.text || m?.[i]?.text;
    repData.message = msg(2) || msg(0) || null;

    if (/(\/reel\/|watch)/.test(url)) {
      if (_.attachments.length > 0 && typeof _.attachments?.[0]?.[0]?.media == 'object') repData.attachment.push(_.attachments?.[0]?.[0]?.media || _.playback_video?.[0]); else if (_.video.length > 0) repData.attachment.push((_.video[0].__typename = 'Video', _.video[0]) || _.playback_video?.[0]);
      if (!repData.attachment[0]?.playable_url_quality_hd) {
        _.playback_video[0].__typename = 'Video';
        repData.attachment[0] = _.playback_video?.[0];
      };
    };
    if (/\/stories\//.test(url)) {
      for (let i of _.unified_stories) for (let e of i.edges) {
        let media_story = e?.node?.attachments?.[0]?.media;

        if (!!media_story) repData.attachment.push(media_story);
      };
    };
    if (/\/((posts|permalink|videos)\/|story\.php)/.test(url)) {
      let a = _.attachment;
      let fpsa = _.five_photos_subattachments[0]?.nodes;
      let b = a?.[0]?.all_subattachments?.nodes || (fpsa?.[0] ? fpsa : fpsa) || (a?.[0] ? [a[0]] : []);
      repData.attachment.push(...b.map($ => {
        if (typeof $ != 'object') $ = {};
        let vd = $?.media?.video_grid_renderer;

        if (!!vd) delete $.media.video_grid_renderer;

        return {
          ...$.media,
          ...(vd?.video || {}),
        };
      }));
      if (_.attachments.length > 0) repData.attachment.push(_.attachments?.[0]?.[0]?.media || _.playback_video?.[0]);
    };
    repData.attachment = repData.attachment.filter($ => !!$).map($ => newObjByKey($, ['__typename', 'id', 'preferred_thumbnail', 'playable_url', 'playable_url_quality_hd', 'image', 'photo_image', 'owner']));
    rep(repData);
  };
    }catch(e){
      console.log(e);
      rep('Error', 500);
    };
},
};
function getInfo(url) {
  return fetch(url, {
    headers: {
      "accept": "text/html, application/xhtml+xml, application/xml;q=0.9, */*;q=0.8",
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-User': '?1',
      "encoding": "gzip",
      "cookie": "sb=-GB8Y0WAJZkkwPZ7DUIWKY4T;datr=BAFdZDdR3pDgrLlkOWiPVnGz;wd=1360x667;c_user=100078739216185;xs=2%3At7EbAWf44OSo3Q%3A2%3A1684386157%3A-1%3A6276;fr=0fkLtnsZc8yOWSEVU.AWUY0i26zMoCIyMB-Jw6aaWjpBs.BkXMLH.MH.AAA.0.0.Bka2Yc.AWWot7cLqIU;",
      "user-agent": "Mike ozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.198 Safari/537.36",
    },
  }).then(res => res.text()).then(text => text.split(/data\-sjs>|<\/script>/).filter($ => /^\{"require":/.test($)).map($ => JSON.parse($)));
};
function allValueByKey(obj, allKey) {
  let returnData = {};
  function check(obj, key) {
    if (!returnData[key]) returnData[key] = [];
    for (let $ of Object.entries(obj)) {
      if ($[0] == key && !returnData[key].some($1 => JSON.stringify($1) == JSON.stringify($[1]))) returnData[key].push($[1]);
      if (!!$[1] && typeof $[1] == 'object') check($[1], key);
    };
  };
  allKey.forEach($ => check(obj, $[0]));

  return returnData;
};
function newObjByKey(obj, key) {
  let data = {};

  for (let $ of key) if (!!obj[$]) data[$] = obj[$];

  return data;
};