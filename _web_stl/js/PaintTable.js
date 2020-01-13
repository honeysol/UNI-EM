const PaintTable = new Tabulator('#PaintTable', {
	layout:"fitColumns",
	autoResize:true,
	responsiveLayout:"hide",
	tooltips:true,
	addRowPos:"top",
	history:true,
	pagination:"local",
	paginationSize:10,
	resizableRows:true,
	initialSort:[{column:"id", dir:"dsc"},],
	columns:[
	    {title: "Delete", formatter: "buttonCross",  align: "center", cellClick: function(e, cell){cell.getRow().delete()}},
	    {title: "ID", field:"id", width: 40},
	    {title: "Name", field: "name"},
   	    {title: "R", field: "r", minwidth: 30, width: 35, align: "right", visible: true, editorParams: {min:0, max: 255, step: 1}},
	    {title: "G", field: "g", minwidth: 30, width: 35, align: "right", visible: true, editorParams: {min:0, max: 255, step: 1}},
	    {title: "B", field: "b", minwidth: 30, width: 35, align: "right", visible: true, editorParams: {min:0, max: 255, step: 1}},
	    {title: "Area", field: "area"},
	    {title: "Volume", field: "volume"}
	],
});

//const deletePaint = (cell) => {
//  const data = cell.getRow().getData();
//    APP.removePaint(data.id);  // TODO
//    cell.getRow.delete();
//}

//const addPaintLayer = (event) => {

//    console.log(event);
//};
let incre = 0;
$('#button-add-paint-layer').on('click', function(event) {
    var NewMarker = {
      act: true,
      id:incre++,
      name: "Marker"+String(incre),
      radius: 1,
      r: 0,
      g: 0,
      b: 0,
      x: incre,
      y: 0,
      z: 0
    };
    var marker = {id:incre, name:String(incre), r:0, g:0, b: 0, area:0, volume: 0};

    ObjMarkerTable.addData(NewMarker);  // Change database MarkerTable (setData)
    PaintTable.addData(marker);
});


//console.log('I am here');
//$('save-paint-table-csv').on('click', (event) = {
    //    downloadPaintTableAsCSV();
//    console.log('aiueo save');
//});

//const downloadPaintTableAsCSV = () => {
    // TODO
    // id, name, color, x, y, z
    // 0, spine, #00FF00, 0, 0, 0
    // 0, spine, #00FF00, 0, 0, 0.1
    // ...
//}
