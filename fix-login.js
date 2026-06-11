const fs = require('fs');  
const p = 'src/app/features/auth/login/login.component.ts';  
const content = `import { Component } from '@angular/core';`;  
fs.writeFileSync(p, content);  
console.log('Done');  
