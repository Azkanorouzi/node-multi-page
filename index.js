const http = require('http');
const fs = require('fs/promises');

// Reading files
const content = {};

async function readFiles() {
  try {
    const [template, home, about, contact, p404] = await Promise.all([
      fs.readFile('./template.html', 'utf8'),
      fs.readFile('./index.html', 'utf8'),
      fs.readFile('./about.html', 'utf8'),
      fs.readFile('./contact.html', 'utf8'),
      fs.readFile('./404.html', 'utf8')
    ]);

    content.temp = template;
    content.home = home;
    content.about = about;
    content.contact = contact;
    content.p404 = p404;
  } catch (err) {
    console.error('Error reading files:', err);
    throw err;
  }
}

const server = http.createServer(async (req, res) => {
  try {
    await readFiles();

    const requestedContent =
      req.url === '/' ? content.home :
      req.url === '/contact' ? content.contact :
      req.url === '/about' ? content.about :
      req.url === 'contact' ? content.contact :
      content.p404;

    if (requestedContent === content.p404)
      res.writeHead(404, {
        'Content-Type': 'text/html'
      });
    else
      res.writeHead(200, {
        'content-type': 'text/html'
      });

    const requestedPage = replaceTemplate(content.temp, requestedContent, req.url);
    res.end(requestedPage);
  } catch (err) {
    console.error('Server error:', err);
    res.writeHead(500, {
      'Content-Type': 'text/plain'
    });
    res.end('Internal Server Error');
  }
});

server.listen(8090, () => {
  console.log('Listening on port 8090');
});

function replaceTemplate(temp, content, location) {
  const result = temp.replace('{$content}', content).replace('{$location}', location);
  return result;
}
