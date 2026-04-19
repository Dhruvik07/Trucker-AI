const fs = require('fs');
const files = [
  'src/pages/VehiclesPage.jsx',
  'src/pages/TerminalsPage.jsx',
  'src/pages/DocumentsPage.jsx'
];
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.split("background:'#18181b'").join("background:'#ffffff'");
  c = c.split("rgba(0,0,0,0.75)").join("rgba(0,0,0,0.4)");
  c = c.split("rgba(255,255,255,0.1)").join("rgba(0,0,0,0.1)");
  c = c.split("background:'rgba(255,255,255,0.05)'").join("background:'#f8fafc'");
  c = c.split("color:'#fbbf24'").join("color:'#d97706'");
  c = c.split("color:'#f8fafc',fontSize:'0.72rem'").join("color:'#0f172a',fontSize:'0.72rem'");
  c = c.split("color:'#94a3b8',marginBottom:'0.3rem',display:'block'").join("color:'#475569',marginBottom:'0.3rem',display:'block'");
  fs.writeFileSync(f, c, 'utf8');
  console.log('Fixed: ' + f);
});
