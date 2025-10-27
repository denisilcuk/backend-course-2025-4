import { Command } from 'commander';
import fs from 'fs';
import http from 'http';

const program = new Command();

program
  .requiredOption('-i, --input <path>', 'шлях до вхідного файлу')
  .requiredOption('-h, --host <host>', 'адреса сервера')
  .requiredOption('-p, --port <port>', 'порт сервера');

program.parse(process.argv);
const options = program.opts();

// === Перевірка наявності файлу ===
if (!fs.existsSync(options.input)) {
  console.error("Error: Cannot find input file.");
  process.exit(1);
}

// === Запуск HTTP сервера ===
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Сервер працює! ✅\n');
});

server.listen(options.port, options.host, () => {
  console.log(`✅ Сервер запущено на http://${options.host}:${options.port}`);
});
