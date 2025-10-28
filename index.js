import http from 'http';
import fs from 'fs/promises';
import { XMLBuilder } from 'fast-xml-parser';
import url from 'url';

// Зчитування аргументів командного рядка
const args = process.argv.slice(2);
let inputFile, host, port;

for (let i = 0; i < args.length; i++) {
  switch (args[i]) {
    case '-i':
    case '--input':
      inputFile = args[++i];
      break;
    case '-h':
    case '--host':
      host = args[++i];
      break;
    case '-p':
    case '--port':
      port = parseInt(args[++i]);
      break;
  }
}

if (!inputFile || !host || !port) {
  console.error('Missing required parameter');
  process.exit(1);
}

// Створення сервера
const server = http.createServer(async (req, res) => {
  try {
    const query = url.parse(req.url, true).query;

    // Читання JSON файлу
    const data = await fs.readFile(inputFile, 'utf8');
    const flowers = JSON.parse(data);

    // Фільтрація за мінімальною довжиною пелюстки
    let filtered = flowers;
    if (query.min_petal_length) {
      const min = parseFloat(query.min_petal_length);
      filtered = filtered.filter(f => f["petal.length"] > min);
    }

    // Формування структури для XML
   const result = {
  irises: {
    flower: filtered.map(flower => ({
      petal_length: flower["petal.length"],
      petal_width: flower["petal.width"],
      ...(query.variety ? { variety: flower.variety } : {})
    }))
  }
};
    const builder = new XMLBuilder({ ignoreAttributes: false, format: true });
    const xmlContent = builder.build(result);

    // Відправка відповіді
    res.writeHead(200, { 'Content-Type': 'application/xml; charset=utf-8' });
    res.end(xmlContent);
  } catch (err) {
    if (err.code === 'ENOENT') {
      res.writeHead(404);
      res.end('Cannot find input file');
    } else {
      res.writeHead(500);
      res.end('Internal Server Error');
      console.error(err);
    }
  }
});

// Запуск сервера
server.listen(port, host, () => {
  console.log(`Server running at http://${host}:${port}/`);
});
