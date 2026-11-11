const form = document.getElementById('form');
const ipInput = document.getElementById('ip');
const prefixSelect = document.getElementById('prefix');
const resultsEl = document.getElementById('results');
const errorEl = document.getElementById('error');

function ipToInt(ip) {
  const parts = ip.split('.');
  if (parts.length !== 4) return null;
  let result = 0;
  for (const part of parts) {
    if (part === '' || !/^\d{1,3}$/.test(part)) return null;
    const n = Number(part);
    if (n < 0 || n > 255) return null;
    result = (result << 8) | n;
  }
  return result >>> 0;
}

function intToIp(n) {
  n = n >>> 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function calculate(e) {
  e.preventDefault();
  const ipStr = ipInput.value.trim();
  const prefix = Number(prefixSelect.value.replace('/', ''));
  const ipInt = ipToInt(ipStr);

  if (ipInt === null) {
    errorEl.textContent = 'Please enter a valid IPv4 address (e.g. 192.168.1.10).';
    resultsEl.hidden = true;
    return;
  }
  errorEl.textContent = '';

  const mask = prefix === 0 ? 0 : ((~0 << (32 - prefix)) >>> 0);
  const network = (ipInt & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const totalHosts = Math.pow(2, 32 - prefix);

  let usable, first, last;
  if (prefix === 32) {
    usable = 1; first = last = ipInt;
  } else if (prefix === 31) {
    usable = 2; first = network; last = broadcast;
  } else {
    usable = totalHosts - 2;
    first = network + 1;
    last = broadcast - 1;
  }

  document.getElementById('res-ip').textContent = ipStr;
  document.getElementById('res-prefix').textContent = '/' + prefix;
  document.getElementById('res-mask').textContent = intToIp(mask);
  document.getElementById('res-network').textContent = intToIp(network);
  document.getElementById('res-broadcast').textContent = intToIp(broadcast);
  document.getElementById('res-first').textContent = intToIp(first);
  document.getElementById('res-last').textContent = intToIp(last);
  document.getElementById('res-total').textContent = totalHosts.toLocaleString();
  document.getElementById('res-usable').textContent = usable.toLocaleString();
  resultsEl.hidden = false;
}

form.addEventListener('submit', calculate);