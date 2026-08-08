const fs = require('fs');
const https = require('https');

fetch('https://pixabay.com/videos/tunnel-portal-glow-futuristic-84938/')
  .then(res => res.text())
  .then(html => {
    const urls = html.match(/https:\/\/cdn\.pixabay\.com\/video\/[^"'\s]+(?:\.mp4|\?download=1)[^"'\s]*/g);
    
    if (urls && urls.length > 0) {
      console.log('Found URLs:', urls);
      // Clean up the URL in case it has HTML entities
      let videoUrl = urls[0].replace(/&amp;/g, '&');
      console.log('Downloading:', videoUrl);
      
      const file = fs.createWriteStream('tunnel.mp4');
      https.get(videoUrl, function(response) {
        response.pipe(file);
        file.on('finish', function() {
          file.close();
          console.log('Download complete.');
        });
      }).on('error', function(err) {
        fs.unlink('tunnel.mp4', () => {});
        console.error('Download error:', err.message);
      });
    } else {
      console.log('No video URL found in HTML.');
    }
  })
  .catch(err => console.error('Fetch error:', err));
