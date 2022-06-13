#!/usr/bin/env node
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const express = require('express');
const util = require('util');

var app = express();
var port = process.env.PORT || 3000;


var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static(__dirname + '/html'));

app.get('/dl', function (req, res) {
    let dlUrl = req.query.url;

    let title = req.query.title;
    let artist = req.query.artist;
    let album = req.query.album;

    let ip;
    if (process.env.PROXY_HEADER_REAL_IP_KEY){
        ip = req.get(process.env.PROXY_HEADER_REAL_IP_KEY);
    } else {
        ip = req.connection.remoteAddress;
    }

    console.info(new Date().toISOString(), '[IP:' + ip + ']', '-',
        'start downloading', title, 'from', dlUrl);

    let stream = ytdl(dlUrl, {
        quality: 'highestaudio'
    });

    res.attachment(title + '.mp3');

    let output = ffmpeg(stream)
        .audioBitrate('320k')
        .audioFrequency(44100)
        .audioChannels(2)
        .audioCodec('libmp3lame')
        .format('mp3')
        .on('error', (err) => console.error(err))
        .withOutputOption('-metadata', util.format('title=%s', title));



    if (artist) {
        output.withOutputOption('-metadata',
            util.format('artist=%s', artist));
    }
    if (album) {
        output.withOutputOption('-metadata',
            util.format('album=%s', album));
    }
    output.pipe(res, {end: true});
});

app.listen(port, () => {
    console.info('Listening on port', port);
});

// for testing purposes
module.exports = app;
