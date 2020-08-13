import socket
import sys, os, time, errno
import tornado
import tornado.websocket
import tornado.httpserver
import asyncio

import numpy as np
import json
import socketio

# from marching_cubes import march
import mcubes
import trimesh

from os import path, pardir
main_dir = path.abspath(path.dirname(sys.argv[0]))  # Dir of main
sys.path.append(main_dir)
sys.path.append(path.join(main_dir, "system"))

from Params import Params
from annotator.Annotator.sio import sio, set_u_info
import miscellaneous.Miscellaneous as m

class CustomStaticFileHandler(tornado.web.StaticFileHandler):
    def set_extra_headers(self, path):
        self.set_header('Cache-Control', 'no-cache')

class SurfaceHandler(tornado.web.RequestHandler):
  ###
  def __init__(self, *args, **kwargs):
    self.ids_volume	= kwargs.pop('3Dmap')
    self.pitch		= kwargs.pop('pitch')
    self.surfaces_whole_path = kwargs.pop('path')
    super(SurfaceHandler, self).__init__(*args, **kwargs)
  ###
  def get(self):
    id = self.get_argument('id', 'null')
    id = int(id)
    print('Target object id:', id)
    result = self.GenerateStl(id)
    if result :
        self.write("True")
    else :
        self.write("False")
  ###
  def GenerateStl(self, id):
    mask = (self.ids_volume == id)
    try:
        # vertices, normals, faces = march(mask, 2)
        vertices, faces = mcubes.marching_cubes(mask, 0)
    except:
        print('Mesh was not generated.')
        return False
    print('Generated face number: ', faces.shape)
    vertices[:, 0] *= self.pitch[0]
    vertices[:, 1] *= self.pitch[1]
    vertices[:, 2] *= self.pitch[2]
#    vertices = vertices[:, [2,0,1]]

    filename = os.path.join(self.surfaces_whole_path, str(id).zfill(10)+'.stl')
    mesh = trimesh.Trimesh(vertices=vertices, faces=faces)
    #mesh = trimesh.smoothing.filter_humphrey(mesh)
    mesh = trimesh.smoothing.filter_laplacian(mesh, iterations=4)
    mesh.export(file_obj=filename)
    return True
  ###



class AnnotatorHandler(tornado.web.RequestHandler):
  def get(self):
    self.render('index.html')

class AnnotatorServerLogic:
  def __init__( self, u_info  ):
    ## User info
    self.u_info = u_info

	## Load volume_description
    with open(self.u_info.surfaces_volume_description_json_file, 'r') as f:
      volume_description = json.load(f)

    xpitch = volume_description['pitch_um']['x']
    ypitch = volume_description['pitch_um']['y']
    zpitch = volume_description['pitch_um']['z']
    xmax	= volume_description['boundingbox_voxel']['x']
    ymax	= volume_description['boundingbox_voxel']['y']
    zmax	= volume_description['boundingbox_voxel']['z']

    ## Artifact
    coarse_factor = 4
    xpitch *= coarse_factor
    ypitch *= coarse_factor
    self.pitch  = [xpitch, ypitch, zpitch]

	
    ## Obtain id volume
    tp = m.ObtainTileProperty(self.u_info.annotator_tile_ids_volume_file)
    self.ids_volume = np.zeros([xmax, ymax, zmax], dtype=self.u_info.ids_dtype)
    for iz in range(zmax):
    	self.ids_volume[:,:,iz] = m.ObtainFullSizeIdsPanel(self.u_info.annotator_tile_ids_path, self.u_info, tp, iz)
    self.ids_volume = self.ids_volume[::coarse_factor,::coarse_factor,:]

    return None


  def run( self ):
    ####
    web_path = os.path.join(self.u_info.web_annotator_path, "dist")
    css_path = os.path.join(self.u_info.web_annotator_path, "css")
    js_path  = os.path.join(self.u_info.web_annotator_path, "js")
    skeletons_path  = self.u_info.skeletons_path
    surfaces_path   = self.u_info.surfaces_path
    skeletons_whole_path = self.u_info.skeletons_whole_path
    surfaces_whole_path  = self.u_info.surfaces_whole_path
    ####
    # asyncio.set_event_loop(self.u_info.worker_loop_stl)
    ev_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(ev_loop)

    set_u_info(self.u_info)

    annotator = tornado.web.Application([
      (r'/css/(.*)', CustomStaticFileHandler, {'path': css_path}),
      (r'/js/(.*)', CustomStaticFileHandler, {'path': js_path}),
      (r'/surface/(.*)', CustomStaticFileHandler, {'path': surfaces_path}),
      (r'/surface/whole/(.*)', CustomStaticFileHandler, {'path': surfaces_whole_path}),
      (r'/skeleton/(.*)', CustomStaticFileHandler, {'path': skeletons_path}),
      (r'/ws/surface', SurfaceHandler, {'3Dmap': self.ids_volume, 'pitch': self.pitch ,'path': surfaces_whole_path}),
      (r'/socket.io/', socketio.get_tornado_handler(sio)),
      (r'/(.*)', CustomStaticFileHandler, {'path': web_path})
    ],debug=True,autoreload=True)


    server = tornado.httpserver.HTTPServer(annotator)
    server.listen(self.u_info.port_annotator)
    print('*'*80)
    print('*', '3D Annotator RUNNING')
    print('*')
    print('*', 'open', '[ ' + self.u_info.url_annotator  + 'index.html ] ')
    print('*'*80)

    tornado.ioloop.IOLoop.instance().start()
    #ev_loop.stop()
    #ev_loop.close()
    #server.stop()
    print("Tornado web server stops.")
    return


  def stop():
    print("Called stop")
    asyncio.asyncio_loop.stop()
    server.stop()


  def close(self, signal, frame):
    print('Sayonara..!!')
    sys.exit(0)

