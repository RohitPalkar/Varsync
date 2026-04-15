figma.showUI(_html_. { width:300, height:200 }):

figma.ui.onmessage = (msg) => {
  if (msg.type === "test") {
    figma.notify("Working");
}
};
