const fs = require('fs');
const crypto = require('crypto');

const filePath = 'k:\\driplo-turbo-1\\supabase\\migrations\\20250821000003_restructure_categories.sql';
let content = fs.readFileSync(filePath, 'utf8');

// Regex to find IDs like 'men-main', 'men-clothing', etc.
// They are inside INSERT INTO ... VALUES ('ID', ...
// We can look for single quoted strings that look like slugs in the first position.
// Actually, the file format is consistent: ('id', ...
// I'll just find all unique strings that are used as IDs.

const idRegex = /\('([a-z0-9-]+)',/g;
const matches = [...content.matchAll(idRegex)];
const ids = [...new Set(matches.map(m => m[1]))];

const idMap = {};
ids.forEach(id => {
    idMap[id] = crypto.randomUUID();
});

// Replace IDs in the content
// We need to replace both the ID definition and the parent_id reference.
// parent_id reference is: , 'parent-id',
// ID definition is: ('id',

let newContent = content;
ids.forEach(id => {
    const uuid = idMap[id];
    // Replace ID definition
    // Use a specific regex to avoid replacing partial matches if any (though slugs seem unique enough)
    // We replace ('id', with ('uuid',
    newContent = newContent.split(`('${id}',`).join(`('${uuid}',`);
    
    // Replace parent_id reference
    // , 'id', with , 'uuid',
    newContent = newContent.split(`, '${id}',`).join(`, '${uuid}',`);
});

fs.writeFileSync(filePath, newContent);
console.log('Replaced IDs with UUIDs');
