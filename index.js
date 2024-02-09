require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const dns = require('dns');
const mongoose = require('mongoose');

const mongoUri = process.env['MONGO_URI']

mongoose.connect(mongoUri, {});

const urlSchema = new mongoose.Schema({
  original_url: { type: String, required: true },
  short_url: Number
});

const Url = mongoose.model('Url', urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});



app.post("/api/shorturl", (req, res) => {
  const url = req.body.url;

   var urlPattern = /^(https?:\/\/)?([\w.]+)\.([a-z]{2,})(:\d{1,5})?\/?$/i;

  if (!urlPattern.test(url)){
    res.json({ error: 'invalid url' });
  } 
  const shortUrl = Math.floor(Math.random() * 10000);
  const newUrl =  new Url({original_url: url, short_url: shortUrl});
  newUrl.save().then(savedUrl => {
    res.json({original_url: savedUrl.original_url, short_url: savedUrl.short_url});;
  });
  
});;



app.get("/api/shorturl/:shortUrl", async (req, res) => {
    const shortUrl = req.params.shortUrl;
    const query = Url.where({ short_url: shortUrl });
    const url = await query.findOne();
    const original_url = url.original_url;
    res.redirect(original_url);
});;

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
