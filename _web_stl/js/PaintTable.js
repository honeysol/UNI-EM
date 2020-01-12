const PaintTable = new Tabulator('#PaintTable', {
    ajaxURL: "./data/segmentInfo.json",
    layout: "fitColumns",
    autoResize: true,
    responsiveLayout: "hide",
    tooltips: true,
    addRowPos: "top",
    history: true,
    pagination: "local",
    resizableRows: true,
    initialSort: [{column: "name", dir: "asc"}],
    columns: [
	{title: "Disable", field: "disable", download: true, visible: true, align: "center", editor: "tickCross", editable: onDeleteCheck},
	{title: "Visible", field: "visible", download: true, visible: true },
	{title: "ID", field: "id", download: true, visible: true},
	{title: "Name", field: "name", download: true, visible: true},
	{title: "R", field: "r", download: true, visible: true, minwidth: 30, width: 35, align: "right", visible: true, editorParams: {min:0, max: 255, step: 1}},
	{title: "G", field: "g", download: true, visible: true, minwidth: 30, width: 35, align: "right", visible: true, editorParams: {min:0, max: 255, step: 1}},
	{title: "B", field: "b", download: true, visible: true, minwidth: 30, width: 35, align: "right", visible: true, editorParams: {min:0, max: 255, step: 1}},
	{title: "Area", field: "area", download: true, visible: true},
	{title: "Volume", field: "volume", download: true, visible: true}
    ],	
    cellEdited: function(cell) {}
})

//const onDeleteCheck = (cell) => {
//    const data = cell.getRow().getData();
//    APP.removePaint(data.id);  // TODO
//    cell.getRow.delete();
//}

//$('#button-add-paint-layer').on('click', event = {
//    PaintTable.addData([{disable: false, visible: true, name: "New layer", r: 0, g: 0, b: 0, area: 0, volume: "-"}], true)
//})

//$('save-paint-table-csv').on('click', event = {
//    downloadPaintTableAsCSV();
//});

//const downloadPaintTableAsCSV = () => {
    // TODO
    // id, name, color, x, y, z
    // 0, spine, #00FF00, 0, 0, 0
    // 0, spine, #00FF00, 0, 0, 0.1
    // ...
//};
