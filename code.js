figma.showUI(html, { width: 320, height: 240 });

function getCollections() {
try {
return figma.variables.getLocalVariableCollections();
} catch (e) {
figma.notify("Variables not supported");
return [];
}
}

function getVariablesFromCollection(collection) {
return collection.variableIds
.map(id => figma.variables.getVariableById(id))
.filter(v => v);
}

async function copyCollection(collectionId) {
try {
const collection = getCollections().find(c => c.id === collectionId);

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

figma.notify("Copied");
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

data.collection.modes.slice(1).forEach(mode => {
  const newModeId = newCollection.addMode(mode.name);
  modeMap[mode.modeId] = newModeId;
});

data.variables.forEach(v => {
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
});

figma.notify("Pasted");
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
