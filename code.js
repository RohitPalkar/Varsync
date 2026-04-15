figma.showUI(**html**, { width: 320, height: 240 });

function getCollections() {
return figma.variables.getLocalVariableCollections();
}

async function copyCollection(collectionId) {
const collections = getCollections();
const collection = collections.find(c => c.id === collectionId);

if (!collection) {
figma.notify("Collection not found");
return;
}

const variables = figma.variables
.getLocalVariables()
.filter(v => v.variableCollectionId === collectionId);

const data = {
collection: {
name: collection.name,
modes: collection.modes
},
variables: variables.map(v => ({
name: v.name,
type: v.resolvedType,
valuesByMode: v.valuesByMode
}))
};

await figma.clientStorage.setAsync("varsync_clipboard", data);

figma.notify("Copied successfully");
}

async function pasteCollection() {
const data = await figma.clientStorage.getAsync("varsync_clipboard");

if (!data) {
figma.notify("Nothing to paste");
return;
}

const newCollection = figma.variables.createVariableCollection(
data.collection.name + " Copy"
);

data.variables.forEach(v => {
try {
figma.variables.createVariable(
v.name,
newCollection.id,
v.type
);
} catch (e) {
console.error("Failed:", v.name);
}
});

figma.notify("Pasted successfully");
}

figma.ui.onmessage = async (msg) => {
if (msg.type === "getCollections") {
figma.ui.postMessage({
type: "collections",
data: getCollections()
});
}

if (msg.type === "copy") {
await copyCollection(msg.collectionId);
}

if (msg.type === "paste") {
await pasteCollection();
}
};
