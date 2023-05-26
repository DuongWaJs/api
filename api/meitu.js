const axios = require('axios');
const FormData = require('form-data');

exports.info = {
  title: 'Meitu',
  path: '/meitu/:type',
  desc: 'Meitu AI',
  example_url: [
  {
    method: 'GET',
    query: '/image-v2?url=https://bedental.vn/wp-content/uploads/2022/11/hot-girl.jpg',
    desc: 'chuyển đổi hình ảnh qua anime',
  },
  {
    method: 'GET',
    query: '/video?url_1=https://bedental.vn/wp-content/uploads/2022/11/hot-girl.jpg&url_2=https://bedental.vn/wp-content/uploads/2022/11/hot-girl.jpg',
    desc: '',
  }
  ],
};
exports.methods = {
  get: async(req, res, next)=> {
    switch (req.params.type) {
      case 'image-v2': {
        var url = req.query.url;
        if (!url) return res.send('Error');
        var timeStart = new Date().getTime();
        var prompt = req.query.prompt;
        var image = await createImageV2(url, prompt);
        if (image == 404) return res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        })
        var result = {
          error: false,
          message: "Thành công",
          image: image
        };
        result.timeProcess = new Date().getTime() - timeStart;
        return res.json(result);
      };
        break;
      case 'image-restoration': {
        var url = req.query.url;
        if (!url) return res.send('Error');
        var timeStart = new Date().getTime();
        var data = await image_restoration(url);
        if (data == 404) return res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        })
        var result = {
          error: false,
          message: "Thành công",
          data: data.media_info_list[0]
        };
        result.timeProcess = new Date().getTime() - timeStart;
        return res.json(result);
      };
        break;
      case 'image': {
        var url = req.query.url;
        if (!url) return res.send('Error');
        var timeStart = new Date().getTime();
        var image = await createImage(url)
        if (image == 404 || image.error_code != 0) return res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        })
        var result = {
          error: false,
          message: "Thành công",
          image: image.data
        }
        result.timeProcess = new Date().getTime() - timeStart;
        return res.json(result);
      };
        break;
      case 'video': {
        var type = req.query.type;
        if (!type) type = 7;
        var url = req.query.url_1;
        var url2 = req.query.url_2;
        if (!url) return res.send('Error');
        var image = await createVideo(type, url, url2);
        console.log(image)
        return image.error_code == 0 ? res.json({
          error: false,
          message: "Thành công",
          video: image.data.video_url
        }): res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        });
      };
        break;

    }
  },
  post: async(req, res, next)=> {
    switch (req.params.type) {
      case 'image-v2': {
        var url = req.body.url;
        if (!url) return res.send('Error');
        var timeStart = new Date().getTime();
        var prompt = req.body.prompt;
        var image = await createImageV2(url, prompt);
        if (image == 404) return res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        })
        var result = {
          error: false,
          message: "Thành công",
          image: image
        };
        result.timeProcess = new Date().getTime() - timeStart;
        return res.json(result);
      };
        break;
      case 'image': {
        var url = req.body.url;
        if (!url) return res.send('Error');
        var timeStart = new Date().getTime();
        var image = await createImage(url)
        if (image == 404 || image.error_code != 0) return res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        })
        var result = {
          error: false,
          message: "Thành công",
          image: image.data
        }
        result.timeProcess = new Date().getTime() - timeStart;
        return res.json(result);
      };
        break;
      case 'video': {
        var type = req.query.type;
        if (!type) type = 7;
        var url = req.body.url_1;
        var url2 = req.body.url_2;
        if (!url) return res.send('Error');
        var image = await createVideo(type, url, url2);
        console.log(image)
        return image.error_code == 0 ? res.json({
          error: false,
          message: "Thành công",
          video: image.data.video_url
        }): res.json({
          error: true,
          message: "Url không hợp lệ hoặc server đang bị lỗi"
        });
      };
        break;
    }
  },
};

function base64toBytesArray(base64) {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

const headers = {};

async function createImage(url) {
    try {
        url = await getUrlMeitu(url);
    } catch (error) {
        return 404;
    }
    const formData = new FormData();
    const fields = {
        equipment: 'google_G011A,25,900X1600,256',
        build: '52228',
        data_protected: 'false',
        version: '9.8.0.8',
        gnum: '2898075657',
        gid: '2898075657',
        client_id: '1089867602',
        previous_version: '9.8.0.8',
        client_channel_id: 'google',
        client_language: 'vi',
        country_code: 'VN',
        effect: 'ai_draw',
        type: '4',
        url,
    };
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    const str = formData.getBuffer().toString('base64');
    const data = base64toBytesArray(str);
    const { length, ['content-type']: contentType } = formData.getHeaders();
    headers["content-length"] = length;
    headers["content-type"] = contentType;
    try {
        const { data: response } = await axios.post("https://ai.xiuxiu.meitu.com/v1/tool/mtlab/ai_draw_online.json", data, {
            headers
        });
        return response;
    } catch (error) {
        return 404;
    }
}

async function createVideo(type = "7", url_original, url_effect) {
    if (type < 1 || type > 7) return 404;
    try {
        url_original = await getUrlMeitu(url_original);
    }
    catch (error) {
        return 404;
    }
    const formData = new FormData();
    const fields = {
        equipment: "google_G011A,25,900X1600,256",
        build: "52228",
        data_protected: "false",
        version: "9.8.0.8",
        gnum: "2898075657",
        gid: "2898075657",
        client_id: "1089867602",
        previous_version: "9.8.0.8",
        client_channel_id: "google",
        client_language: "vi",
        country_code: "VN",
        ori_img: url_original,
        formula_id: "000" + type,
        effect_img: url_effect
    };
    Object.entries(fields).forEach(([key, value]) => formData.append(key, value));
    const str = formData.getBuffer().toString('base64');
    const data = base64toBytesArray(str);
    headers["content-length"] = data.length;
    headers["content-type"] = formData.getHeaders()['content-type'];

    return axios.post("https://ai.xiuxiu.meitu.com/v1/tool/mtlab/video_formula_online.json", data, {
            headers
        })
        .then(response => response.data)
        .catch(error => Promise.reject(error));
}

async function getUrlMeitu(url) {
    const response = await axios.post('https://openflow.mtlab.meitu.com/open/putbase64?api_key=0082e88c30754678adb210f95b4f83d4&type=1', await getBytesArrayImage(url), {
        headers: {
            'authorization': '0082e88c30754678adb210f95b4f83d4',
            'content-type': 'application/octet-stream',
        }
    });
    return response.data.key;
}

async function createImageV2(url, prompt = "(beautiful detailed eyes),(sunlight),(angel),solo,dynamic angle,floating,looking_at_viewer,wings,halo,Floating white silk,(Holy Light),just like silver stars imploding we absorb the light of day") {
    try {
        const image = await getBytesArrayImage(url);
        const str = {
            "parameter": {
                "rsp_media_type": "png",
                "extra_prompt": prompt,
                "type_generation": false,
                "strength": 0.45000000000000001,
                "guidance_scale": 7.5,
                "num_inference_steps": 50,
                "prng_seed": 10,
                "enable_sr": true,
                "sr_mode": 2
            },
            "media_info_list": [{
                "media_extra": {},
                "media_profiles": {
                    "media_data_type": "png"
                },
                "media_data": image
            }],
            "extra": {}
        };
        const bs64 = Buffer.from(JSON.stringify(str)).toString('base64');
        const response = await axios({
            method: 'post',
            url: 'https://openapi.mtlab.meitu.com/v1/stable_diffusion_anime?api_key=0082e88c30754678adb210f95b4f83d4&api_secret=844cf80fd49b4524a5a778292297dfbe',
            headers: {
                'phone_gid': '2898075657',
                'user-agent': 'mtxx-9808-google-G011A-android-7.1.2-fd42b1fc',
                'content-type': 'application/json; charset=utf-8',
            },
            data: base64toBytesArray(bs64)
        });
        return response.data.media_info_list[0].media_data;
    } catch (error) {
        return 404;
    }
}

async function getBytesArrayImage(url) {
    const response = await axios.get(url, {
        responseType: 'arraybuffer'
    });
    return Buffer.from(response.data).toString('base64');
}

async function image_restoration(url) {
    try {
        var data = await getBytesArrayImage(url);
        var str = {
            "media_info_list": [{
                "media_data": data,
                "media_profiles": {
                    "media_data_type": "png"
                }
            }],
            "parameter": {
                "ir_mode": 4,
                "rsp_media_type": "png"
            }
        }
        var bs64 = Buffer.from(JSON.stringify(str)).toString('base64');
        var get = await axios.post("https://openapi.mtlab.meitu.com/v2/image_restoration?api_key=e98cb512e0a1478e8425ac21c67a9134&api_secret=d650731c221a48ab8d6141f45271d083", base64toBytesArray(bs64), {
            headers: {
                'phone_gid': '2898075657',
                'user-agent': 'mtxx-9808-google-G011A-android-7.1.2-fd42b1fc',
                'content-type': 'application/json; charset=utf-8',
            }
        });
        return get.data;
    }
    catch (error) {
        return 404;
    }
    
}
