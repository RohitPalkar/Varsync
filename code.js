figma.showUI(**html**, { width: 320, height: 220 });

function getCollections() {
try {
return figma.variables.getLocalVariableCollections();
} catch (e) {
figma.notify("Error fetching collections");
return [];
}
}

async function copyCollection(collectionId) {
try {
const collections = getCollections();
const collection = collections.find(c => c.id === collectionId);

```
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
    resolvedType: v.resolvedType,
    valuesByMode: v.valuesByMode || {},
    aliasTo: null
  }))
};

await figma.clientStorage.setAsync("varsync_clipboard", data);

figma.notify("Copied successfully");
```

} catch (e) {
figma.notify("Copy failed");
console.error(e);
}
}

async function pasteCollection() {
try {
const data = await figma.clientStorage.getAsync("varsync_clipboard");

```
if (!data) {
  figma.notify("Nothing to paste");
  return;
}

const newCollection = figma.variables.createVariableCollection(
  data.collection.name + " Copy"
);

// create variables safely
data.variables.forEach(v => {
  try {
    figma.variables.createVariable(
      v.name,
      newCollection.id,
      v.resolvedType
    );
  } catch (e) {
    console.error("Variable failed:", v.name);
  }
});

figma.notify("Pasted successfully");
```

} catch (e) {
figma.notify("Paste failed");
console.error(e);
}
}

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
