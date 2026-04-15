# VarSync — MVP Specification

## 1. What this plugin does

VarSync allows users to copy a variable collection from one Figma file and paste it into another file while preserving variable relationships (aliases).

---

## 2. MVP Features

* Copy Variable Collection
* Paste Variable Collection
* Preserve alias connections

---

## 3. User Flow

1. User selects a variable collection

2. Clicks "Copy Collection"

3. Plugin reads:

   * Collection name
   * Modes
   * Variables
   * Alias relationships

4. Data is stored

5. User opens another file

6. Clicks "Paste Collection"

7. Plugin:

   * Creates new collection
   * Recreates variables
   * Reconnects aliases

---

## 4. Data Structure

The plugin stores data like this:

{
collection: {
name: "Colors",
modes: [
{ name: "Light", modeId: "1" },
{ name: "Dark", modeId: "2" }
]
},
variables: [
{
name: "Primary",
type: "COLOR",
valuesByMode: {
"1": { r: 1, g: 1, b: 1, a: 1 },
"2": { r: 0, g: 0, b: 0, a: 1 }
},
aliasTo: null
},
{
name: "Button Background",
type: "COLOR",
aliasTo: "Primary"
}
]
}

---

## 5. Alias Handling (Important)

* If a variable depends on another variable (alias), store that relationship
* While pasting:

  1. First create all variables normally
  2. Then reconnect aliases using names

---

## 6. Edge Cases

* If variable name already exists → add "Copy" suffix
* If alias target not found → skip and log error
* If collection is empty → show error
* If large collection → process safely

---

## 7. UI

* Dropdown → Select Collection
* Button → Copy Collection
* Button → Paste Collection
* Status text → Ready / Copying / Done / Error

---

## 8. Storage

* Use figma.clientStorage
* Key: "varsync_clipboard"

---

## 9. Success Criteria

* Variables copied correctly
* Aliases preserved
* Works across files
* No freezing
