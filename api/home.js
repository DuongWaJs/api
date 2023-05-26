exports.info = {
  title: 'home',
  path: '/',
  desc: '',
  example_url: [
    {
    method: 'GET',
    query: '',
    desc: '',
    }
  ],
};
exports.methods = {
  get: async(req, res, next)=> {
    res.send(`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="content-type" content="text/html; charset=utf-8" />
  <title>API</title>
  <script type="text/javascript" charset="utf-8">
    window.onload = ()=> {
      let ws = new WebSocket('wss://api-duong.namvns.repl.co/');

      ws.onopen = ()=>ws.send('{"type":"get_info_api_HTML"}');
      ws.onmessage = msg=>document.getElementById('list').innerHTML = JSON.parse(msg.data).join('');
    };
  </script>
  <style type="text/css" media="all">
    body {
      background-color: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
    }

    .container {
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f6ef;
      box-shadow: 0 2px 4px rgba(0,0,0,1);
    }
    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #594d45;
    }
    #list {
      height: 100vh;
      overflow: scroll;
    }
    .item {
      margin: 10px;
      background-color: #eae5d8;
      border-radius: 5px;
      padding: 10px;
      box-shadow: 0 2px 4px rgba(0,0,0,1);
    }
    .title {
      text-align: center;
      font-size: 18px;
    }
    .example-url {
      word-wrap: break-word; 
      font-size: 14px;
      font-family: Arial, sans-serif;
      background-color: #eae5c0;
      padding: 4px;
      color: #333;
    }
    .example-url a {
      font-weight: bold;
    }
    .example-url a:hover {
      text-decoration: underline;
    }
    .example-url span:nth-child(1) {
      color: #666;
    }
    .example-url mt {
      margin: 5px;
      color: blue;
    }
    .query {
      color: green;
    }
    .param_url {
      color: #339999;
    }
    .desc {
      text-align: center;
      font-size: 15px;
      margin-top: 10px;
      color: #999;
    }
    .desc-url {
      color: #594d45;
    }
    .u {
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>API list</h1>
    <div id="list"></div>
  </div>
</body>
</html>`);
  },
};