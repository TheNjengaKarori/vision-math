const fs = require('fs');

const FILE_PATH = 'src/App.tsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// The left toolbar container currently has "flex-1"
content = content.replace(
  '<div className="flex items-center flex-1 min-w-0 pr-2">',
  '<div className="flex items-center min-w-[30%] lg:min-w-[200px] pr-2">'
);

// The right toolbar container
content = content.replace(
  '<div className="flex items-center overflow-x-auto no-scrollbar flex-1 min-w-0 px-2 sm:px-4 py-3 gap-0.5 sm:gap-2 [&>*]:shrink-0">',
  '<div className="flex items-center justify-end overflow-x-auto no-scrollbar flex-1 min-w-0 px-2 sm:px-4 py-3 gap-0.5 sm:gap-2 [&>*]:shrink-0">'
);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log("Updated App.tsx");
