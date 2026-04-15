figma.showUI("<h3>VarSync Working</h3>", { width: 200, height: 100 });

// Get all collections
function getCollections() {
return figma.variables.getLocalVariableCollections();
}

// Get variables by collection
function getVariables(collectionId) {
return figma.variables.getLocalVariables().filter(v => v.variableCollectionId === collectionId);
}

// Copy logic
async function copyCollection(collectionId) {
const collections = getCollections();
const collection = collections.find(c => c.id === collectionId);

const variables = getVariables(collectionId);

const data = {
collection: {
name: collection.name,
modes: collection.modes
},
variables: variables.map(v => ({
name: v.name,
resolvedType: v.resolvedType,
valuesByMode: v.valuesByMode,
aliasTo: null // will improve later
}))
};

await figma.clientStorage.setAsync("varsync_clipboard", data);

figma.notify("Collection copied");
}

// Paste logic
async function pasteCollection() {
const data = await figma.clientStorage.getAsync("varsync_clipboard");

if (!data) {
figma.notify("Nothing copied");
return;
}

const newCollection = figma.variables.createVariableCollection(data.collection.name + " Copy");

// create modes
data.collection.modes.forEach(mode => {
if (mode.name !== newCollection.modes[0].name) {
newCollection.addMode(mode.name);
}
});

// create variables
data.variables.forEach(v => {
const variable = figma.variables.createVariable(v.name, newCollection.id, v.resolvedType);

```
Object.keys(v.valuesByMode).forEach(modeId => {
  try {
    variable.setValueForMode(newCollection.modes[0].modeId, v.valuesByMode[modeId]);
  } catch {}
});
```

});

figma.notify("Collection pasted");
}

// Listen UI
figma.ui.onmessage = async (msg) => {
if (msg.type === "getCollections") {
const collections = getCollections();
figma.ui.postMessage({ type: "collections", data: collections });
}

if (msg.type === "copy") {
await copyCollection(msg.collectionId);
}

if (msg.type === "paste") {
await pasteCollection();
}
};

