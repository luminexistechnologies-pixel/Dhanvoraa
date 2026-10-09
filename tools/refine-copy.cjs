const fs=require('fs');
const file='dhanvoraa-site/build.mjs';
let text=fs.readFileSync(file,'utf8');
const changes=[
 ['Use Start saving to access the Augmont experience when the final connection is available. This preview links separately to the supplied Augmont demo and does not take payments.','Select Start saving to open the Augmont demo in a new tab. The demo link will be replaced with the final transaction experience when it is ready.'],
 ['The intended transaction experience is provided through Augmont. This website is the Dhanvoraa brand and education layer; the final integration and approved partner disclosure are pending.','Transactions are handled through the separate Augmont experience. Dhanvoraa is the brand and education website. Start saving currently opens the supplied Augmont demo.'],
 ['Website preview · Final Augmont integration pending','Start saving opens the Augmont demo'],
 ['Final integration pending. No purchases are processed on this website.','Explore the Augmont demo. Purchases are handled on the provider platform.'],
 ['The final integration is pending; the preview does not recreate its operational functionality.','Start saving currently opens the supplied Augmont demo, which will be replaced by the final transaction experience.'],
 ['Final Dhanvoraa integration pending. The supplied reference demo is available to explore.','Start saving opens the Augmont demo in a new tab. The final transaction link will be added later.'],
 ['${footer()}${dialogs()}','${footer()}'],
 ['The final integration and current provider terms must be confirmed before transactions are enabled.','Start saving currently links to the supplied Augmont demo. The final transaction experience and current provider terms will be added before public launch.']
];
for(const [from,to]of changes){if(!text.includes(from))throw Error('Missing text: '+from);text=text.replaceAll(from,to);}
fs.writeFileSync(file,text);
