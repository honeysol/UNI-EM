import socket
import sys, os, time, errno
import tornado
import tornado.websocket
import tornado.httpserver
import asyncio

import threading
import h5py
import numpy as np
import copy
import sqlite3
import json
import lxml
import lxml.etree
from itertools import chain, product
from skimage import measure
import socketio


from marching_cubes import march
from stl import mesh

from os import path, pardir
main_dir = path.abspath(path.dirname(sys.argv[0]))  # Dir of main
sys.path.append(main_dir)
sys.path.append(path.join(main_dir, "system"))
sys.path.append(path.join(main_dir, "plugins"))

from Params import Params
from DB import DB
from annotator.Annotator.sio import sio
import miscellaneous.Miscellaneous as m




if getattr(sys, 'frozen', False):
  # Pyinstaller
  #print('Pyinstaller')
  stldata_dir = os.path.normpath(path.join(main_dir, "../..", "data","stlviewer"))
  main_dir_   = os.path.normpath(path.join(main_dir, "../.."))
else:
  #print('Live Python')
  # Live Python
  stldata_dir = os.path.normpath(path.join(main_dir, "data","stlviewer"))
  main_dir_   = main_dir

class AnnotatorWebSocket(tornado.websocket.WebSocketHandler):
  ###
  def __init__(self, *args, **kwargs):
    self.small_ids = kwargs.pop('player')
    super(AnnotatorWebSocket, self).__init__(*args, **kwargs)
  ###
  def on_message(self, message):
    id = int(message)
    print('Target object id:', id)
    result = self.GenerateStl(id)
    if result :
        self.write_message("True")
    else :
        self.write_message("False")
  ###
  def GenerateStl(self, id):
    mask = (self.small_ids == id)
    try:
        vertices, normals, faces = march(mask, 2)
    except:
        print('Mesh was not generated.')
        return False
    print('Generated face number: ', faces.shape)
    our_mesh = mesh.Mesh(np.zeros(faces.shape[0], dtype=mesh.Mesh.dtype))
    for i, f in enumerate(faces):
        for j in range(3):
            our_mesh.vectors[i][j] = vertices[f[j], :]
    ###
    our_mesh.save(os.path.join(stldata_dir, 'i{0}.stl'.format(id) ))
    return True
  ###

class AnnotatorHandler(tornado.web.RequestHandler):
  def get(self):
    self.render('index.html')

class AnnotatorServerLogic:
  def __init__( self, u_info  ):
    ## User info
    self.u_info = u_info
    ## Load DB
    db = DB(self.u_info)

    ## Create 3D geometry

    scale_factor_xy = 2

    xmax = db.canvas_size_y / (2 ** scale_factor_xy)
    ymax = db.canvas_size_x / (2 ** scale_factor_xy)
    zmax = db.num_tiles_z
    cube_size = max([xmax, ymax, zmax])
    cube_size = np.ceil(cube_size)
    cube_size = cube_size.astype(np.int32)
    self.small_ids = np.zeros([cube_size, cube_size, cube_size], dtype=self.u_info.ids_dtype)

    for iz in range(db.num_tiles_z):
      full_map = m.ObtainFullSizeIdsPanel(self.u_info, db, iz)
      small_map = full_map[::(2 ** scale_factor_xy), ::(2 ** scale_factor_xy)]
      self.small_ids[0:small_map.shape[0], 0:small_map.shape[1], iz] = small_map

    boundingbox_dict = {'x': xmax, 'y': ymax, 'z': zmax}
    with open(os.path.join(stldata_dir, 'Boundingbox.json'), 'w') as f:
      json.dump(boundingbox_dict, f, indent=2, ensure_ascii=False)

    return None


  def rangeexpand(self, txt):
      lst = []
      for r in txt.split(','):
          if '-' in r[1:]:
              r0, r1 = r[1:].split('-', 1)
              lst += range(int(r[0] + r0), int(r1) + 1)
          else:
              lst.append(int(r))
      return lst


  def run( self ):
    ####
    path_main = os.path.join(main_dir_, "_web_stl", "dist")
    ####
    # asyncio.set_event_loop(self.u_info.worker_loop_stl)
    ev_loop = asyncio.new_event_loop()
    asyncio.set_event_loop(ev_loop)

    annotator = tornado.web.Application([
      (r'/data/(.*)', tornado.web.StaticFileHandler, {'path': stldata_dir}),
      (r'/ws/display', AnnotatorWebSocket, {'player': self.small_ids}),
      (r'/socket.io/', socketio.get_tornado_handler(sio)),
      (r'/(.*)', tornado.web.StaticFileHandler, {'path': path_main}) # This wildcard path should be the last of list
    ])
    server = tornado.httpserver.HTTPServer(annotator)
    server.listen(self.u_info.port_stl)
    print('stldata_dir: ',stldata_dir)
    print('*'*80)
    print('*', '3D Annotator RUNNING')
    print('*')
    print('*', 'open', '[ http://' + self.u_info.ip + ':' + str(self.u_info.port_stl) + '/] ')
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

