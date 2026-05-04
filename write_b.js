const fs = require('fs'), path = require('path');
const out = path.join(__dirname, 'src', 'pages', 'BillingModule.jsx');
const lines = [];
const L = s => lines.push(s);
