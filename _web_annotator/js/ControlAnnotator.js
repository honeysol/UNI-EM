import { APP } from "./APP";

//
// Shared
//
window.ChangeMode = function (mode) {
	switch (mode) {
		case "view":
			APP.MarkerMode   = 0;
			APP.SkeletonMode = 0;
			APP.cursor.visible = false;
			switchAnnotation(0);
			APP.changeSurfaceObjectOpacity(-1);
			APP.removeSkeletons();
			break;
		case "point":
			APP.MarkerMode   = 1;
			APP.SkeletonMode = 0;
			APP.cursor.visible = false;
			switchAnnotation(0);
			APP.changeSurfaceObjectOpacity(-1);
			APP.removeSkeletons();
			break;
		case "paint":
			APP.MarkerMode   = 0;
			APP.SkeletonMode = 0;
			APP.cursor.visible = true;
			switchAnnotation(1);
			APP.changeSurfaceObjectOpacity(-1);
			APP.removeSkeletons();
			break;
		case "skeleton":
			APP.MarkerMode   = 0;
			APP.SkeletonMode = 1;
			APP.cursor.visible = false;
			switchAnnotation(0);
			APP.changeSurfaceObjectOpacity(0);
			APP.addSkeletons();
		break;		
		default:
    		console.log(`Error. Mode ${mode} cannot be interpreted.`);
		}
	}
//
// app/index.jsで使っている
//
window.MarkerOffOn = function (ischecked) {
		if( ischecked == true ) {
      		APP.MarkerOffOn = 1;
   			}
		else {
			APP.MarkerOffOn = 0;
			}
      }


window.SaveImage = function (ischecked) {
	let canvas = document.getElementById("myCanvas").querySelector('canvas');

	let link = document.createElement("a");
	link.href = canvas.toDataURL("image/png");
	link.download = "Screenshot.png";
	link.click();
	}


//
// View
//
window.BackgroundWhiteBlack = function (ischecked) {
		if( ischecked == true ) {
			APP.setBackGroundColor( 0x000000 );
			APP.BackGroundColor = 'Black';
			APP.setBoundingBoxColor( 0xffffff );
   			}
		else {
		    APP.setBackGroundColor( 0xffffff );
      		APP.BackGroundColor = 'White';
      		APP.setBoundingBoxColor( 0x000000 );
			}
      }
window.FrameOffOn =  function (ischecked) {
		if( ischecked == true ) {
      		APP.addBoundingBox();
   			}
		else {
			APP.removeBoundingBox();
			}
      }
window.DirLight = function (isnum) {
		APP.directionalLight.intensity = isnum / 100;
      }

window.AmbLight = function (isnum) {
		APP.ambientLight.intensity = isnum / 100;
      }

window.CenterXY = function () {
	APP.camera.up.set(0,0,1);
	APP.camera.position.set(APP.BoundingboxMax*3.0,  APP.BoundingboxY/2.0, APP.BoundingboxX/2.0);
	APP.controls.target.set( APP.BoundingboxZ/2.0, APP.BoundingboxY/2.0, APP.BoundingboxX/2.0 );
	}

window.CenterYZ = function () {
	APP.camera.up.set(0,1,0);
	APP.camera.position.set(APP.BoundingboxZ/2.0,  APP.BoundingboxY/2.0, APP.BoundingboxMax*3.0);
	APP.controls.target.set( APP.BoundingboxZ/2.0, APP.BoundingboxY/2.0, APP.BoundingboxX/2.0 );
	}

window.CenterZX = function () {
	APP.camera.up.set(1,0,0);
	APP.camera.position.set(APP.BoundingboxZ/2.0, APP.BoundingboxMax*3.0, APP.BoundingboxX/2.0);
	APP.controls.target.set( APP.BoundingboxZ/2.0, APP.BoundingboxY/2.0, APP.BoundingboxX/2.0 );
	}



//
// Skeleton
//



//
// Paint
//

// Eraser, Radius, Overwrite
