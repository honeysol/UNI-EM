import { APP } from "./APP";
import { updatePaintObservation, paintManager } from "./SyncPaint";

const mutatorClip = (value, data, type, mutatorParams, component) => {
  const min = mutatorParams.min;
  const max = mutatorParams.max;
  return value <= min ? min :
         value >= max ? max :
         value;
}

const mutatorParamsClip = {min: 0, max: 255};

// 0-1までのなるべく離れた値を返す
const reversalBit = index => {
  let original = index, fraction = 1, value = 0;
  while(original) {
    const bit = original % 2;
    original = (original - bit) / 2;
    fraction /= 2;
    value += bit * fraction;
  }
  return value;
}

// 彩度が最大で、なるべく異なる色相の色を返す
const getRandomColor = (index) => {
  const value = ((reversalBit(index - 1)) % 1) * 3;
  const mainColorType = Math.floor(value);
  const subColorValue = Math.floor((value - mainColorType) * 255);
  const colors = [subColorValue, 255 - subColorValue];
  colors.splice(mainColorType, 0, 0);
  return {
    r: colors[0],
    g: colors[1],
    b: colors[2],
  }
}

export const updateColorOptionsOnAnnotator = () => {
  updatePaintObservation();
  const activeColors = [];
  const colorParams = {
    eraser: {r: 1, g: 1, b: 1},
  };
  const tableData = AnnotationTable.getData("active");
  let targetColorId = null;
  for (const row of tableData) {
    colorParams[row.id] = {r: row.r / 255, g: row.g / 255, b: row.b / 255};
    if(row.target) {
      targetColorId = row.id;
    } else if (row.visibility) {
      activeColors.push(row.id);
    }
  }
  if(targetColorId) {
    activeColors.unshift(targetColorId);
  }

  let colorOptions = {
    activeColors: activeColors,
    colorParams: colorParams,
    eraser: !APP.annotation_paint_mode,
    overwrite: APP.annotation_overwrite
  }
  setColorOptions(colorOptions, {meshes: APP.getMeshes()});
};

export const AnnotationTable = new Tabulator('#AnnotationTable', {
	layout:"fitColumns",
	autoResize:true,
	responsiveLayout:"hide",
	tooltips:true,
	addRowPos:"top",
	history:true,
	pagination:"local",
	paginationSize:10,
	resizableRows:true,
	movableRows: true,
	initialSort:[],
	columns:[
      {title: "Delete", formatter: "buttonCross",  hozAlign: "center", cellClick: (e, cell) => {cell.getRow().delete()}, headerSort:false},
      {title: "Visible", field:"visibility", width: 73, hozAlign:"center", formatter:"tickCross", headerSort:false, cellClick: (e, cell)=>{
        const value = cell.getRow().getData();
        cell.setValue(!value.visibility || value.target);
        updateColorOptionsOnAnnotator();
    }},
      {title: "Target", field:"target", width: 73, hozAlign:"center", formatter:"tickCross", headerSort:false, cellClick: (e, cell)=>{
        const table = AnnotationTable;
        const value = cell.getRow().getData();
        table.setData(table.getData("active").map(item => { 
          item = Object.assign({}, item);
          item.debug = true;
          item.target = value.id == item.id;
          item.visibility = item.visibility || item.target;
          return item;  
        }))
        updateColorOptionsOnAnnotator();
      }},
	    {title: "ID", field:"id", width: 40, headerSort:false},
	    {title: "Name", field: "name", headerSort:false},
   	  {title: "R", field: "r", minWidth: 30, width: 35, hozAlign: "right", visible: true, editor: "number", editorParams: {min:0, max: 255, step: 1}, mutator: mutatorClip, mutatorParams: mutatorParamsClip, headerSort:false},
	    {title: "G", field: "g", minWidth: 30, width: 35, hozAlign: "right", visible: true, editor: "number", editorParams: {min:0, max: 255, step: 1}, mutator: mutatorClip, mutatorParams: mutatorParamsClip, headerSort:false},
	    {title: "B", field: "b", minWidth: 30, width: 35, hozAlign: "right", visible: true, editor: "number", editorParams: {min:0, max: 255, step: 1}, mutator: mutatorClip, mutatorParams: mutatorParamsClip, headerSort:false},
	    {title: "Area", field: "area", headerSort:false},
	    {title: "Volume", field: "volume", headerSort:false}
	],  
  rowMoved: (row) => {
    updateColor();
  },
  rowDeleted: (row) => {
    updateColor();
  },
  rowAdded: (row) => {
    updateColor();
  }
});


const updateColor = () => {
  updateColorOptionsOnAnnotator()
  paintManager.updateList({ list: AnnotationTable.getData(), lastPaintId })
};

window.switchAnnotation = (checked) => {
	APP.annotation_mode = checked;
	APP.controls.noRotate = checked;
}; 

window.switchEraserAnnotation = (checked) => {
	APP.annotation_paint_mode = checked;
  updateColorOptionsOnAnnotator()
};

window.setAnnotationOverwrite = (checked) => {
  APP.annotation_overwrite = checked;
  updateColorOptionsOnAnnotator()
}

let lastPaintId = 0;
$('#button-add-annotation-layer').on('click', (event) => {
    lastPaintId++;
    const hasTarget = AnnotationTable.getData("active").some(item => item.target);
    var layer = Object.assign({id: lastPaintId, name: "Layer" + String(lastPaintId), area:0, volume: 0, visibility: true, target: !hasTarget}, getRandomColor(lastPaintId));
    AnnotationTable.addData(layer);
    updateColorOptionsOnAnnotator()
});

$('#save-annotation-table-csv').on('click', (event) => {
  downloadAnnotationTableAsCSV();
});

const downloadAnnotationTableAsCSV = () => {
  const tableData = AnnotationTable.getData("active");
  const csvData = [["id", "name", "r", "g", "b", "area"]]
  for (const row of tableData) {
    csvData.push([row.id, row.name, row.r, row.g, row.b]);
  }

  const csvContent = "data:text/csv;charset=utf-8," +
  csvData.map(e => e.join(",")).join("\n");
  const encodeUri = encodeURI(csvContent);
  // window.open(encodeUri); This also download CSV file
  
  const link = document.createElement("a");
  link.setAttribute("href", encodeUri);
  link.setAttribute("download", "annotation.csv");
  document.body.appendChild(link);
  link.click();
};

paintManager.emitter.on("update", data => {
  if(data.room_id === "list") {
    AnnotationTable.setData(data.list || []);
    lastPaintId = data.lastPaintId;
  }
})

window._AnnotationTable = AnnotationTable;

