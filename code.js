figma.showUI(**html**, { width: 320, height: 240 });

function getCollections() {
try {
return figma.variables.getLocalVariableCollections();
} catch (e) {
figma.notify("Variables not supported in this file");
return [];
}
}

function getVariablesFromCollection(collection) {
try {
return collection.variableIds
.map(id => figma.variables.getVariableById(id))
.filter(v => v !== null);
} catch (e) {
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

const variables = getVariablesFromCollection(collection);

const data = {
  collection: {
    name: collection.name,
    modes: collection.modes
  },
  variables: variables.map(v => ({
    name: v.name,
    type: v.resolvedType,
    valuesByMode: v.valuesByMode || {}
  }))
};

await figma.clientStorage.setAsync("varsync_clipboard", data);

figma.notify("Copied successfully");
```

} catch (e) {
console.error(e);
figma.notify("Copy failed");
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

const modeMap = {};
modeMap[data.collection.modes[0].modeId] = newCollection.modes[0].modeId;

// Create additional modes
data.collection.modes.slice(1).forEach(mode => {
  const newModeId = newCollection.addMode(mode.name);
  modeMap[mode.modeId] = newModeId;
});

data.variables.forEach(v => {
  try {
    const newVar = figma.variables.createVariable(
      v.name,
      newCollection.id,
      v.type
    );

    Object.keys(v.valuesByMode).forEach(oldModeId => {
      const newModeId = modeMap[oldModeId];
      if (newModeId) {
        newVar.setValueForMode(newModeId, v.valuesByMode[oldModeId]);
      }
    });
  } catch (e) {
    console.error("Failed variable:", v.name);
  }
});

figma.notify("Pasted successfully");
```

} catch (e) {
console.error(e);
figma.notify("Paste failed");
}
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
